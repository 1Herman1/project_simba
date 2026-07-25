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

describe('calcOrderTotals — границы округления', () => {
  it('промо-скидка на ровной половине копейки округляется вверх (в пользу покупателя)', () => {
    // subtotal 1005 -> 1005 * 0.1 = 100.5 ровно -> Math.round -> 101
    const r = calcOrderTotals({
      items: [{ price: 1005, quantity: 1 }],
      promoCode: 'SIMBA10',
      availableBonus: 0,
    })

    expect(r.promoDiscount).toBe(101)
    expect(r.total).toBe(904)
  })

  it('половина копейки округляется вверх и на крупной сумме', () => {
    // 999995 * 0.1 = 99999.5 -> 100000
    const r = calcOrderTotals({
      items: [{ price: 999995, quantity: 1 }],
      promoCode: 'SIMBA10',
      availableBonus: 0,
    })

    expect(r.promoDiscount).toBe(100000)
    expect(r.total).toBe(899995)
  })

  it('промо-скидка на минимальной половине копейки: 25 коп -> 3 коп', () => {
    const r = calcOrderTotals({
      items: [{ price: 25, quantity: 1 }],
      promoCode: 'SIMBA10',
      availableBonus: 0,
    })

    expect(r.promoDiscount).toBe(3)
    expect(r.total).toBe(22)
  })

  it('кэшбэк отбрасывает неполный рубль: 1999 коп -> 0 Scoins', () => {
    const r = calcOrderTotals({
      items: [{ price: 1999, quantity: 1 }],
      availableBonus: 0,
    })

    // floor(19.99 * 0.05) = floor(0.9995) = 0
    expect(r.bonusEarned).toBe(0)
    expect(r.total).toBe(1999)
  })

  it('следующая копейка уже даёт 1 Scoin: 2000 коп -> 1', () => {
    const r = calcOrderTotals({
      items: [{ price: 2000, quantity: 1 }],
      availableBonus: 0,
    })

    expect(r.bonusEarned).toBe(1)
  })

  it('кэшбэк не растёт на некратных 100 остатках: 2099 коп даёт столько же, сколько 2000', () => {
    const at2000 = calcOrderTotals({
      items: [{ price: 2000, quantity: 1 }],
      availableBonus: 0,
    })
    const at2099 = calcOrderTotals({
      items: [{ price: 2099, quantity: 1 }],
      availableBonus: 0,
    })

    expect(at2099.bonusEarned).toBe(at2000.bonusEarned)
  })

  it('стык округлений: промо округлилось вверх, кэшбэк — вниз', () => {
    // subtotal 1005: promo 101 (вверх), goodsPaid 904 -> floor(9.04 * 0.05) = 0
    const r = calcOrderTotals({
      items: [{ price: 1005, quantity: 1 }],
      promoCode: 'SIMBA10',
      availableBonus: 0,
    })

    expect(r.promoDiscount).toBe(101)
    expect(r.bonusEarned).toBe(0)
  })

  it('лимит списания бонусов отбрасывает неполный рубль к оплате', () => {
    // к оплате 1999 коп -> максимум floor(1999/100) = 19 Scoins
    const r = calcOrderTotals({
      items: [{ price: 1999, quantity: 1 }],
      bonusRequested: 100,
      availableBonus: 100,
    })

    expect(r.bonusUsed).toBe(19)
    expect(r.total).toBe(99)
  })

  it('нулевой заказ не даёт ни скидки, ни кэшбэка', () => {
    const r = calcOrderTotals({
      items: [],
      promoCode: 'SIMBA10',
      bonusRequested: 100,
      availableBonus: 100,
    })

    expect(r).toEqual({
      subtotal: 0,
      promoDiscount: 0,
      bonusUsed: 0,
      total: 0,
      bonusEarned: 0,
    })
  })
})

describe('calcOrderTotals — копейка не теряется и не появляется', () => {
  const cases: { name: string; input: Parameters<typeof calcOrderTotals>[0] }[] = [
    {
      name: 'ровная сумма без скидок',
      input: { items: [{ price: 130000, quantity: 1 }], availableBonus: 0 },
    },
    {
      name: 'промо с округлением вверх на .5',
      input: {
        items: [{ price: 1005, quantity: 1 }],
        promoCode: 'SIMBA10',
        availableBonus: 0,
      },
    },
    {
      name: 'промо с округлением вниз',
      input: {
        items: [{ price: 1004, quantity: 1 }],
        promoCode: 'SIMBA10',
        availableBonus: 0,
      },
    },
    {
      name: 'некратный сотне остаток + бонусы',
      input: {
        items: [{ price: 1999, quantity: 1 }],
        bonusRequested: 100,
        availableBonus: 100,
      },
    },
    {
      name: 'промо + бонусы + доставка',
      input: {
        items: [{ price: 100000, quantity: 1 }],
        promoCode: 'SIMBA10',
        deliveryCost: 30000,
        bonusRequested: 500,
        availableBonus: 500,
      },
    },
    {
      name: 'бонусы съедают заказ целиком',
      input: {
        items: [{ price: 100000, quantity: 1 }],
        promoCode: 'SIMBA10',
        bonusRequested: 5000,
        availableBonus: 5000,
      },
    },
    {
      name: 'бонусы покрывают товар и часть доставки',
      input: {
        items: [{ price: 100000, quantity: 1 }],
        deliveryCost: 50000,
        bonusRequested: 1200,
        availableBonus: 1200,
      },
    },
    {
      name: 'нечётные копейки в нескольких позициях',
      input: {
        items: [
          { price: 333, quantity: 3 },
          { price: 777, quantity: 2 },
        ],
        promoCode: 'SIMBA10',
        bonusRequested: 5,
        availableBonus: 5,
        deliveryCost: 199,
      },
    },
    {
      name: 'отрицательный запрос бонусов',
      input: {
        items: [{ price: 100000, quantity: 1 }],
        bonusRequested: -500,
        availableBonus: 500,
      },
    },
  ]

  it.each(cases)(
    'total + бонусы + промо = subtotal + доставка ($name)',
    ({ input }) => {
      const r = calcOrderTotals(input)
      const delivery = input.deliveryCost ?? 0

      expect(r.total + r.bonusUsed * 100 + r.promoDiscount).toBe(
        r.subtotal + delivery
      )
    }
  )

  it.each(cases)('total никогда не отрицателен ($name)', ({ input }) => {
    expect(calcOrderTotals(input).total).toBeGreaterThanOrEqual(0)
  })

  it.each(cases)(
    'списано бонусов не больше баланса и не больше суммы к оплате ($name)',
    ({ input }) => {
      const r = calcOrderTotals(input)
      const delivery = input.deliveryCost ?? 0

      expect(r.bonusUsed).toBeLessThanOrEqual(input.availableBonus)
      expect(r.bonusUsed * 100).toBeLessThanOrEqual(
        r.subtotal - r.promoDiscount + delivery
      )
    }
  )
})
