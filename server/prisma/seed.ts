import { PrismaClient, UserRole, FilterType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Категории
  const catFood = await prisma.category.upsert({
    where: { slug: 'cats-food' },
    update: {},
    create: { name: 'Корм для кошек', slug: 'cats-food', isActive: true, sortOrder: 1 },
  })

  const dogFood = await prisma.category.upsert({
    where: { slug: 'dogs-food' },
    update: {},
    create: { name: 'Корм для собак', slug: 'dogs-food', isActive: true, sortOrder: 2 },
  })

  const treats = await prisma.category.upsert({
    where: { slug: 'treats' },
    update: {},
    create: { name: 'Лакомства', slug: 'treats', isActive: true, sortOrder: 3 },
  })

  console.log('Categories:', catFood.name, dogFood.name, treats.name)

  // Бренды
  const royalCanin = await prisma.brand.upsert({
    where: { slug: 'royal-canin' },
    update: {},
    create: { name: 'Royal Canin', slug: 'royal-canin' },
  })

  const hills = await prisma.brand.upsert({
    where: { slug: 'hills' },
    update: {},
    create: { name: "Hill's", slug: 'hills' },
  })

  console.log('Brands:', royalCanin.name, hills.name)

  // Фильтры
  const speciesFilter = await prisma.filter.upsert({
    where: { slug: 'species' },
    update: {},
    create: {
      name: 'Вид животного',
      slug: 'species',
      type: FilterType.checkbox,
      values: {
        create: [
          { value: 'Кошки', slug: 'cats' },
          { value: 'Собаки', slug: 'dogs' },
        ],
      },
    },
  })

  const healthFilter = await prisma.filter.upsert({
    where: { slug: 'health' },
    update: {},
    create: {
      name: 'Проблема здоровья',
      slug: 'health',
      type: FilterType.checkbox,
      values: {
        create: [
          { value: 'Почечная недостаточность', slug: 'kidney' },
          { value: 'Мочекаменная болезнь', slug: 'urinary' },
          { value: 'Ожирение', slug: 'obesity' },
          { value: 'Чувствительное пищеварение', slug: 'sensitive-digestion' },
        ],
      },
    },
  })

  const weightFilter = await prisma.filter.upsert({
    where: { slug: 'package-weight' },
    update: {},
    create: { name: 'Вес упаковки', slug: 'package-weight', type: FilterType.range },
  })

  console.log('Filters:', speciesFilter.name, healthFilter.name, weightFilter.name)

  // Тестовый товар Royal Canin Renal
  const renalProduct = await prisma.product.upsert({
    where: { slug: 'royal-canin-renal' },
    update: {},
    create: {
      name: 'Royal Canin Renal',
      slug: 'royal-canin-renal',
      description:
        'Полнорационный диетический корм для взрослых кошек при хронической почечной недостаточности.',
      brandId: royalCanin.id,
      images: [],
      isGrainFree: false,
      isHypoallergenic: false,
      protein: 25.0,
      fat: 20.0,
      fiber: 0.6,
      ash: 4.5,
      isActive: true,
    },
  })

  // Варианты товара — цены в копейках (89900 = 899 руб)
  for (const variant of [
    { weight: 0.5, price: 89900, oldPrice: 99900, stock: 45, sku: 'RC-RENAL-0.5' },
    { weight: 2, price: 249900, oldPrice: 279900, stock: 23, sku: 'RC-RENAL-2' },
    { weight: 4, price: 419900, oldPrice: null, stock: 12, sku: 'RC-RENAL-4' },
  ]) {
    await prisma.productVariant.upsert({
      where: { sku: variant.sku },
      update: {},
      create: { productId: renalProduct.id, ...variant },
    })
  }

  await prisma.productCategory.upsert({
    where: { productId_categoryId: { productId: renalProduct.id, categoryId: catFood.id } },
    update: {},
    create: { productId: renalProduct.id, categoryId: catFood.id },
  })

  console.log('Product:', renalProduct.name, '— 3 variants')

  // Суперадмин
  const admin = await prisma.user.upsert({
    where: { email: 'admin@simbazoo.ru' },
    update: {},
    create: {
      email: 'admin@simbazoo.ru',
      name: 'Администратор Simba',
      role: UserRole.super_admin,
      isActive: true,
    },
  })

  console.log('Admin:', admin.email)
  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
