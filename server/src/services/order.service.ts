import { DeliveryMethod, OrderStatus, PaymentStatus, PrismaClient } from '@prisma/client'
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

/** Отмена — конечное состояние: бонусы за заказ уже вернулись покупателю. */
export class OrderCancelledError extends Error {
  constructor() {
    super('Отменённый заказ нельзя вернуть в работу')
  }
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

/**
 * Результат расчёта изменений баланса бонусов при оплате или отмене заказа.
 * balanceDelta может быть положительным (возврат/начисление) или отрицательным (вычитание).
 */
export type BonusSettlement = {
  balanceDelta: number
  bonusEarnedCredited: boolean
  bonusUsedRefunded: boolean
}

/**
 * Чистая функция для расчёта начисления бонусов при оплате заказа.
 * Идемпотентна: повторный вызов с теми же данными вернёт нулевое изменение.
 * @param order Заказ с полями bonusEarned, bonusEarnedCredited
 * @param currentBalance Текущий баланс бонусов пользователя
 * @returns Дельта баланса и новые значения флагов
 */
export function settleOnPaid(
  order: { bonusEarned: number; bonusEarnedCredited: boolean; bonusUsedRefunded: boolean },
  currentBalance: number
): BonusSettlement {
  // bonusUsedRefunded === true означает, что расчёт по заказу уже откатан
  // (отмена или возврат платежа). Начислять за него нельзя: покупателю вернули
  // списанное и товара он не получил — иначе отмена превращается в подарок.
  if (order.bonusUsedRefunded || order.bonusEarnedCredited || order.bonusEarned === 0) {
    return {
      balanceDelta: 0,
      bonusEarnedCredited: order.bonusEarnedCredited,
      bonusUsedRefunded: order.bonusUsedRefunded,
    }
  }

  return {
    balanceDelta: order.bonusEarned,
    bonusEarnedCredited: true,
    bonusUsedRefunded: order.bonusUsedRefunded,
  }
}

/**
 * Чистая функция для расчёта возврата бонусов при отмене или возврате платежа.
 * Возвращает как списанные при оформлении (bonusUsed), так и снимает начисленные.
 * Баланс не уходит в минус: если начисленные бонусы уже потрачены, снимаем только доступное.
 * @param order Заказ с bonusUsed, bonusEarned, bonusEarnedCredited, bonusUsedRefunded
 * @param currentBalance Текущий баланс бонусов пользователя (после прибавления bonusUsed)
 * @returns Дельта баланса и новые значения флагов
 */
export function settleOnCancel(
  order: {
    bonusUsed: number
    bonusEarned: number
    bonusEarnedCredited: boolean
    bonusUsedRefunded: boolean
  },
  currentBalance: number
): BonusSettlement {
  let balanceDelta = 0

  // Вернуть списанные бонусы, если ещё не вернули
  let bonusUsedRefunded = order.bonusUsedRefunded
  if (!order.bonusUsedRefunded && order.bonusUsed > 0) {
    balanceDelta += order.bonusUsed
    bonusUsedRefunded = true
  }

  // Снять начисленные бонусы, если они были начислены
  let bonusEarnedCredited = order.bonusEarnedCredited
  if (order.bonusEarnedCredited && order.bonusEarned > 0) {
    const toDeduct = Math.max(0, Math.min(order.bonusEarned, currentBalance + balanceDelta))
    balanceDelta -= toDeduct
    bonusEarnedCredited = false
  }

  return {
    balanceDelta,
    bonusEarnedCredited,
    bonusUsedRefunded,
  }
}

/**
 * Вспомогательная функция: пересчитать уровень бонусов пользователя по его балансу.
 */
function calculateBonusLevel(points: number) {
  return points >= 5000 ? 'premium' : points >= 1000 ? 'active' : 'newcomer'
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
    if (bonusUsed > 0) {
      const decremented = await tx.user.updateMany({
        where: { id: userId, bonusPoints: { gte: bonusUsed } },
        data: { bonusPoints: { decrement: bonusUsed } },
      })

      if (decremented.count === 0) {
        throw new InsufficientBonusError()
      }
    }

    // Бонусы не начисляются при оформлении — только при оплате (markOrderPaid).
    // Поле bonusEarned в заказе сохраняется как калькуляция, но на баланс попадает позже.
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { bonusPoints: true, bonusLevel: true },
    })

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

  // Отмена — конечная. Иначе заказ можно вернуть в работу после того, как
  // списанные бонусы уже вернулись покупателю: товар едет, оплата подарена.
  if (order.status === 'cancelled' && status !== 'cancelled') {
    throw new OrderCancelledError()
  }

  // При отмене заказа — вернуть бонусы
  if (status === 'cancelled') {
    return prisma.$transaction(async (tx) => {
      // Право отменить захватываем условным апдейтом: два одновременных запроса
      // иначе оба прочитают «не отменён» и оба вернут бонусы на баланс.
      const claimed = await tx.order.updateMany({
        where: { id: orderId, status: { not: 'cancelled' } },
        data: { status },
      })

      if (claimed.count === 0) {
        return tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } })
      }

      const fresh = await tx.order.findUniqueOrThrow({ where: { id: orderId } })

      const currentUser = await tx.user.findUnique({
        where: { id: fresh.userId },
        select: { bonusPoints: true, bonusLevel: true },
      })

      const settlement = settleOnCancel(fresh, currentUser?.bonusPoints ?? 0)

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          bonusEarnedCredited: settlement.bonusEarnedCredited,
          bonusUsedRefunded: settlement.bonusUsedRefunded,
        },
        include: { items: true },
      })

      // Обновить баланс и уровень
      if (settlement.balanceDelta !== 0) {
        const updatedUser = await tx.user.update({
          where: { id: order.userId },
          data: { bonusPoints: { increment: settlement.balanceDelta } },
        })

        const newLevel = calculateBonusLevel(updatedUser.bonusPoints)
        if (newLevel !== updatedUser.bonusLevel) {
          await tx.user.update({
            where: { id: order.userId },
            data: { bonusLevel: newLevel },
          })
        }
      }

      return updatedOrder
    })
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: { items: true },
  })
}

