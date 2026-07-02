import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { checkRole } from '../../middleware/check-role'

const schema = z.object({
  title: z.string().min(1),
  image: z.string().min(1),
  link: z.string().optional(),
  page: z.enum(['home', 'catalog', 'other']),
  position: z.enum(['main_slider', 'promo_strip', 'sidebar']),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

const bannersAdminRoute: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  app.get('/', guard, async (_req, reply) => {
    const banners = await app.prisma.banner.findMany({ orderBy: [{ page: 'asc' }, { sortOrder: 'asc' }] })
    return reply.send(banners)
  })

  app.post('/', guard, async (request, reply) => {
    const parsed = schema.safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.errors[0].message })
    const banner = await app.prisma.banner.create({ data: parsed.data })
    return reply.status(201).send(banner)
  })

  app.put<{ Params: { id: string } }>('/:id', guard, async (request, reply) => {
    const parsed = schema.partial().safeParse(request.body)
    if (!parsed.success) return reply.status(400).send({ error: parsed.error.errors[0].message })
    const { id } = request.params
    const banner = await app.prisma.banner.update({ where: { id }, data: parsed.data })
    return reply.send(banner)
  })

  app.delete<{ Params: { id: string } }>('/:id', guard, async (request, reply) => {
    const { id } = request.params
    await app.prisma.banner.delete({ where: { id } })
    return reply.send({ success: true })
  })
}

export default bannersAdminRoute
