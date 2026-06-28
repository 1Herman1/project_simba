import { FastifyPluginAsync } from 'fastify'

const me: FastifyPluginAsync = async (app) => {
  app.get('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const { userId } = request.user

    const user = await app.prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        pets: true,
      },
    })

    if (!user) {
      return reply.status(404).send({ error: 'Пользователь не найден' })
    }

    return reply.send({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.name,
      role: user.role,
      bonusPoints: user.bonusPoints,
      bonusLevel: user.bonusLevel,
      addresses: user.addresses,
      pets: user.pets,
    })
  })
}

export default me