/**
 * Отметить заказ как оплаченный и начислить бонусы.
 * Идемпотентна: повторный вызов не начислит бонусы дважды.
 */
export async function markOrderPaid(prisma: PrismaClient, orderId: string) {
  return prisma.$transaction(async (tx) => {
    // Отметку «оплачен» захватываем условно: два одновременных нажатия иначе
    // оба увидят «не оплачен» и начислят бонусы дважды.
    const claimed = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: { not: 'paid' }, status: { not: 'cancelled' } },
      data: { paymentStatus: 'paid' },
    })

    const order = await tx.order.findUnique({ where: { id: orderId } })

    if (!order) {
      throw new Error('Заказ не найден')
    }

    if (claimed.count === 0) {
      return order
    }

    const currentUser = await tx.user.findUnique({
      where: { id: order.userId },
      select: { bonusPoints: true, bonusLevel: true },
    })

    const settlement = settleOnPaid(order, currentUser?.bonusPoints ?? 0)

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { bonusEarnedCredited: settlement.bonusEarnedCredited },
    })

    // Обновить баланс и уровень
    if (settlement.balanceDelta !== 0) {
      const updatedUser = await tx.user.update({
        where: { id: order.userId },
        data: { bonusPoints: { increment: settlement.balanceDelta } },
      })

      const newLevel = calculateBonusLevel(updatedUser.bonusPoints)
      if (newLevel !== updatedUser.bonusLevel) {
        await tx.user.update({
          where: { id: order.userId },
          data: { bonusLevel: newLevel },
        })
      }
    }

    return updatedOrder
  })
}

/**
 * Отметить заказ как возвращённый (возврат платежа) и вернуть бонусы.
 * Идемпотентна.
 */
export async function markOrderRefunded(prisma: PrismaClient, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const claimed = await tx.order.updateMany({
      where: { id: orderId, paymentStatus: { not: 'refunded' } },
      data: { paymentStatus: 'refunded' },
    })

    const order = await tx.order.findUnique({ where: { id: orderId } })

    if (!order) {
      throw new Error('Заказ не найден')
    }

    if (claimed.count === 0) {
      return order
    }

    const currentUser = await tx.user.findUnique({
      where: { id: order.userId },
      select: { bonusPoints: true, bonusLevel: true },
    })

    const settlement = settleOnCancel(order, currentUser?.bonusPoints ?? 0)

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        bonusEarnedCredited: settlement.bonusEarnedCredited,
        bonusUsedRefunded: settlement.bonusUsedRefunded,
      },
    })

    // Обновить баланс и уровень
    if (settlement.balanceDelta !== 0) {
      const updatedUser = await tx.user.update({
        where: { id: order.userId },
        data: { bonusPoints: { increment: settlement.balanceDelta } },
      })

      const newLevel = calculateBonusLevel(updatedUser.bonusPoints)
      if (newLevel !== updatedUser.bonusLevel) {
        await tx.user.update({
          where: { id: order.userId },
          data: { bonusLevel: newLevel },
        })
      }
    }

    return updatedOrder
  })
}
