import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { checkRole } from '../../middleware/check-role'

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: z.string().url().optional(),
  description: z.string().optional(),
})

const brandsAdminRoute: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  app.get('/', guard, async (_req, reply) => {
    const brands = await app.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    })
    return reply.send(brands)
  })

  app.post('/', guard, async (request, reply) => {
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.errors[0].message })
    const brand = await app.prisma.brand.create({ data: parsed.data })
    return reply.status(201).send(brand)
  })

  app.put<{ Params: { id: string } }>('/:id', guard, async (request, reply) => {
    const parsed = schema.partial().safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.errors[0].message })
    const { id } = request.params
    const brand = await app.prisma.brand.update({ where: { id }, data: parsed.data })
    return reply.send(brand)
  })

  app.delete<{ Params: { id: string } }>('/:id', guard, async (request, reply) => {
    const { id } = request.params
    try {
      await app.prisma.brand.delete({ where: { id } })
      return reply.send({ success: true })
    } catch (err: any) {
      if (err?.code === 'P2003' || err?.code === 'P2014') {
        return reply.status(409).send({
          error: 'Невозможно удалить бренд: у него есть товары. Сначала переназначьте или удалите товары.',
        })
      }
      throw err
    }
  })
}

export default brandsAdminRoute
