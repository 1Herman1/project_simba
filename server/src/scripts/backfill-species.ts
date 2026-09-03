import { PrismaClient, type ProductSpecies } from '@prisma/client'
import { determineSpecies } from '../services/quiz-autotag.js'

const prisma = new PrismaClient()

type Product = {
  id: string
  name: string
  species: ProductSpecies
  quizTags: string[]
  autoQuizTags: string[]
  categories: Array<{ category: { slug: string } }>
  brand: { name: string } | null
}

type SpeciesDecision = {
  productId: string
  name: string
  brandName: string | null
  categorySlugs: string[]
  currentSpecies: ProductSpecies
  newSpecies: ProductSpecies
  reason: string
  isDisputed: boolean
}

// Порядок доверия для определения вида:
// 1. Существующие теги species:* в quizTags/autoQuizTags (товар уже размечен)
// 2. Оба вида в названии → both (универсальный уход)
// 3. Один вид в названии → cat/dog (явное упоминание)
// 4. determineSpecies из quiz-autotag (вторичный анализ названия и категорий)
// 5. Категории напрямую (cats-food / dogs-food)
// 6. Спорное или не определено → unknown

function getTagSpecies(tags: string[]): ProductSpecies | null {
  for (const tag of tags) {
    if (tag === 'species:cat') return 'cat'
    if (tag === 'species:dog') return 'dog'
    if (tag === 'species:both') return 'both'
  }
  return null
}

function normalizeCase(s: string): string {
  return s.toLowerCase().replace(/ё/g, 'е')
}

function containsSubstring(haystack: string, needle: string): boolean {
  return normalizeCase(haystack).includes(normalizeCase(needle))
}

function checkBothSpeciesInName(name: string): boolean {
  // Если в названии упоминаются оба вида, это универсальный товар
  const nameLower = normalizeCase(name)
  const mentionsCat = containsSubstring(nameLower, 'кошек') || containsSubstring(nameLower, 'кошки')
  const mentionsDog = containsSubstring(nameLower, 'собак')
  return mentionsCat && mentionsDog
}

function checkOneSpeciesInName(name: string): ProductSpecies | null {
  const nameLower = normalizeCase(name)
  const mentionsCat =
    containsSubstring(nameLower, 'для кошек') ||
    containsSubstring(nameLower, 'кошачий') ||
    normalizeCase(name).match(/\bcat\b/)
  const mentionsDog =
    containsSubstring(nameLower, 'для собак') ||
    containsSubstring(nameLower, 'собачий') ||
    normalizeCase(name).match(/\bdog\b/)

  if (mentionsCat && !mentionsDog) return 'cat'
  if (mentionsDog && !mentionsCat) return 'dog'
  return null
}

function getCategorySpecies(categorySlugs: string[]): ProductSpecies | null {
  const path = categorySlugs.map(normalizeCase).join(' ')
  if (path.includes('cats-') || path.includes('cat-')) return 'cat'
  if (path.includes('dogs-') || path.includes('dog-')) return 'dog'
  return null
}

async function determineProductSpecies(product: Product): Promise<{
  species: ProductSpecies
  reason: string
  isDisputed: boolean
}> {
  const categorySlugs = product.categories.map((c) => c.category.slug)

  // 1. Существующие теги (товар уже размечен)
  const tagSpecies = getTagSpecies(product.quizTags)
  if (tagSpecies && tagSpecies !== 'unknown') {
    return { species: tagSpecies, reason: 'тег в quizTags', isDisputed: false }
  }

  const autoTagSpecies = getTagSpecies(product.autoQuizTags)
  if (autoTagSpecies && autoTagSpecies !== 'unknown') {
    return { species: autoTagSpecies, reason: 'тег в autoQuizTags', isDisputed: false }
  }

  // 2. Оба вида в названии → both
  if (checkBothSpeciesInName(product.name)) {
    return { species: 'both', reason: 'оба вида в названии', isDisputed: false }
  }

  // 3. Один вид в названии
  const nameSpecies = checkOneSpeciesInName(product.name)
  if (nameSpecies) {
    return { species: nameSpecies, reason: 'вид в названии товара', isDisputed: false }
  }

  // 4. determineSpecies из quiz-autotag
  const autotagSpecies = determineSpecies(product.name, categorySlugs)
  if (autotagSpecies === 'cat' || autotagSpecies === 'dog') {
    return {
      species: autotagSpecies,
      reason: 'определено по названию и категориям (quiz-autotag)',
      isDisputed: false,
    }
  }

  // 5. Категории напрямую
  const categorySpecies = getCategorySpecies(categorySlugs)
  if (categorySpecies) {
    return { species: categorySpecies, reason: 'определено по категориям', isDisputed: false }
  }

  // 6. Не определено → unknown, но это спорное значение
  return { species: 'unknown', reason: 'не определено', isDisputed: true }
}

