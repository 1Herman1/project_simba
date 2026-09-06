import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { getAllQuotes, createDeliveryOrder, listPickupPoints } from '../../services/delivery/delivery.service.js'
import type { DeliveryProvider, PickupPoint } from '../../services/delivery/types.js'
import { checkRateLimit } from '../../lib/rate-limit.js'

const pickupPointSchema = z.object({
  provider: z.enum(['cdek', 'yandex']),
  code: z.string().min(1),
  name: z.string(),
  address: z.string(),
  lat: z.number(),
  lon: z.number(),
  workTime: z.string().optional(),
  phone: z.string().optional(),
})

const pickupPointsQuerySchema = z.object({
  provider: z.enum(['cdek', 'yandex']),
  city: z.string().trim().min(2).max(100),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lon: z.coerce.number().min(-180).max(180).optional(),
})

const quotesSchema = z.object({
  city: z.string().min(2),
  street: z.string().optional(),
  house: z.string().optional(),
  postalCode: z.string().optional(),
  /// Координаты нужны Яндекс.Доставке: без них providers/yandex.ts подставляет
  /// центр Москвы и считает цену до него, то есть неверно для любого адреса.
  /// Схема их раньше отбрасывала, и тип DeliveryAddress.lat/lon стоял пустым.
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
  weightKg: z.number().positive().max(100),
  pickupPoint: pickupPointSchema.optional(),
})

export default async function deliveryRoutes(app: FastifyInstance) {

  // POST /api/delivery/quotes — расчёт стоимости всех провайдеров
  app.post('/quotes', async (req, reply) => {
    const clientIp = req.ip

    if (!checkRateLimit(clientIp, 'quotes')) {
      return reply.status(429).send({
        error: 'Слишком много запросов. Попробуйте позже',
        retryAfter: 300,
      })
    }

    const result = quotesSchema.safeParse(req.body)
    if (!result.success) {
      // Текст zod («Number must be greater than 0») показывать покупателю
      // нельзя: он английский и про внутренности схемы, а не про его адрес.
      return reply.status(400).send({ error: 'Не удалось рассчитать доставку по этому адресу' })
    }

    const { city, street, house, postalCode, lat, lon, weightKg, pickupPoint } = result.data

    const quotes = await getAllQuotes(
      { city, street, house, postalCode, lat, lon, pickupPoint },
      { weightKg }
    )

    return reply.send({ quotes })
  })

  // GET /api/delivery/pickup-points — список пунктов выдачи службы в городе
  app.get('/pickup-points', async (req, reply) => {
    if (!checkRateLimit(req.ip, 'pickup-points')) {
      return reply.status(429).send({
        error: 'Слишком много запросов. Попробуйте позже',
        retryAfter: 300,
      })
    }

    const parsed = pickupPointsQuerySchema.safeParse(req.query)
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Укажите службу доставки и город' })
    }

    const { provider, city, lat, lon } = parsed.data
    const near = lat !== undefined && lon !== undefined ? { lat, lon } : undefined

    try {
      const points = await listPickupPoints(provider, city, near)
      return reply.send({ points })
    } catch (err) {
      // Отказ службы — не «в этом городе пунктов нет»: покупатель должен
      // увидеть «попробовать ещё раз», а не пустой список.
      app.log.error({ err, provider, city }, 'Не удалось получить пункты выдачи')
      return reply.status(502).send({ error: 'Не удалось получить список пунктов выдачи' })
    }
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
        pickupPoint?: PickupPoint
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

  // GET /api/delivery/features — возможности системы доставки
  app.get('/features', async (req, reply) => {
    return reply.send({
      suggest: Boolean(process.env.DADATA_TOKEN),
      map: false,
    })
  })
}
