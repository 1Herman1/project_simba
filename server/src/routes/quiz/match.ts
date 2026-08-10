import { FastifyPluginAsync } from 'fastify'
import { quizAnswersSchema } from '../../schemas/quiz.schema'
import { runQuizMatch } from '../../services/quiz.service'

const matchRoute: FastifyPluginAsync = async (app) => {
  app.post('/match', { preHandler: app.authenticateOptional }, async (request, reply) => {
    const parsed = quizAnswersSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0].message })
    }

    try {
      const result = await app.prisma.$transaction(async (tx) => {
        return runQuizMatch(tx, parsed.data, request.user?.userId)
      })
      return reply.send(result)
    } catch (err) {
      if (err instanceof Error && err.message === 'Каталог подбора пуст') {
        return reply.status(503).send({ error: 'Каталог подбора пуст' })
      }
      throw err
    }
  })
}

export default matchRoute