async function main() {
  const apply = process.argv.includes('--apply')

  console.log('\n════════════════════════════════════════════════════════════════════')
  console.log('  Разметка вида животного для товаров (species)')
  console.log('════════════════════════════════════════════════════════════════════')
  console.log(`Режим: ${apply ? '✅ ПРИМЕНЕНИЕ' : '📋 ПРЕДПРОСМОТР (без записи)'}\n`)

  // Загружаем все товары с категориями и тегами
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      species: true,
      quizTags: true,
      autoQuizTags: true,
      categories: { select: { category: { select: { slug: true } } } },
      brand: { select: { name: true } },
    },
  })

  console.log(`📊 Всего товаров в базе: ${products.length}\n`)

  const decisions: SpeciesDecision[] = []
  const statsBySpecies = new Map<ProductSpecies, number>()
  const statesByReason = new Map<string, number>()

  // Определяем вид для каждого товара
  for (const product of products) {
    const { species: newSpecies, reason, isDisputed } = await determineProductSpecies(product)

    // Только добавляем в список если есть изменение или это спорный товар
    if (newSpecies !== product.species || isDisputed) {
      decisions.push({
        productId: product.id,
        name: product.name,
        brandName: product.brand?.name ?? null,
        categorySlugs: product.categories.map((c) => c.category.slug),
        currentSpecies: product.species,
        newSpecies,
        reason,
        isDisputed,
      })
    }

    // Статистика
    statsBySpecies.set(newSpecies, (statsBySpecies.get(newSpecies) ?? 0) + 1)
    statesByReason.set(reason, (statesByReason.get(reason) ?? 0) + 1)
  }

  // Выводим результаты по видам
  console.log('📈 РАСПРЕДЕЛЕНИЕ ПО ВИДАМ:')
  // Пары типизируем явно: без этого выводится string | number, и сборка
  // спотыкается на padEnd. tsx такое пропускает, tsc — нет.
  const rows: Array<[ProductSpecies, number]> = [
    ['cat', statsBySpecies.get('cat') ?? 0],
    ['dog', statsBySpecies.get('dog') ?? 0],
    ['both', statsBySpecies.get('both') ?? 0],
    ['unknown', statsBySpecies.get('unknown') ?? 0],
  ]
  for (const [species, count] of rows) {
    const percent = (count / products.length) * 100
    console.log(`  ${species.padEnd(10)} ${String(count).padStart(3)}  (${percent.toFixed(1).padStart(5)}%)`)
  }

  // Выводим статистику по методам определения
  console.log('\n📊 КАК ОПРЕДЕЛЯЛИСЬ:')
  const reasonsArray = Array.from(statesByReason.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  for (const [reason, count] of reasonsArray) {
    console.log(`  ${reason.padEnd(50)} ${String(count).padStart(3)}`)
  }

  // Выводим спорные товары
  const disputed = decisions.filter((d) => d.isDisputed)
  if (disputed.length > 0) {
    console.log(`\n⚠️  ТРЕБУЕТ РЕШЕНИЯ ВЛАДЕЛЬЦА (${disputed.length} товаров):\n`)
    for (const d of disputed) {
      // Владельцу нужны бренд и разделы, чтобы решить, а не идентификатор:
      // раньше здесь под подписью «Категории» печаталось само название товара.
      console.log(`  • ${d.name}`)
      console.log(`    Бренд: ${d.brandName ?? 'не указан'}`)
      console.log(`    Разделы: ${d.categorySlugs.length ? d.categorySlugs.join(', ') : 'нет'}`)
      console.log(`    id: ${d.productId}\n`)
    }
  }

  // Выводим товары которые будут изменены
  const toChange = decisions.filter((d) => d.currentSpecies !== d.newSpecies)
  if (toChange.length > 0) {
    console.log(`\n📝 БУДЕТ ИЗМЕНЕНО (${toChange.length} товаров):`)
    for (const d of toChange.slice(0, 20)) {
      const arrow = `${d.currentSpecies.padEnd(8)} → ${d.newSpecies.padEnd(8)}`
      console.log(`  ${arrow}  ${d.name.slice(0, 60)}`)
    }
    if (toChange.length > 20) {
      console.log(`  ... и ещё ${toChange.length - 20} товаров`)
    }
  }

  // Если режим предпросмотра
  if (!apply) {
    console.log(
      '\n📌 Это предпросмотр. Ничего не записано в базу. Для применения запустите с флагом --apply\n'
    )
    return
  }

  // Применяем изменения
  console.log('\n⏳ Применяем изменения в базу...\n')
  let updated = 0
  for (const d of decisions) {
    if (d.currentSpecies !== d.newSpecies) {
      await prisma.product.update({
        where: { id: d.productId },
        data: { species: d.newSpecies },
      })
      updated++
    }
  }

  console.log(`✅ Успешно обновлено ${updated} товаров.`)
  console.log(`⚠️  ${disputed.length} товаров остались с видом unknown — требует ручной проверки.\n`)
}

main()
  .catch((err) => {
    console.error('❌ Ошибка:', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
