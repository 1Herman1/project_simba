import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { otpService } from '../../services/otp.service'
import { OtpChannel } from '@prisma/client'

const bodySchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Укажите email или телефон',
  })

const sendOtp: FastifyPluginAsync = async (app) => {
  app.post('/send-otp', async (request, reply) => {
    const result = bodySchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message })
    }

    const { email, phone } = result.data
    const channel: OtpChannel = email ? 'email' : 'sms'
    const identifier = email ?? phone!

    let user = await app.prisma.user.findFirst({
      where: email ? { email } : { phone },
    })

    if (!user) {
      user = await app.prisma.user.create({
        data: {
          email: email ?? null,
          phone: phone ?? null,
          name: 'Пользователь',
          role: 'customer',
        },
      })
    }

    // Rate limit: не чаще одного запроса в 60 секунд
    const recentOtp = await app.prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (recentOtp) {
      return reply.status(429).send({ error: 'Повторный запрос возможен через 60 секунд' })
    }

    // Удалить старые неиспользованные OTP
    await app.prisma.otpCode.deleteMany({
      where: { userId: user.id, usedAt: null },
    })

    const code = await otpService.createOtp(app.prisma, user.id, channel)

    if (channel === 'email') {
      await otpService.sendEmail(identifier, code)
    } else {
      await otpService.sendSms(identifier, code)
    }

    return reply.send({
      message: 'Код отправлен',
      channel,
      expiresIn: 600,
    })
  })
}

export default sendOtp
