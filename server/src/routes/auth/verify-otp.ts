import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { otpService } from '../../services/otp.service'

const bodySchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    code: z.string().length(6),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Укажите email или телефон',
  })

const verifyOtp: FastifyPluginAsync = async (app) => {
  app.post('/verify-otp', async (request, reply) => {
    const result = bodySchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message })
    }

    const { email, phone, code } = result.data

    const user = await app.prisma.user.findFirst({
      where: email ? { email } : { phone },
    })

    if (!user) {
      return reply.status(404).send({ error: 'Пользователь не найден' })
    }

    const isValid = await otpService.verifyOtp(app.prisma, user.id, code)
    if (!isValid) {
      return reply.status(400).send({ error: 'Неверный или истёкший код' })
    }

    const token = app.jwt.sign(
      { userId: user.id, role: user.role },
      { expiresIn: '7d' }
    )

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
        bonusPoints: user.bonusPoints,
        bonusLevel: user.bonusLevel,
      },
    })
  })
}

export default verifyOtp
