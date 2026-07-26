/**
 * Скрипт этап 3: синхронизация цен и остатков из МойСклада.
 *
 * Сухой запуск (по умолчанию):
 *   npx tsx server/src/scripts/sync-moysklad.ts
 *
 * С применением:
 *   npx tsx server/src/scripts/sync-moysklad.ts --apply
 *
 * Игнорирование проверки аномалий (принудительное применение):
 *   npx tsx server/src/scripts/sync-moysklad.ts --apply --force
 */
import { PrismaClient } from '@prisma/client'
import { runMoyskladSync } from '../services/moysklad/run.js'

const prisma = new PrismaClient()
const apply = process.argv.includes('--apply')
const force = process.argv.includes('--force')

function formatReport(report: Awaited<ReturnType<typeof runMoyskladSync>>) {
  const lines: string[] = []

  lines.push('='.repeat(80))
  lines.push('ОТЧЁТ СИНХРОНИЗАЦИИ МОЙСКЛАД\n')

  lines.push(`📡 Получено из МойСклада: ${report.receivedFromMs}`)
  lines.push(`🔗 Сматчено с нашей БД: ${report.matched}`)
  lines.push(`✅ Обновлено цен: ${report.pricesUpdated}`)
  lines.push(`📦 Обновлено остатков: ${report.stocksUpdated}`)
  lines.push(`🏪 Активировано товаров: ${report.productsActivated}`)
  lines.push(`⏭️  Пропущено (нулевая цена): ${report.skippedZeroPrice}`)
  lines.push(`⏭️  Пропущено (падение цены): ${report.skippedPriceDrop}`)
  lines.push(`❌ Не найдены в МойСладе: ${report.notFoundInMs}`)

  if (report.examples.ambiguous.length > 0) {
    lines.push(`\n⚠️  Неоднозначные артикулы: ${report.examples.ambiguous.length}`)
    report.examples.ambiguous.slice(0, 5).forEach(({ key, names }) => {
      lines.push(`  "${key}" → ${names.slice(0, 3).join(', ')}${names.length > 3 ? ` (+${names.length - 3})` : ''}`)
    })
  }

  if (report.examples.notFoundInMs.length > 0) {
    lines.push(`\nНе найдены в МойСладе (примеры):`)
    report.examples.notFoundInMs.slice(0, 5).forEach((v) => {
      lines.push(`  ${v.sku || '(без SKU)'}`)
    })
    if (report.examples.notFoundInMs.length > 5) {
      lines.push(`  ... и ещё ${report.examples.notFoundInMs.length - 5}`)
    }
  }

  if (report.examples.onlyInMs.length > 0) {
    lines.push(`\nПозиции МойСклада без пары (примеры):`)
    report.examples.onlyInMs.slice(0, 5).forEach((item) => {
      lines.push(`  ${item.article || item.code || '(без кода)'} | ${item.name}`)
    })
    if (report.examples.onlyInMs.length > 5) {
      lines.push(`  ... и ещё ${report.examples.onlyInMs.length - 5}`)
    }
  }

  if (report.examples.skippedZeroPrice.length > 0) {
    lines.push(`\nПропущены позиции с нулевой ценой (примеры):`)
    report.examples.skippedZeroPrice.slice(0, 5).forEach((entry) => {
      lines.push(`  ${entry.name}`)
    })
    if (report.examples.skippedZeroPrice.length > 5) {
      lines.push(`  ... и ещё ${report.examples.skippedZeroPrice.length - 5}`)
    }
  }

  if (report.examples.skippedPriceDrop.length > 0) {
    lines.push(`\nПропущены позиции с падением цены (примеры):`)
    report.examples.skippedPriceDrop.slice(0, 5).forEach((entry) => {
      if (entry.newPrice !== null) {
        const drop = ((entry.oldPrice - entry.newPrice) / entry.oldPrice * 100).toFixed(1)
        lines.push(`  ${entry.name} (${entry.oldPrice} → ${entry.newPrice}, падение ${drop}%)`)
      } else {
        lines.push(`  ${entry.name} (${entry.oldPrice} → нулевая цена)`)
      }
    })
    if (report.examples.skippedPriceDrop.length > 5) {
      lines.push(`  ... и ещё ${report.examples.skippedPriceDrop.length - 5}`)
    }
  }

  lines.push('\n' + '='.repeat(80))

  return lines.join('\n')
}

async function main() {
  try {
    console.log('🔄 Синхронизация МойСклад...\n')

    const report = await runMoyskladSync({
      prisma,
      apply,
      force,
    })

    console.log(formatReport(report))

    if (!apply) {
      console.log('\n✅ СУХОЙ ЗАПУСК — никакие данные не изменены.\n')
      console.log('Запустите с флагом --apply чтобы применить изменения:\n')
      console.log('  npx tsx server/src/scripts/sync-moysklad.ts --apply\n')
    } else if (report.pricesUpdated === 0 && report.stocksUpdated === 0) {
      console.log('\n⚠️  Нечего обновлять.\n')
    } else {
      console.log('\n✅ Синхронизация завершена.\n')
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Ошибка:', error.message)
    } else {
      console.error('❌ Ошибка:', error)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
