import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const favoritesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: app.authenticate }, async (request, reply) => {
    const { userId } = request.user
    const favorites = await app.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            variants: { orderBy: { weight: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return reply.send(favorites)
  })

  const addSchema = z.object({
    productId: z.string().uuid(),
  })

  app.post('/:productId', { preHandler: app.authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { productId } = request.params as { productId: string }

    const product = await app.prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' })
    }

    const favorite = await app.prisma.favorite.upsert({
      where: { userId_productId: { userId, productId } },
      update: {},
      create: { userId, productId },
      include: {
        product: {
          include: {
            brand: true,
            variants: { orderBy: { weight: 'asc' } },
          },
        },
      },
    })

    return reply.status(201).send(favorite)
  })

  app.delete('/:productId', { preHandler: app.authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { productId } = request.params as { productId: string }

    await app.prisma.favorite.deleteMany({
      where: { userId, productId },
    })

    return reply.send({ message: 'Removed from favorites' })
  })
}

export default favoritesRoutes
