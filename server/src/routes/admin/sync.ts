import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { checkRole } from '../../middleware/check-role'
import { runMoyskladSyncTracked } from '../../services/moysklad/run'
import { SyncAlreadyRunningError } from '../../services/moysklad/history'

const bodySchema = z.object({
  dryRun: z.boolean().default(true),
})

const syncRoutes: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  // Запуск. Отвечаем сразу: прогон идёт минуты, а nginx рвёт соединение на 60 секундах.
  app.post('/moysklad', guard, async (request, reply) => {
    const result = bodySchema.safeParse(request.body ?? {})
    if (!result.success) {
      return reply.status(400).send({ error: 'Неверные параметры запуска' })
    }

    const apply = !result.data.dryRun

    const running = await app.prisma.syncRun.findFirst({
      where: { status: 'running' },
      orderBy: { startedAt: 'desc' },
      select: { id: true },
    })
    if (running) {
      return reply.status(409).send({ error: 'Синхронизация уже выполняется', runId: running.id })
    }

    let runId: string
    try {
      const started = runMoyskladSyncTracked({
        prisma: app.prisma,
        apply,
        force: false,
        trigger: 'admin',
      })

      // Ошибку внутри прогона фиксирует сам runMoyskladSyncTracked — здесь только
      // гасим необработанное отклонение, чтобы процесс не падал.
      started.catch((err) => {
        app.log.error({ err }, 'Синхронизация с МойСклад завершилась ошибкой')
      })

      // Ждём только появления записи прогона, а не его окончания.
      const created = await app.prisma.syncRun.findFirst({
        orderBy: { startedAt: 'desc' },
        select: { id: true },
      })
      runId = created?.id ?? ''
    } catch (err) {
      if (err instanceof SyncAlreadyRunningError) {
        return reply.status(409).send({ error: err.message, runId: err.runId })
      }
      throw err
    }

    return reply.status(202).send({ runId })
  })

  app.get('/moysklad', guard, async () => {
    const [last, lastSuccess, history] = await Promise.all([
      app.prisma.syncRun.findFirst({ orderBy: { startedAt: 'desc' } }),
      app.prisma.syncRun.findFirst({
        where: { status: 'success', dryRun: false },
        orderBy: { startedAt: 'desc' },
      }),
      app.prisma.syncRun.findMany({ orderBy: { startedAt: 'desc' }, take: 20 }),
    ])

    return { last, lastSuccess, history }
  })

  app.get('/moysklad/:id', guard, async (request, reply) => {
    const { id } = request.params as { id: string }
    const run = await app.prisma.syncRun.findUnique({ where: { id } })

    if (!run) return reply.status(404).send({ error: 'Прогон не найден' })
    return run
  })
}

export default syncRoutes
