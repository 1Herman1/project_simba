import { FastifyPluginAsync } from 'fastify'
import { checkRole } from '../../middleware/check-role'

const dashboardRoute: FastifyPluginAsync = async (app) => {
  const guard = { preHandler: [app.authenticate, checkRole(['super_admin', 'orders_manager', 'products_manager'])] }

  app.get('/', guard, async (_req, reply) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      ordersToday,
      ordersMonth,
      revenueToday,
      revenueMonth,
      totalUsers,
      newUsersToday,
      totalProducts,
      recentOrders,
    ] = await Promise.all([
      app.prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      app.prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      app.prisma.order.aggregate({
        where: { createdAt: { gte: todayStart }, status: { not: 'cancelled' } },
        _sum: { total: true },
      }),
      app.prisma.order.aggregate({
        where: { createdAt: { gte: monthStart }, status: { not: 'cancelled' } },
        _sum: { total: true },
      }),
      app.prisma.user.count(),
      app.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      app.prisma.product.count({ where: { isActive: true } }),
      app.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: true,
        },
      }),
    ])

    return reply.send({
      ordersToday,
      ordersMonth,
      revenueToday: revenueToday._sum.total ?? 0,
      revenueMonth: revenueMonth._sum.total ?? 0,
      totalUsers,
      newUsersToday,
      totalProducts,
      recentOrders,
    })
  })
}

export default dashboardRoute
