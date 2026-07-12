import { DeliveryMethod, PrismaClient } from '@prisma/client'

type DeliveryAddress = {
  city: string
  street: string
  house: string
  apartment?: string
  postalCode: string
}

type CreateOrderData = {
  cartId: string
  deliveryMethod: DeliveryMethod
  deliveryAddress?: DeliveryAddress
  comment?: string
  hasSpecialPackaging: boolean
  bonusUsed?: number
  promoCode?: string
  deliveryCost?: number
}

const orderItemsInclude = {
  items: {
    select: {
      id: true,
      productName: true,
      variantWeight: true,
      price: true,
      quantity: true,
      productVariantId: true,
      productId: true,
    },
  },
}

export async function createOrder(
  prisma: PrismaClient,
  userId: string,
  data: CreateOrderData
) {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { id: data.cartId, userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      throw new Error('Корзина пуста или не найдена')
    }

    for (const item of cart.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.productVariantId },
      })

      if (!variant || variant.stock < item.quantity) {
        throw new Error(
          `Недостаточно товара на складе: ${item.productVariant.product.name}`
        )
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.productVariant.price * item.quantity,
      0
    )
    const promoDiscount = data.promoCode === 'SIMBA10' ? Math.round(subtotal * 0.1) : 0

    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { bonusPoints: true },
    })
    const availableBonus = currentUser?.bonusPoints ?? 0

    // scoin хранится в рублях: 1 scoin = 1 ₽ = 100 копеек скидки. Цены — в копейках.
    const maxRedeemableScoins = Math.floor((subtotal - promoDiscount) / 100)
    const bonusUsed = Math.max(
      0,
      Math.min(data.bonusUsed ?? 0, maxRedeemableScoins, availableBonus)
    )
    const total = Math.max(0, subtotal - promoDiscount - bonusUsed * 100)
    const bonusEarned = Math.floor((total / 100) * 0.05)

    const order = await tx.order.create({
      data: {
        userId,
        deliveryMethod: data.deliveryMethod,
        deliveryAddress: data.deliveryAddress ?? undefined,
        comment: data.comment,
        hasSpecialPackaging: data.hasSpecialPackaging,
        subtotal,
        total,
        bonusUsed,
        bonusEarned,
        deliveryCost: data.deliveryCost ?? 0,
        items: {
          create: cart.items.map((item) => ({
            productVariantId: item.productVariantId,
            productId: item.productId,
            productName: item.productVariant.product.name,
            variantWeight: item.productVariant.weight,
            price: item.productVariant.price,
            quantity: item.quantity,
          })),
        },
      },
      include: orderItemsInclude,
    })

    for (const item of cart.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        bonusPoints: { increment: bonusEarned - bonusUsed },
      },
    })

    const newPoints = user.bonusPoints
    const newLevel =
      newPoints >= 5000 ? 'premium' :
      newPoints >= 1000 ? 'active' :
      'newcomer'

    if (newLevel !== user.bonusLevel) {
      await tx.user.update({
        where: { id: userId },
        data: { bonusLevel: newLevel },
      })
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

    return order
  })
}

export async function getOrdersByUser(prisma: PrismaClient, userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      total: true,
      deliveryMethod: true,
      deliveryCost: true,
      paymentStatus: true,
      createdAt: true,
      bonusUsed: true,
      bonusEarned: true,
      items: {
        select: {
          productName: true,
          variantWeight: true,
          price: true,
          quantity: true,
        },
      },
    },
  })
}

export async function getOrderById(
  prisma: PrismaClient,
  orderId: string,
  userId: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order || order.userId !== userId) {
    throw new Error('Заказ не найден')
  }

  return order
}

export async function updateOrderStatus(
  prisma: PrismaClient,
  orderId: string,
  status: 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } })

  if (!order) {
    throw new Error('Заказ не найден')
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true },
  })
}
