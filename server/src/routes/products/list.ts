import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getProducts } from '../../services/product.service'

const querySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(),
  filters: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export default async function listRoute(app: FastifyInstance) {
  app.get('/list', async (request, reply) => {
    const parsed = querySchema.safeParse(request.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0].message })
    }

    const q = parsed.data

    const filterValueIds = q.filters
      ? q.filters.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined

    const result = await getProducts(app.prisma, {
      categorySlug: q.category,
      brandSlug: q.brand,
      filterValueIds,
      minPrice: q.minPrice !== undefined ? q.minPrice * 100 : undefined,
      maxPrice: q.maxPrice !== undefined ? q.maxPrice * 100 : undefined,
      search: q.search,
      sortBy: q.sort,
      featured: q.featured === 'true',
      page: q.page,
      limit: q.limit,
    })

    return reply.send(result)
  })
}
