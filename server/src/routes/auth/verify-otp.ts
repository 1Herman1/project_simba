import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { otpService } from '../../services/otp.service'
import { applyBonusChange } from '../../services/bonus.service'

const WELCOME_BONUS = 300
const OTP_MAX_ATTEMPTS = 5
const OTP_WINDOW_MS = 15 * 60 * 1000

const otpAttempts = new Map<string, { attempts: number; lastAttempt: Date }>()

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
    const contact = (email ?? phone) as string

    const now = new Date()
    const record = otpAttempts.get(contact)
    if (record) {
      const windowExpired = now.getTime() - record.lastAttempt.getTime() > OTP_WINDOW_MS
      if (windowExpired) {
        otpAttempts.delete(contact)
      } else if (record.attempts >= OTP_MAX_ATTEMPTS) {
        return reply.status(429).send({ error: 'Слишком много попыток. Попробуйте через 15 минут.' })
      }
    }

    const user = await app.prisma.user.findFirst({
      where: email ? { email } : { phone },
    })

    if (!user) {
      return reply.status(404).send({ error: 'Пользователь не найден' })
    }

    const isValid = await otpService.verifyOtp(app.prisma, user.id, code)
    if (!isValid) {
      const current = otpAttempts.get(contact)
      otpAttempts.set(contact, {
        attempts: (current?.attempts ?? 0) + 1,
        lastAttempt: now,
      })
      return reply.status(400).send({ error: 'Неверный или истёкший код' })
    }

    otpAttempts.delete(contact)

    // Приветственные бонусы — один раз, в момент первого подтверждённого входа.
    // Условие в updateMany делает выдачу идемпотентной: два одновременных
    // подтверждения не начислят дважды.
    let bonusGranted = 0
    const granted = await app.prisma.user.updateMany({
      where: { id: user.id, welcomeBonusGranted: false },
      data: { welcomeBonusGranted: true },
    })

    if (granted.count === 1) {
      await app.prisma.$transaction(async (tx) => {
        await applyBonusChange(tx, {
          userId: user.id,
          amount: WELCOME_BONUS,
          type: 'welcome',
          comment: 'Приветственные бонусы за регистрацию',
        })
      })
      bonusGranted = WELCOME_BONUS
    }

    const fresh = await app.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { bonusPoints: true, bonusLevel: true },
    })

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
        bonusPoints: fresh.bonusPoints,
        bonusLevel: fresh.bonusLevel,
      },
      // Только факт выдачи в этом запросе. Признак «баланс ≥ 300» показывал бы
      // попап при каждом входе любому, кто бонусы ещё не потратил.
      bonusGranted,
    })
  })
}

export default verifyOtp
