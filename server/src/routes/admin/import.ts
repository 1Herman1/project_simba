import { FastifyPluginAsync } from 'fastify'
import { checkRole } from '../../middleware/check-role'

// CSV import: name,slug,description,brandSlug,price,oldPrice,stock,weight,sku
const importRoute: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  app.post('/csv', guard, async (request, reply) => {
    const file = await request.file()
    if (!file) return reply.status(400).send({ error: 'Файл не загружен' })

    const chunks: Buffer[] = []
    for await (const chunk of file.file) chunks.push(chunk)
    const text = Buffer.concat(chunks).toString('utf-8')

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length < 2) return reply.status(400).send({ error: 'Файл пустой или нет данных' })

    const headers = lines[0].split(',').map(h => h.trim())
    const created: string[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => { row[h] = values[idx] ?? '' })

      try {
        const { name, slug, description, brandSlug, price, oldPrice, stock, weight, sku } = row
        if (!name || !slug || !price || !weight) {
          errors.push(`Строка ${i + 1}: пропущены обязательные поля (name, slug, price, weight)`)
          continue
        }

        let brandId: string | undefined
        if (brandSlug) {
          const brand = await app.prisma.brand.findUnique({ where: { slug: brandSlug } })
          if (brand) brandId = brand.id
        }

        const existing = await app.prisma.product.findUnique({ where: { slug } })
        if (existing) {
          errors.push(`Строка ${i + 1}: товар со slug "${slug}" уже существует`)
          continue
        }

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
      } catch (e) {
        errors.push(`Строка ${i + 1}: ошибка — ${e instanceof Error ? e.message : 'unknown'}`)
      }
    }

    return reply.send({ created: created.length, errors })
  })
}

export default importRoute
