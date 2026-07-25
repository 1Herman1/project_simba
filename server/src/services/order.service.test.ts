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

  it('deliveryCost входит в total, но не даёт кэшбэк', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      availableBonus: 0,
      deliveryCost: 35000,
    })

    expect(r.total).toBe(135000)
    expect(r.bonusEarned).toBe(50)
  })

  it('бонусы покрывают товар и часть доставки, кэшбэк = 0', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      deliveryCost: 50000,
      bonusRequested: 1200,
      availableBonus: 1200,
    })

    expect(r.bonusUsed).toBe(1200)
    expect(r.total).toBe(30000)
    expect(r.bonusEarned).toBe(0)
  })

  it('промокод + доставка: кэшбэк только от товаров', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      promoCode: 'SIMBA10',
      deliveryCost: 30000,
      availableBonus: 0,
    })

    expect(r.promoDiscount).toBe(10000)
    expect(r.total).toBe(120000)
    expect(r.bonusEarned).toBe(45)
  })

  it('промокод + бонусы + доставка: все три компонента одновременно', () => {
    const r = calcOrderTotals({
      items: [{ price: 100000, quantity: 1 }],
      promoCode: 'SIMBA10',
      deliveryCost: 30000,
      bonusRequested: 500,
      availableBonus: 500,
    })

    // subtotal 100000, скидка 10000, доставка 30000
    // к оплате: 100000 - 10000 + 30000 = 120000
    // максимум бонусов: floor(120000 / 100) = 1200, запрос 500 < 1200 и < баланс 500 -> используем 500
    // итого: 120000 - 500*100 = 70000
    // кэшбэк: только с товаров (без доставки, после бонусов)
    // товаров оплачено: 100000 - 10000 - 500*100 = 40000
    // кэшбэк: floor((40000 / 100) * 0.05) = floor(20) = 20
    expect(r.subtotal).toBe(100000)
    expect(r.promoDiscount).toBe(10000)
    expect(r.bonusUsed).toBe(500)
    expect(r.total).toBe(70000)
    expect(r.bonusEarned).toBe(20)
  })
})
