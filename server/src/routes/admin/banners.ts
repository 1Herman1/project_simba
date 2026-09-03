import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { checkRole } from '../../middleware/check-role'
import { saveFile } from '../../lib/storage'

const schema = z.object({
  title: z.string().min(1),
  image: z.string(),
  subtitle: z.string().optional(),
  link: z.string().optional(),
  buttonText: z.string().optional(),
  page: z.enum(['home', 'catalog', 'other']),
  position: z.enum(['main_slider', 'promo_strip', 'sidebar']),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
})

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const bannersAdminRoute: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  // Загрузка изображения баннера
  app.post<{ Body: any }>('/upload', guard, async (request, reply) => {
    const data = await request.file()
    if (!data) {
      return reply.status(400).send({ error: 'No file provided' })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.status(400).send({ error: 'Only JPEG, PNG, WebP, GIF allowed' })
    }

    const buffer = await data.toBuffer()
    if (buffer.length > MAX_FILE_SIZE) {
      return reply.status(413).send({ error: 'File too large (max 5MB)' })
    }

    try {
      const key = await saveFile(buffer, data.mimetype)
      return reply.status(201).send({ key, url: `/api/media/${key}` })
    } catch (err) {
      return reply.status(500).send({ error: 'Failed to upload file' })
    }
  })

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
    try {
      const banner = await app.prisma.banner.update({ where: { id }, data: parsed.data })
      return reply.send(banner)
    } catch (err: unknown) {
      if ((err as { code?: string })?.code === 'P2025') {
        return reply.status(404).send({ error: 'Баннер не найден' })
      }
      throw err
    }
  })

  app.delete<{ Params: { id: string } }>('/:id', guard, async (request, reply) => {
    const { id } = request.params
    await app.prisma.banner.delete({ where: { id } })
    return reply.send({ success: true })
  })
}

export default bannersAdminRoute
