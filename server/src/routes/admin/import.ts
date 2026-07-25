import { createHash } from 'node:crypto'
import { FastifyPluginAsync } from 'fastify'
import { checkRole } from '../../middleware/check-role'
import {
  parseRows,
  mapRow,
  transliterate,
  type ImportRow,
} from '../../services/product-import'

const importRoute: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  app.post('/csv', guard, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.status(400).send({ error: 'Файл не загружен' })

    const chunks: Buffer[] = []
    for await (const chunk of file.file) chunks.push(chunk)
    const buffer = Buffer.concat(chunks)

    const rows = parseRows(buffer, file.filename)
    if (rows.length === 0) return reply.status(400).send({ error: 'Файл пустой или нет данных' })

    const created: string[] = []
    const updated: string[] = []
    const skippedNoPrice: string[] = []
    const createdBrands: string[] = []
    const createdCategories: string[] = []
    const errors: string[] = []

    // Кеши на время импорта
    const brandCache = new Map<string, string>() // slug → id
    const categoryCache = new Map<string, string>() // slug → id
    const filterCache = new Map<string, string>() // slug → id
    const filterValueCache = new Map<string, string>() // filterSlug|valueSlug → id

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i]
      const rowNum = i + 2

      try {
        const row = mapRow(rawRow)

        // 1. Проверка обязательного поля name
        if (!row.name) {
          errors.push(`Строка ${rowNum}: пропущено обязательное поле «Имя»`)
          continue
        }

        // 2. Генерация/проверка slug
        let slug = row.slug
        if (!slug) {
          slug = transliterate(row.name)
        }
        if (!slug) {
          // Название без букв и цифр (эмодзи, знаки препинания) — транслитерация
          // даёт пустоту, а slug уникальный и участвует в URL карточки.
          // Хэш от названия устойчив: повторный импорт узнает тот же товар.
          slug =
            transliterate(row.sku ?? '') ||
            `product-${createHash('sha1').update(row.name).digest('hex').slice(0, 8)}`
        }

        // Проверка уникальности slug
        let finalSlug = slug
        let suffix = 2
        while (true) {
          const existing = await app.prisma.product.findUnique({
            where: { slug: finalSlug },
            select: { id: true, name: true },
          })

          if (!existing) {
            // Slug свободен
            break
          }

          if (existing.name === row.name) {
            // Тот же товар, обновим его
            break
          }

          // Slug занят другим товаром, подбираем новый
          finalSlug = `${slug}-${suffix}`
          suffix++
        }

        slug = finalSlug

        // 3. Бренд
        let brandId: string | undefined
        if (row.brandName || row.brandSlug) {
          const brandSlug = row.brandSlug || transliterate(row.brandName!)
          const cachedId = brandCache.get(brandSlug)

          if (cachedId) {
            brandId = cachedId
          } else {
            const brand = await app.prisma.brand.findUnique({
              where: { slug: brandSlug },
              select: { id: true },
            })

            if (brand) {
              brandId = brand.id
              brandCache.set(brandSlug, brandId)
            } else {
              // Создаём бренд
              const newBrand = await app.prisma.brand.create({
                data: {
                  name: row.brandName || row.brandSlug || '',
                  slug: brandSlug,
                },
                select: { id: true },
              })
              brandId = newBrand.id
              brandCache.set(brandSlug, brandId)
              createdBrands.push(row.brandName || row.brandSlug || '')
            }
          }
        }

        // 4. Товар (upsert)
        const existingProduct = await app.prisma.product.findUnique({
          where: { slug },
          include: { variants: true },
        })

        let productId: string
        let isNewProduct = false

        if (!existingProduct) {
          // Создаём новый товар
          const product = await app.prisma.product.create({
            data: {
              name: row.name,
              slug,
              description: row.description || row.name,
              brandId,
              images: row.images,
              isActive: false, // Станет true если будет цена и вес
            },
            select: { id: true },
          })
          productId = product.id
          isNewProduct = true
        } else {
          // Обновляем существующий товар
          await app.prisma.product.update({
            where: { slug },
            data: {
              name: row.name,
              description: row.description || row.name,
              brandId,
              images: row.images,
            },
          })
          productId = existingProduct.id
        }

        // 5. Вариант (только если есть цена и вес)
        let hasVariant = false

        if (row.price !== undefined && row.weight !== undefined) {
          let variant = null

          if (row.sku) {
            // Проверяем, не принадлежит ли SKU другому товару
            const skuOwner = await app.prisma.productVariant.findUnique({
              where: { sku: row.sku },
              select: { productId: true },
            })

            if (skuOwner && skuOwner.productId !== productId) {
              errors.push(`Строка ${rowNum}: SKU "${row.sku}" принадлежит другому товару`)
              continue
            }

            variant = await app.prisma.productVariant.findFirst({
              where: { productId, sku: row.sku },
            })
          } else {
            variant = await app.prisma.productVariant.findFirst({
              where: { productId, weight: row.weight },
            })
          }

          if (variant) {
            // Обновляем вариант
            await app.prisma.productVariant.update({
              where: { id: variant.id },
              data: {
                price: Math.round(row.price * 100),
                oldPrice: row.oldPrice ? Math.round(row.oldPrice * 100) : undefined,
                stock: row.stock || 0,
                sku: row.sku,
              },
            })
          } else {
            // Создаём новый вариант
            await app.prisma.productVariant.create({
              data: {
                productId,
                weight: row.weight,
                price: Math.round(row.price * 100),
                oldPrice: row.oldPrice ? Math.round(row.oldPrice * 100) : undefined,
                stock: row.stock || 0,
                sku: row.sku,
              },
            })
          }

          hasVariant = true

          // Активируем товар только если есть вариант
          await app.prisma.product.update({
            where: { id: productId },
            data: { isActive: true },
          })
        }

        if (!hasVariant) {
          // Файл без цены не должен снимать с продажи товар, у которого цена уже есть.
          const variantCount = await app.prisma.productVariant.count({
            where: { productId },
          })

          if (variantCount === 0) {
            await app.prisma.product.update({
              where: { id: productId },
              data: { isActive: false },
            })
            skippedNoPrice.push(row.name)
          }
        }

        // 6. Категории
        for (const categoryName of row.categories) {
          const categorySlug = transliterate(categoryName)
          const cachedId = categoryCache.get(categorySlug)

          let categoryId: string

          if (cachedId) {
            categoryId = cachedId
          } else {
            const category = await app.prisma.category.findUnique({
              where: { slug: categorySlug },
              select: { id: true },
            })

            if (category) {
              categoryId = category.id
              categoryCache.set(categorySlug, categoryId)
            } else {
              // Создаём категорию
              const newCategory = await app.prisma.category.create({
                data: {
                  name: categoryName,
                  slug: categorySlug,
                  isActive: true,
                },
                select: { id: true },
              })
              categoryId = newCategory.id
              categoryCache.set(categorySlug, categoryId)
              createdCategories.push(categoryName)
            }
          }

          // Связываем товар с категорией
          await app.prisma.productCategory.upsert({
            where: { productId_categoryId: { productId, categoryId } },
            create: { productId, categoryId },
            update: {},
          })
        }

        // 7. Атрибуты (фильтры и значения)
        for (const attr of row.attributes) {
          const filterSlug = transliterate(attr.name)
          const cachedFilterId = filterCache.get(filterSlug)

          let filterId: string

          if (cachedFilterId) {
            filterId = cachedFilterId
          } else {
            const filter = await app.prisma.filter.findUnique({
              where: { slug: filterSlug },
              select: { id: true },
            })

            if (filter) {
              filterId = filter.id
              filterCache.set(filterSlug, filterId)
            } else {
              // Создаём фильтр
              const newFilter = await app.prisma.filter.create({
                data: {
                  name: attr.name,
                  slug: filterSlug,
                  type: 'checkbox',
                },
                select: { id: true },
              })
              filterId = newFilter.id
              filterCache.set(filterSlug, filterId)
            }
          }

          // FilterValue
          const valueSlug = transliterate(attr.value)
          const filterValueKey = `${filterSlug}|${valueSlug}`
          const cachedValueId = filterValueCache.get(filterValueKey)

          let filterValueId: string

          if (cachedValueId) {
            filterValueId = cachedValueId
          } else {
            const filterValue = await app.prisma.filterValue.findUnique({
              where: { filterId_slug: { filterId, slug: valueSlug } },
              select: { id: true },
            })

            if (filterValue) {
              filterValueId = filterValue.id
              filterValueCache.set(filterValueKey, filterValueId)
            } else {
              // Создаём значение фильтра
              const newFilterValue = await app.prisma.filterValue.create({
                data: {
                  filterId,
                  value: attr.value,
                  slug: valueSlug,
                },
                select: { id: true },
              })
              filterValueId = newFilterValue.id
              filterValueCache.set(filterValueKey, filterValueId)
            }
          }

          // Связываем товар с значением фильтра
          await app.prisma.productFilterValue.upsert({
            where: { productId_filterValueId: { productId, filterValueId } },
            create: { productId, filterValueId },
            update: {},
          })
        }

        // Добавляем в статистику
        if (isNewProduct) {
          created.push(row.name)
        } else if (!existingProduct) {
          // Это не должно случиться, но на всякий случай
        } else {
          updated.push(row.name)
        }
      } catch (e) {
        errors.push(`Строка ${rowNum}: ошибка — ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    return reply.send({
      created: created.length,
      updated: updated.length,
      skippedNoPrice,
      createdBrands,
      createdCategories,
      errors,
    })
  })
}

export default importRoute
