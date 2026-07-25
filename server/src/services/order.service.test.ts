import { describe, expect, it } from 'vitest'
import { calcOrderTotals } from './order.service'

// Цены и total — в копейках. bonusUsed / bonusEarned (scoins) — в рублях.

describe('calcOrderTotals', () => {
  it('считает subtotal и начисляет 5% Scoins без промокода и бонусов', () => {
    const r = calcOrderTotals({
      items: [
        { price: 50000, quantity: 2 },
        { price: 30000, quantity: 1 },
      ],
      availableBonus: 0,
    })

    expect(r).toEqual({
      subtotal: 130000,
      promoDiscount: 0,
      bonusUsed: 0,
      total: 130000,
      bonusEarned: 65,
    })
  })

  it('применяет промокод SIMBA10 как 10% от subtotal', () => {
    const r = calcOrderTotals({
      items: [{ price: 99900, quantity: 1 }],
      promoCode: 'SIMBA10',
      availableBonus: 0,
    })

    expect(r.promoDiscount).toBe(9990)
    expect(r.total).toBe(89910)
    expect(r.bonusEarned).toBe(44)
  })

  it('игнорирует неизвестный промокод', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      promoCode: 'HALYAVA',
      availableBonus: 0,
    })

    expect(r.promoDiscount).toBe(0)
    expect(r.total).toBe(100000)
  })

  it('не даёт списать больше бонусов, чем на балансе', () => {
    const r = calcOrderTotals({
      items: [{ price: 500000, quantity: 1 }],
      bonusRequested: 1000,
      availableBonus: 120,
    })

    expect(r.bonusUsed).toBe(120)
    expect(r.total).toBe(500000 - 12000)
  })

  it('обрезает списание бонусов суммой заказа после скидки', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      promoCode: 'SIMBA10',
      bonusRequested: 5000,
      availableBonus: 5000,
    })

    // subtotal 100000, скидка 10000 -> к оплате 90000 коп = 900 scoins максимум
    expect(r.bonusUsed).toBe(900)
    expect(r.total).toBe(0)
    expect(r.bonusEarned).toBe(0)
  })

  it('не уходит в минус при отрицательном запросе бонусов', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      bonusRequested: -500,
      availableBonus: 500,
    })

    expect(r.bonusUsed).toBe(0)
    expect(r.total).toBe(100000)
  })

  it('ФАКТИЧЕСКОЕ поведение: deliveryCost НЕ входит в total', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      availableBonus: 0,
      deliveryCost: 35000,
    })

    // Зафиксировано как есть. Ожидаемое по бизнес-логике: total = 135000.
    expect(r.total).toBe(100000)
  })
})
