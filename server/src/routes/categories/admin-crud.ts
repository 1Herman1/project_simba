import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkRole } from '../../middleware/check-role'

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sortOrder: z.number().int().default(0),
})

const updateSchema = createSchema.partial()

export default async function adminCrudRoute(app: FastifyInstance) {
  const adminGuard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  app.post('/', adminGuard, async (request, reply) => {
    const parsed = createSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0].message })
    }

    const category = await app.prisma.category.create({ data: parsed.data })
    return reply.status(201).send(category)
  })

  app.put<{ Params: { id: string } }>('/:id', adminGuard, async (request, reply) => {
    const parsed = updateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0].message })
    }

    const { id } = request.params
    const exists = await app.prisma.category.findUnique({ where: { id } })
    if (!exists) {
      return reply.status(404).send({ error: 'Category not found' })
    }

    const category = await app.prisma.category.update({
      where: { id },
      data: parsed.data,
    })

    return reply.send(category)
  })

  app.delete<{ Params: { id: string } }>('/:id', adminGuard, async (request, reply) => {
    const { id } = request.params

    const exists = await app.prisma.category.findUnique({ where: { id } })
    if (!exists) {
      return reply.status(404).send({ error: 'Category not found' })
    }

    await app.prisma.category.update({
      where: { id },
      data: { isActive: false },
    })

    return reply.send({ success: true })
  })
}
