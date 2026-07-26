import { PrismaClient } from '@prisma/client'

/**
 * Защита от катастрофы.
 *
 * Эти тесты чистят таблицы. Запуск против боевой базы уничтожит магазин,
 * поэтому проверки идут ДО любого обращения к БД и до создания PrismaClient.
 */

const testDatabaseUrl = process.env.TEST_DATABASE_URL

export const hasTestDb = Boolean(testDatabaseUrl)

export const skipReason =
  'ПРОПУСК: интеграционные тесты требуют переменную TEST_DATABASE_URL ' +
  '(отдельная база с именем, оканчивающимся на _test). Без неё они не запускаются.'

if (!hasTestDb) {
  console.warn(`\n${skipReason}\n`)
}

function assertSafeTestDatabase(url: string) {
  if (process.env.DATABASE_URL && url === process.env.DATABASE_URL) {
    throw new Error(
      'Отказ: TEST_DATABASE_URL совпадает с DATABASE_URL — это боевая база'
    )
  }

  let dbName: string
  try {
    dbName = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
  } catch {
    throw new Error('Отказ: TEST_DATABASE_URL не является корректным URL')
  }

  if (!dbName.endsWith('_test')) {
    throw new Error('Отказ: имя тестовой базы должно оканчиваться на _test')
  }
}

let prismaSingleton: PrismaClient | null = null

if (hasTestDb) {
  assertSafeTestDatabase(testDatabaseUrl!)
  // Приложение (plugins/prisma.ts) читает DATABASE_URL — подменяем на тестовую
  // уже ПОСЛЕ всех проверок.
  process.env.DATABASE_URL = testDatabaseUrl!
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
  process.env.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
  process.env.ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174'

  prismaSingleton = new PrismaClient({
    datasources: { db: { url: testDatabaseUrl! } },
  })
}

export function getTestPrisma(): PrismaClient {
  if (!prismaSingleton) {
    throw new Error(skipReason)
  }
  return prismaSingleton
}

const TABLES = [
  'order_items',
  'orders',
  'cart_items',
  'carts',
  'favorites',
  'comparison_products',
  'comparisons',
  'subscriptions',
  'product_filter_values',
  'product_categories',
  'product_variants',
  'products',
  'categories',
  'brands',
  'category_filters',
  'filter_values',
  'filters',
  'addresses',
  'pets',
  'otp_codes',
  'chat_messages',
  'users',
]

export async function resetDb() {
  const prisma = getTestPrisma()
  const list = TABLES.map((t) => `"public"."${t}"`).join(', ')
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`)
}

export async function closeTestPrisma() {
  if (prismaSingleton) await prismaSingleton.$disconnect()
}
