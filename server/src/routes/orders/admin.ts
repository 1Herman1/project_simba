import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import {
  updateOrderStatus,
  markOrderPaid,
  markOrderRefunded,
  OrderCancelledError,
} from '../../services/order.service'

async function adminOnly(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify()
  const { role } = request.user
  if (role !== 'super_admin' && role !== 'orders_manager') {
    return reply.status(403).send({ error: 'Недостаточно прав' })
  }
}

const updateStatusSchema = z.object({
  status: z.enum(['confirmed', 'in_transit', 'delivered', 'cancelled']),
})

const updatePaymentSchema = z.object({
  paymentStatus: z.enum(['paid', 'failed', 'refunded']),
})

const orderAdminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: adminOnly }, async (request, reply) => {
    const query = request.query as {
      status?: string
      page?: string
      limit?: string
      userId?: string
      dateFrom?: string
      dateTo?: string
    }

    const page = Math.max(1, parseInt(query.page ?? '1'))
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20')))
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (query.status) where.status = query.status
    if (query.userId) where.userId = query.userId
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {
        ...(query.dateFrom ? { gte: new Date(query.dateFrom) } : {}),
        ...(query.dateTo ? { lte: new Date(query.dateTo) } : {}),
      }
    }

    const [items, total] = await Promise.all([
      app.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, user: { select: { id: true, name: true, email: true, phone: true } } },
      }),
      app.prisma.order.count({ where }),
    ])

    return reply.send({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  })

  app.get('/:id', { preHandler: adminOnly }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const order = await app.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (!order) {
      return reply.status(404).send({ error: 'Заказ не найден' })
    }

    return reply.send(order)
  })

  app.put('/:id/status', { preHandler: adminOnly }, async (request, reply) => {
    const result = updateStatusSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message })
    }

    const { id } = request.params as { id: string }

    try {
      const order = await updateOrderStatus(app.prisma, id, result.data.status)
      return reply.send(order)
    } catch (err) {
      // Конфликт состояния, а не плохие данные — иначе админ читает «ошибка
      // обновления статуса» и не понимает, что заказ уже отменён.
      if (err instanceof OrderCancelledError) {
        return reply.status(409).send({ error: err.message, code: 'ORDER_CANCELLED' })
      }
      const message = err instanceof Error ? err.message : 'Ошибка обновления статуса'
      return reply.status(400).send({ error: message })
    }
  })

  app.put('/:id/payment', { preHandler: adminOnly }, async (request, reply) => {
    const result = updatePaymentSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.errors[0].message })
    }

    const { id } = request.params as { id: string }

    try {
      let order
      switch (result.data.paymentStatus) {
        case 'paid':
          order = await markOrderPaid(app.prisma, id)
          break
        case 'refunded':
          order = await markOrderRefunded(app.prisma, id)
          break
        case 'failed':
          // Only update status, no bonus adjustments
          order = await app.prisma.order.update({
            where: { id },
            data: { paymentStatus: 'failed' },
          })
          break
      }
      return reply.send(order)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка обновления платежа'
      return reply.status(400).send({ error: message })
    }
  })
}

export default orderAdminRoutes
