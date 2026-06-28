import { FastifyInstance } from 'fastify'

export default async function brandRoutes(app: FastifyInstance) {
  app.get('/', async (_request, reply) => {
    const brands = await app.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
      },
    })
    return reply.send(brands)
  })

  app.get<{ Params: { slug: string } }>('/:slug', async (request, reply) => {
    const brand = await app.prisma.brand.findUnique({
      where: { slug: request.params.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
      },
    })

    if (!brand) {
      return reply.status(404).send({ error: 'Brand not found' })
    }

    return reply.send(brand)
  })
}
