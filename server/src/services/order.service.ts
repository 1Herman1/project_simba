import { DeliveryMethod, PrismaClient } from '@prisma/client'
import { calcOrderTotals, type OrderCalcInput, type OrderTotals } from '@simba/shared'
import { getQuoteForMethod } from './delivery/delivery.service.js'
import type { DeliveryAddress as DeliveryServiceAddress } from './delivery/types.js'

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
  expectedDeliveryCost?: number
}

/** Повторная отправка того же заказа — конфликт с уже произошедшим, не ошибка данных. */
export class DuplicateOrderError extends Error {
  constructor() {
    super('Заказ уже оформлен')
  }
}

// Ошибка при расхождении цены доставки
export class DeliveryCostMismatchError extends Error {
  constructor(public actualCost: number) {
    super('Стоимость доставки изменилась, обновите расчёт')
  }
}

// Гонка: баланс проседел между проверкой и списанием
export class InsufficientBonusError extends Error {
  constructor() {
    super('Недостаточно бонусов для списания')
  }
}

// Re-export for backward compatibility
export { calcOrderTotals, type OrderCalcInput, type OrderTotals }

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

async function resolveDeliveryCost(
  prisma: PrismaClient,
  userId: string,
  data: CreateOrderData
): Promise<number> {
  let serverDeliveryCost = 0

  if (data.deliveryMethod !== 'pickup') {
    if (!data.deliveryAddress) {
      throw new Error('Для выбранного способа доставки нужен адрес')
    }

    // Вес берём из БД, а не из запроса — иначе доставку можно занизить.
    const cart = await prisma.cart.findUnique({
      where: { id: data.cartId, userId },
      include: { items: { include: { productVariant: true } } },
    })

    if (!cart || cart.items.length === 0) {
      throw new Error('Корзина пуста или не найдена')
    }

    const totalWeightKg = cart.items.reduce(
      (sum, item) => sum + item.productVariant.weight * item.quantity,
      0
    )

    const quote = await getQuoteForMethod(
      data.deliveryMethod,
      data.deliveryAddress as DeliveryServiceAddress,
      { weightKg: totalWeightKg }
    )

    serverDeliveryCost = quote.price
  }

  const clientCost = data.expectedDeliveryCost ?? 0
  const tolerance = Math.max(5000, Math.round(serverDeliveryCost * 0.01))
  if (Math.abs(clientCost - serverDeliveryCost) > tolerance) {
    throw new DeliveryCostMismatchError(serverDeliveryCost)
  }

  return serverDeliveryCost
}

export async function createOrder(
  prisma: PrismaClient,
  userId: string,
  data: CreateOrderData
) {
  // Котировка доставки — до открытия транзакции: это HTTP-запрос к внешней
  // службе, держать на нём открытую транзакцию с блокировками нельзя.
  const serverDeliveryCost = await resolveDeliveryCost(prisma, userId, data)

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

    // Быстрый отказ до создания заказа — НЕ защита от гонки: остаток может
    // измениться между этой проверкой и списанием ниже. Защита там, в условном
    // updateMany. Здесь просто чтобы не делать лишнюю работу в обычном случае.
    for (const item of cart.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.productVariantId },
        select: { stock: true },
      })

      if (!variant || variant.stock < item.quantity) {
        throw new Error(
          `Недостаточно товара на складе: ${item.productVariant.product.name}`
        )
      }
    }

    const currentUser = await tx.user.findUnique({
      where: { id: userId },
      select: { bonusPoints: true },
    })

    const { subtotal, bonusUsed, total, bonusEarned } = calcOrderTotals({
      items: cart.items.map((item) => ({
        price: item.productVariant.price,
        quantity: item.quantity,
      })),
      promoCode: data.promoCode,
      bonusRequested: data.bonusUsed,
      availableBonus: currentUser?.bonusPoints ?? 0,
      deliveryCost: serverDeliveryCost,
    })

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
        deliveryCost: serverDeliveryCost,
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
      // Условное списание: база сама проверит, что остатка хватает. Проверка
      // отдельным запросом выше не спасает — между ней и списанием второй
      // покупатель успевает забрать последний мешок, и склад уходит в минус.
      const decremented = await tx.productVariant.updateMany({
        where: { id: item.productVariantId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      })

      if (decremented.count === 0) {
        throw new Error(
          `Недостаточно товара на складе: ${item.productVariant.product.name}`
        )
      }
    }

    // Условное списание бонусов: вторая линия защиты от гонки. Проверка в роуте
    // не спасает — две вкладки/двойной клик оба пройдут проверку и оба спишут.
    // Сначала условно списываем (защита от гонки), потом безусловно начисляем.
    if (bonusUsed > 0) {
      const decremented = await tx.user.updateMany({
        where: { id: userId, bonusPoints: { gte: bonusUsed } },
        data: { bonusPoints: { decrement: bonusUsed } },
      })

      if (decremented.count === 0) {
        throw new InsufficientBonusError()
      }
    }

    const user = await tx.user.update({
      where: { id: userId },
      data: {
        bonusPoints: { increment: bonusEarned },
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

    // Очистка корзины — она же признак дубля. Два одновременных нажатия
    // «Оформить» дойдут сюда оба, но вычистит корзину только первый; второй
    // увидит ноль строк и откатится, вместо второго заказа и двойного списания.
    const cleared = await tx.cartItem.deleteMany({ where: { cartId: cart.id } })

    if (cleared.count === 0) {
      throw new DuplicateOrderError()
    }

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
