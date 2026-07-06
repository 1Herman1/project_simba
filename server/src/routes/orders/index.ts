import { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import {
  createOrder,
  getOrdersByUser,
  getOrderById,
} from '../../services/order.service'

const deliveryAddressSchema = z.object({
  city: z.string().min(1),
  street: z.string().min(1),
  house: z.string().min(1),
  apartment: z.string().optional(),
  postalCode: z.string().min(1),
})

const createOrderSchema = z.object({
  cartId: z.string().uuid(),
  deliveryMethod: z.enum(['cdek', 'yandex', 'post', 'ozon', 'dostavista', 'pickup']),
  deliveryAddress: deliveryAddressSchema.optional(),
  comment: z.string().optional(),
  hasSpecialPackaging: z.boolean().default(false),
  bonusUsed: z.number().int().min(0).default(0),
  promoCode: z.string().optional(),
  deliveryCost: z.number().int().min(0).default(0),
})

const orderRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: app.authenticate }, async (request, reply) => {
    const result = createOrderSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message })
    }

    const { userId } = request.user

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

      const cartWithItems = await app.prisma.cart.findUnique({
        where: { id: result.data.cartId },
        include: { items: { include: { productVariant: true } } },
      })
      if (cartWithItems) {
        const subtotal = cartWithItems.items.reduce(
          (sum, item) => sum + item.productVariant.price * item.quantity,
          0
        )
        const promoDiscount = result.data.promoCode === 'SIMBA10' ? Math.round(subtotal * 0.1) : 0
        const maxBonus = subtotal - promoDiscount
        if (bonusUsed > maxBonus) {
          return reply.status(400).send({ error: 'Нельзя списать бонусов больше суммы заказа' })
        }
      }
    }

    try {
      const order = await createOrder(app.prisma, userId, result.data)
      return reply.status(201).send(order)
    } catch (err) {
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
