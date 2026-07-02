import type { FastifyInstance } from 'fastify'
import { getAllQuotes, createDeliveryOrder } from '../../services/delivery/delivery.service.js'
import type { DeliveryProvider } from '../../services/delivery/types.js'

export default async function deliveryRoutes(app: FastifyInstance) {

  // POST /api/delivery/quotes — расчёт стоимости всех провайдеров
  app.post('/quotes', async (req, reply) => {
    const { city, street, house, postalCode, weightKg } = req.body as {
      city: string
      street?: string
      house?: string
      postalCode?: string
      weightKg: number
    }

    if (!city || !weightKg) {
      return reply.status(400).send({ error: 'city и weightKg обязательны' })
    }

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
