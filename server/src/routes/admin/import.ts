import { FastifyPluginAsync } from 'fastify'
import * as XLSX from 'xlsx'
import { checkRole } from '../../middleware/check-role'

// Supported columns: name,slug,description,brandSlug,price,oldPrice,stock,weight,sku
const importRoute: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let insideQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        insideQuotes = !insideQuotes
      } else if (ch === ',' && !insideQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    result.push(current.trim())
    return result
  }

  function parseRows(buffer: Buffer, filename: string): Record<string, string>[] {
    const ext = filename.split('.').pop()?.toLowerCase()

    if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(buffer, { type: 'buffer' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
    }

    const text = buffer.toString('utf-8')
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) return []

    const headers = parseCsvLine(lines[0])
    return lines.slice(1).map(line => {
      const values = parseCsvLine(line)
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })
      return row
    })
  }

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
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      try {
        const name = String(row.name ?? '').trim()
        const slug = String(row.slug ?? '').trim()
        const description = String(row.description ?? '').trim()
        const brandSlug = String(row.brandSlug ?? '').trim()
        const price = String(row.price ?? '').trim()
        const oldPrice = String(row.oldPrice ?? '').trim()
        const stock = String(row.stock ?? '').trim()
        const weight = String(row.weight ?? '').trim()
        const sku = String(row.sku ?? '').trim()

        if (!name || !slug || !price || !weight) {
          errors.push(`Строка ${rowNum}: пропущены обязательные поля (name, slug, price, weight)`)
          continue
        }

        let brandId: string | undefined
        if (brandSlug) {
          const brand = await app.prisma.brand.findUnique({ where: { slug: brandSlug } })
          if (brand) brandId = brand.id
        }

        const existing = await app.prisma.product.findUnique({
          where: { slug },
          include: { variants: true },
        })

        if (!existing) {
          // Create new product
          await app.prisma.product.create({
            data: {
              name,
              slug,
              description: description || name,
              brandId,
              variants: {
                create: [{
                  weight: parseFloat(weight),
                  price: Math.round(parseFloat(price) * 100),
                  oldPrice: oldPrice ? Math.round(parseFloat(oldPrice) * 100) : undefined,
                  stock: parseInt(stock) || 0,
                  sku: sku || undefined,
                }],
              },
            },
          })
          created.push(name)
        } else {
          // Update existing product
          await app.prisma.product.update({
            where: { slug },
            data: {
              name,
              description: description || name,
              brandId,
            },
          })

          // Find or create variant
          let variant = null
          if (sku) {
            const skuOwner = await app.prisma.productVariant.findUnique({ where: { sku } })
            if (skuOwner && skuOwner.productId !== existing.id) {
              errors.push(`Строка ${rowNum}: SKU "${sku}" принадлежит другому товару`)
              continue
            }
            variant = existing.variants.find(v => v.sku === sku) ?? null
          } else {
            variant = existing.variants.find(v => v.weight === parseFloat(weight)) ?? null
          }

          if (variant) {
            // Update existing variant
            await app.prisma.productVariant.update({
              where: { id: variant.id },
              data: {
                price: Math.round(parseFloat(price) * 100),
                oldPrice: oldPrice ? Math.round(parseFloat(oldPrice) * 100) : undefined,
                stock: parseInt(stock) || 0,
                sku: sku ? (sku || undefined) : variant.sku,
              },
            })
          } else {
            // Create new variant for existing product
            await app.prisma.productVariant.create({
              data: {
                productId: existing.id,
                weight: parseFloat(weight),
                price: Math.round(parseFloat(price) * 100),
                oldPrice: oldPrice ? Math.round(parseFloat(oldPrice) * 100) : undefined,
                stock: parseInt(stock) || 0,
                sku: sku || undefined,
              },
            })
          }

          updated.push(name)
        }
      } catch (e) {
        errors.push(`Строка ${rowNum}: ошибка — ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    return reply.send({ created: created.length, updated: updated.length, errors })
  })
}

export default importRoute
