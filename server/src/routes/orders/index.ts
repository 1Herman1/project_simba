import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { calcOrderTotals } from '@simba/shared'
import {
  createOrder,
  DuplicateOrderError,
  getOrdersByUser,
  getOrderById,
  DeliveryCostMismatchError,
  InsufficientBonusError,
} from '../../services/order.service'
import { findOrCreateCustomerByEmail } from '../../services/customer.service'

const deliveryAddressSchema = z.object({
  city: z.string().min(1),
  street: z.string().min(1),
  house: z.string().min(1),
  apartment: z.string().optional(),
  postalCode: z.string().optional(),
})

const contactSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
})

const createOrderSchema = z
  .object({
    cartId: z.string().uuid(),
    deliveryMethod: z.enum(['cdek', 'yandex', 'post', 'ozon', 'dostavista', 'pickup']),
    deliveryAddress: deliveryAddressSchema.optional(),
    comment: z.string().optional(),
    hasSpecialPackaging: z.boolean().default(false),
    bonusUsed: z.number().int().min(0).default(0),
    promoCode: z.string().optional(),
    deliveryCost: z.number().int().min(0).default(0),
    paymentMethod: z.enum(['card', 'cash_on_delivery']).default('card'),
    contact: contactSchema.optional(),
  })
  .refine(
    (data) => {
      // Наличные допустимы только для курьерской доставки до двери
      if (data.paymentMethod === 'cash_on_delivery') {
        const courierMethods = ['cdek', 'yandex', 'dostavista']
        return courierMethods.includes(data.deliveryMethod)
      }
      return true
    },
    {
      message: 'Оплата наличными допустима только при курьерской доставке',
      path: ['paymentMethod'],
    }
  )

// Rate limit для гостевых заказов по IP: 5 в час
const guestOrderAttempts = new Map<string, { attempts: number; resetAt: Date }>()
const GUEST_ORDER_RATE_LIMIT = 5
const GUEST_ORDER_WINDOW_MS = 60 * 60 * 1000 // 1 час

const orderRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: app.authenticate }, async (request, reply) => {
    const result = createOrderSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message })
    }

    const { userId } = request.user
    const isGuest = request.user.type === 'guest'

    const cart = await app.prisma.cart.findUnique({
      where: { id: result.data.cartId },
      select: { userId: true },
    })

    if (!cart) {
      return reply.status(404).send({ error: 'Корзина не найдена' })
    }

    if (cart.userId !== userId) {
      return reply.status(403).send({ error: 'Доступ запрещён' })
    }

    // Гостевой заказ: обязателен contact с email
    if (isGuest) {
      if (!result.data.contact?.email) {
        return reply.status(400).send({ error: 'Email обязателен для оформления' })
      }

      // При доставке (не pickup) телефон обязателен
      if (result.data.deliveryMethod !== 'pickup' && !result.data.contact.phone) {
        return reply.status(400).send({ error: 'Телефон обязателен для доставки' })
      }

      // Гость не может списывать бонусы
      if (result.data.bonusUsed > 0) {
        return reply.status(400).send({ error: 'Списание бонусов доступно после входа' })
      }

      // Rate limit гостевых заказов по IP
      const clientIp = request.ip
      const now = new Date()
      let record = guestOrderAttempts.get(clientIp)

      if (record) {
        if (now.getTime() < record.resetAt.getTime()) {
          if (record.attempts >= GUEST_ORDER_RATE_LIMIT) {
            return reply
              .status(429)
              .send({ error: 'Слишком много заказов. Попробуйте через час.' })
          }
        } else {
          guestOrderAttempts.delete(clientIp)
          record = undefined
        }
      }
    }

    const { bonusUsed } = result.data
    if (bonusUsed < 0) {
      return reply.status(400).send({ error: 'Недостаточно бонусов' })
    }

    if (bonusUsed > 0) {
      const user = await app.prisma.user.findUnique({
        where: { id: userId },
        select: { bonusPoints: true },
      })
      if (!user || bonusUsed > user.bonusPoints) {
        return reply.status(400).send({ error: 'Недостаточно бонусов' })
      }
    }

    try {
      let customerUserId = userId

      // Гостевой заказ: найти или создать пользователя по email
      if (isGuest && result.data.contact?.email) {
        customerUserId = await findOrCreateCustomerByEmail(
          app.prisma,
          result.data.contact.email,
          result.data.contact.name
        )
      }

      const order = await createOrder(
        app.prisma,
        { cartOwnerId: userId, customerUserId },
        {
          ...result.data,
          expectedDeliveryCost: result.data.deliveryCost,
          paymentMethod: result.data.paymentMethod,
        }
      )

      // Инкрементить счётчик гостевых заказов ПОСЛЕ успешного создания
      if (isGuest) {
        const clientIp = request.ip
        const now = new Date()
        const currentRecord = guestOrderAttempts.get(clientIp)
        guestOrderAttempts.set(clientIp, {
          attempts: (currentRecord?.attempts ?? 0) + 1,
          resetAt: currentRecord?.resetAt || new Date(now.getTime() + GUEST_ORDER_WINDOW_MS),
        })
      }

      return reply.status(201).send(order)
    } catch (err) {
      if (err instanceof DuplicateOrderError) {
        return reply.status(409).send({ error: err.message, code: 'DUPLICATE_ORDER' })
      }
      if (err instanceof DeliveryCostMismatchError) {
        return reply.status(409).send({
          error: 'Стоимость доставки изменилась, обновите расчёт',
          code: 'DELIVERY_COST_CHANGED',
          actualDeliveryCost: err.actualCost,
        })
      }
      if (err instanceof InsufficientBonusError) {
        return reply.status(409).send({
          error: err.message,
          code: 'INSUFFICIENT_BONUS',
        })
      }
      const message = err instanceof Error ? err.message : 'Ошибка создания заказа'
      return reply.status(400).send({ error: message })
    }
  })

  app.get('/', { preHandler: app.authenticate }, async (request, reply) => {
    const { userId } = request.user
    const orders = await getOrdersByUser(app.prisma, userId)
    return reply.send(orders)
  })

  app.get('/:id', { preHandler: app.authenticate }, async (request, reply) => {
    const { userId } = request.user
    const { id } = request.params as { id: string }

    try {
      const order = await getOrderById(app.prisma, id, userId)
      return reply.send(order)
    } catch {
      return reply.status(404).send({ error: 'Заказ не найден' })
    }
  })
}

export default orderRoutes
