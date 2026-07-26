import type { PrismaClient } from '@prisma/client'
import type { SyncReport } from './plan'

export type SyncTrigger = 'cron' | 'admin' | 'manual'

const STALE_MINUTES = Number(process.env.SYNC_STALE_MINUTES) || 15

export class SyncAlreadyRunningError extends Error {
  constructor(public runId: string) {
    super('Синхронизация уже выполняется')
  }
}

/**
 * Занимает «слот» прогона. Запись со статусом running — это и есть лок:
 * второй запуск (кнопка в админке или cron) упрётся в неё и не стартует.
 * Зависший прогон старше STALE_MINUTES помечается failed и не мешает.
 */
export async function startRun(
  prisma: PrismaClient,
  trigger: SyncTrigger,
  dryRun: boolean
): Promise<string> {
  const running = await prisma.syncRun.findFirst({
    where: { status: 'running' },
    orderBy: { startedAt: 'desc' },
  })

  if (running) {
    const ageMinutes = (Date.now() - running.startedAt.getTime()) / 60000
    if (ageMinutes < STALE_MINUTES) {
      throw new SyncAlreadyRunningError(running.id)
    }

    await prisma.syncRun.update({
      where: { id: running.id },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        error: 'Прогон не завершился — вероятно, процесс был прерван',
      },
    })
  }

  const run = await prisma.syncRun.create({
    data: { trigger, dryRun },
    select: { id: true },
  })

  return run.id
}

/** Списки в отчёте обрезаем: иначе строка Json вырастает до мегабайтов. */
function trimReport(report: SyncReport) {
  const cut = <T>(list: T[]) => list.slice(0, 50)
  return {
    ...report,
    examples: {
      skippedZeroPrice: cut(report.examples.skippedZeroPrice),
      skippedPriceDrop: cut(report.examples.skippedPriceDrop),
      notFoundInMs: cut(report.examples.notFoundInMs),
      onlyInMs: cut(report.examples.onlyInMs),
      ambiguous: cut(report.examples.ambiguous),
    },
  }
}

export async function finishRun(
  prisma: PrismaClient,
  runId: string,
  status: 'success' | 'aborted',
  report: SyncReport
): Promise<void> {
  await prisma.syncRun.update({
    where: { id: runId },
    data: {
      status,
      finishedAt: new Date(),
      itemsFromMs: report.receivedFromMs,
      matched: report.matched,
      priceUpdated: report.pricesUpdated,
      stockUpdated: report.stocksUpdated,
      productsActivated: report.productsActivated,
      missingInMs: report.notFoundInMs,
      skipped: report.skippedZeroPrice + report.skippedPriceDrop,
      report: trimReport(report) as object,
    },
  })
}

export async function failRun(
  prisma: PrismaClient,
  runId: string,
  error: unknown
): Promise<void> {
  await prisma.syncRun.update({
    where: { id: runId },
    data: {
      status: 'failed',
      finishedAt: new Date(),
      error: error instanceof Error ? error.message : String(error),
    },
  })
}
