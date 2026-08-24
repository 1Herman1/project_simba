import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { otpService } from '../../services/otp.service.js'
import { createSmsSender } from '../../services/sms/index.js'
import { ApiError } from '../../lib/errors.js'

const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^\+7\d{10}$/, 'Неверный формат телефона')
    .transform((v) => v.replace(/[\s()-]/g, '').replace(/^8/, '+7')), // Normalize
})

export async function sendOtpRoute(app: FastifyInstance) {
  const sms = createSmsSender()

  app.post<{ Body: { phone: string } }>(
    '/api/v1/auth/send-otp',
    {
      // Контракт 3.18: 5 запросов / 15 минут по IP (плюс лимит на номер внутри).
      config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
      schema: {
        response: {
          200: {
            type: 'object',
            additionalProperties: false,
            required: ['channel', 'expiresIn', 'resendAfter'],
            properties: {
              channel: { type: 'string', const: 'sms' },
              expiresIn: { type: 'integer' },
              resendAfter: { type: 'integer' },
            },
          },
          400: { $ref: 'ps.error#' },
          429: { $ref: 'ps.error#' },
        },
      },
    },
    async (request: FastifyRequest<{ Body: { phone: string } }>, reply: FastifyReply) => {
      // Validate input
      const result = phoneSchema.safeParse(request.body as any)
      if (!result.success) {
        throw new ApiError(
          400,
          'VALIDATION_ERROR',
          'Неверный формат телефона',
          { field: 'phone' }
        )
      }

      const phone = result.data.phone

      // Пользователь нужен до проверки лимита: код в БД привязан к userId,
      // поля phone у OtpCode нет.
      const user = await otpService.findOrCreateUser(phone)

      // Check rate limit per phone (60 sec)
      const { db } = await import('../../lib/db.js')
      const recentCode = await db.otpCode.findFirst({
        where: {
          userId: user.id,
          createdAt: { gte: new Date(Date.now() - 60 * 1000) },
        },
      })

      if (recentCode) {
        throw new ApiError(
          429,
          'OTP_RATE_LIMITED',
          'Слишком частый запрос. Попробуйте позже',
          { retryAfter: 60 }
        )
      }

      // Generate and send OTP
      const code = await otpService.generateAndStoreCode(user.id)
      await sms.send(phone, code)

      reply.status(200).send({
        channel: 'sms',
        expiresIn: 10 * 60,
        resendAfter: 60,
      })
    }
  )
}
