export type OrderCalcInput = {
  items: { price: number; quantity: number }[]
  promoCode?: string
  bonusRequested?: number
  availableBonus: number
  deliveryCost?: number
}

export type OrderTotals = {
  subtotal: number
  promoDiscount: number
  bonusUsed: number
  total: number
  bonusEarned: number
}

export function calcOrderTotals(input: OrderCalcInput): OrderTotals {
  const subtotal = input.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const promoDiscount =
    input.promoCode === 'SIMBA10' ? Math.round(subtotal * 0.1) : 0

  const delivery = input.deliveryCost ?? 0
  const payableBeforeBonus = Math.max(0, subtotal - promoDiscount + delivery)

  // scoin хранится в рублях: 1 scoin = 1 ₽ = 100 копеек скидки. Цены — в копейках.
  // maxRedeemableScoins включает доставку.
  const maxRedeemableScoins = Math.floor(payableBeforeBonus / 100)
  const bonusUsed = Math.max(
    0,
    Math.min(input.bonusRequested ?? 0, maxRedeemableScoins, input.availableBonus)
  )
  const total = Math.max(0, payableBeforeBonus - bonusUsed * 100)

  // bonusEarned: 5% только от товарной части, без доставки (консервативное начисление).
  // bonusUsed списываются в первую очередь с товаров.
  const goodsPaid = Math.max(0, subtotal - promoDiscount - bonusUsed * 100)
  const bonusEarned = Math.floor((goodsPaid / 100) * 0.05)

  return { subtotal, promoDiscount, bonusUsed, total, bonusEarned }
}
