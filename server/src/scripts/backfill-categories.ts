import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BATCH_SIZE = 200

/** Вид животного берём из авто-тегов подбора: они уже выверены и покрыты тестами. */
const SPECIES_TO_SLUG: Record<string, string> = {
  'species:cat': 'cats-food',
  'species:dog': 'dogs-food',
}

async function main() {
  const apply = process.argv.includes('--apply')

  const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } })
  const bySlug = new Map(categories.map((c) => [c.slug, c]))

  for (const slug of Object.values(SPECIES_TO_SLUG)) {
    if (!bySlug.has(slug)) {
      throw new Error(`В базе нет категории «${slug}» — привязывать некуда`)
    }
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      quizTags: true,
      autoQuizTags: true,
      categories: { select: { categoryId: true } },
    },
  })

  const withoutCategory = products.filter((p) => p.categories.length === 0)

  const plan: Array<{ id: string; name: string; categoryId: string; slug: string }> = []
  const unresolved: string[] = []

  for (const p of withoutCategory) {
    const tags = [...p.quizTags, ...p.autoQuizTags]
    const species = Object.keys(SPECIES_TO_SLUG).find((s) => tags.includes(s))
    if (!species) {
      unresolved.push(p.name)
      continue
    }
    const slug = SPECIES_TO_SLUG[species]
    plan.push({ id: p.id, name: p.name, categoryId: bySlug.get(slug)!.id, slug })
  }

  console.log('\n════════ ПРИВЯЗКА ТОВАРОВ К КАТЕГОРИЯМ ════════')
  console.log(`Режим: ${apply ? 'ПРИМЕНЕНИЕ' : 'предпросмотр (без записи)'}`)
  console.log(`\nАктивных товаров:        ${products.length}`)
  console.log(`Уже в категориях:        ${products.length - withoutCategory.length}`)
  console.log(`Без категории:           ${withoutCategory.length}`)
  console.log(`Будет привязано:         ${plan.length}`)
  console.log(`Останется без категории: ${unresolved.length}`)

  const perSlug = new Map<string, number>()
  for (const row of plan) perSlug.set(row.slug, (perSlug.get(row.slug) ?? 0) + 1)
  console.log('\n--- По категориям ---')
  for (const [slug, count] of perSlug) {
    console.log(`  ${slug.padEnd(12)} ${count}`)
  }

  if (unresolved.length > 0) {
    console.log(`\n--- Вид не определён (${unresolved.length}), первые 15 ---`)
    for (const name of unresolved.slice(0, 15)) console.log(`  • ${name.slice(0, 70)}`)
  }

  if (!apply) {
    console.log('\n📌 Предпросмотр. Ничего не записано. Для применения — флаг --apply\n')
    return
  }

  for (let i = 0; i < plan.length; i += BATCH_SIZE) {
    const batch = plan.slice(i, i + BATCH_SIZE)
    await prisma.productCategory.createMany({
      data: batch.map((row) => ({ productId: row.id, categoryId: row.categoryId })),
      skipDuplicates: true,
    })
  }

  console.log(`\n✅ Привязано товаров: ${plan.length}.\n`)
}

main()
  .catch((err) => {
    console.error('❌', err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
