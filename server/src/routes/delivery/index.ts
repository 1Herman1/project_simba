import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getAllQuotes, createDeliveryOrder } from '../../services/delivery/delivery.service.js'
import type { DeliveryProvider } from '../../services/delivery/types.js'

const quotesSchema = z.object({
  city: z.string().min(2),
  street: z.string().optional(),
  house: z.string().optional(),
  postalCode: z.string().optional(),
  weightKg: z.number().positive().max(100),
})

// In-memory rate limit: IP -> { count, resetAt }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimitMap.get(ip)

  if (!limit || now > limit.resetAt) {
    // Новое окно (5 минут)
    rateLimitMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 })
    return true
  }

  if (limit.count >= 20) {
    return false
  }

  limit.count += 1
  return true
}

export default async function deliveryRoutes(app: FastifyInstance) {

  // POST /api/delivery/quotes — расчёт стоимости всех провайдеров
  app.post('/quotes', async (req, reply) => {
    const clientIp = req.ip

    if (!checkRateLimit(clientIp)) {
      return reply.status(429).send({
        error: 'Слишком много запросов. Попробуйте позже',
        retryAfter: 300,
      })
    }

    const result = quotesSchema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.errors[0]?.message ?? 'Ошибка валидации'
      return reply.status(400).send({ error: message })
    }

    const { city, street, house, postalCode, weightKg } = result.data

    const quotes = await getAllQuotes(
      { city, street, house, postalCode },
      { weightKg }
    )

    return reply.send({ quotes })
  })

  // POST /api/delivery/create — создать заказ у провайдера
  app.post('/create', { onRequest: [app.authenticate] }, async (req, reply) => {
    const {
      provider,
      orderId,
      address,
      weightKg,
      recipientName,
      recipientPhone,
    } = req.body as {
      provider: DeliveryProvider
      orderId: string
      address: {
        city: string
        street?: string
        house?: string
        apartment?: string
        postalCode?: string
      }
      weightKg: number
      recipientName: string
      recipientPhone: string
    }

    if (!provider || !orderId || !address?.city) {
      return reply.status(400).send({ error: 'provider, orderId и address.city обязательны' })
    }

    try {
      const result = await createDeliveryOrder(
        provider,
        address,
        { weightKg },
        orderId,
        recipientName,
        recipientPhone
      )
      return reply.send(result)
    } catch (err) {
      app.log.error(err)
      return reply.status(500).send({ error: 'Ошибка создания заказа доставки' })
    }
  })
}
