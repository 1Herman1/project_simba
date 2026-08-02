import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { calcOrderTotals } from '@simba/shared'
import { hasTestDb, skipReason, getTestPrisma, resetDb, closeTestPrisma } from './setup'
import { createUser, createProductWithVariant, createCart, authHeader } from './factories'

describe.skipIf(!hasTestDb)('Оформление заказа (интеграционные)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    process.env.NODE_ENV = 'test'
    const { buildApp } = await import('../index')
    app = await buildApp({ logger: false })
    await app.ready()
  })

  afterAll(async () => {
    if (app) await app.close()
    await closeTestPrisma()
  })

  beforeEach(async () => {
    await resetDb()
  })

  const pickupOrder = (cartId: string, extra: Record<string, unknown> = {}) => ({
    cartId,
    deliveryMethod: 'pickup',
    hasSpecialPackaging: false,
    deliveryCost: 0,
    ...extra,
  })

  it('последний товар достаётся только одному из двух покупателей, склад не уходит в минус', async () => {
    const prisma = getTestPrisma()
    const { variant } = await createProductWithVariant({ price: 100000, stock: 1 })

    const userA = await createUser()
    const userB = await createUser()
    const cartA = await createCart(userA.id, [{ variantId: variant.id, quantity: 1 }])
    const cartB = await createCart(userB.id, [{ variantId: variant.id, quantity: 1 }])

    const [resA, resB] = await Promise.all([
      app.inject({
        method: 'POST',
        url: '/api/orders',
        headers: authHeader(app, userA.id),
        payload: pickupOrder(cartA.id),
      }),
      app.inject({
        method: 'POST',
        url: '/api/orders',
        headers: authHeader(app, userB.id),
        payload: pickupOrder(cartB.id),
      }),
    ])

    const codes = [resA.statusCode, resB.statusCode].sort()
    expect(codes).toEqual([201, 400])

    const failed = resA.statusCode === 400 ? resA : resB
    expect(failed.json().error).toMatch(/Недостаточно товара/i)

    const fresh = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })
    expect(fresh.stock).toBe(0)

    expect(await prisma.order.count()).toBe(1)
  })

  it('двойной клик по «Оформить» создаёт ровно один заказ, второй запрос — 409 DUPLICATE_ORDER', async () => {
    const prisma = getTestPrisma()
    const { variant } = await createProductWithVariant({ price: 100000, stock: 10 })
    const user = await createUser({ bonusPoints: 0 })
    const cart = await createCart(user.id, [{ variantId: variant.id, quantity: 2 }])

    const send = () =>
      app.inject({
        method: 'POST',
        url: '/api/orders',
        headers: authHeader(app, user.id),
        payload: pickupOrder(cart.id),
      })

    const [r1, r2] = await Promise.all([send(), send()])

    const created = [r1, r2].filter((r) => r.statusCode === 201)
    const rejected = [r1, r2].filter((r) => r.statusCode !== 201)
    expect(created).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect(rejected[0].statusCode).toBe(409)
    expect(rejected[0].json().code).toBe('DUPLICATE_ORDER')

    expect(await prisma.order.count()).toBe(1)

    const fresh = await prisma.productVariant.findUniqueOrThrow({ where: { id: variant.id } })
    expect(fresh.stock).toBe(8)

    const order = await prisma.order.findFirstOrThrow()
    const freshUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(freshUser.bonusPoints).toBe(order.bonusEarned)
  })

  it('чужой заказ не отдаётся: 404 и никаких данных о сумме, составе и адресе', async () => {
    const userA = await createUser()
    const userB = await createUser()
    const { variant } = await createProductWithVariant({ price: 250000, stock: 5 })
    const cartA = await createCart(userA.id, [{ variantId: variant.id, quantity: 1 }])

    const createdRes = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, userA.id),
      payload: pickupOrder(cartA.id, {
        comment: 'секретный комментарий',
      }),
    })
    expect(createdRes.statusCode).toBe(201)
    const orderId = createdRes.json().id

    const foreign = await app.inject({
      method: 'GET',
      url: `/api/orders/${orderId}`,
      headers: authHeader(app, userB.id),
    })

    expect(foreign.statusCode).toBe(404)
    expect(foreign.body).not.toMatch(/250000/)
    expect(foreign.body).not.toMatch(/секретный комментарий/)
    expect(foreign.json()).toEqual({ error: 'Заказ не найден' })

    const listB = await app.inject({
      method: 'GET',
      url: '/api/orders',
      headers: authHeader(app, userB.id),
    })
    expect(listB.statusCode).toBe(200)
    expect(listB.json()).toEqual([])

    const listA = await app.inject({
      method: 'GET',
      url: '/api/orders',
      headers: authHeader(app, userA.id),
    })
    expect(listA.json()).toHaveLength(1)
    expect(listA.json()[0].id).toBe(orderId)
  })

  it('без токена заказ не оформляется', async () => {
    const prisma = getTestPrisma()
    const user = await createUser()
    const { variant } = await createProductWithVariant({ price: 100000, stock: 5 })
    const cart = await createCart(user.id, [{ variantId: variant.id, quantity: 1 }])

    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      payload: pickupOrder(cart.id),
    })

    expect(res.statusCode).toBe(401)
    expect(await prisma.order.count()).toBe(0)
  })

  it('промокод, бонусы и самовывоз считаются так же, как calcOrderTotals', async () => {
    const prisma = getTestPrisma()
    const price = 200000
    const quantity = 3
    const { variant } = await createProductWithVariant({ price, stock: 10 })
    const user = await createUser({ bonusPoints: 500 })
    const cart = await createCart(user.id, [{ variantId: variant.id, quantity }])

    const expected = calcOrderTotals({
      items: [{ price, quantity }],
      promoCode: 'SIMBA10',
      bonusRequested: 300,
      availableBonus: 500,
      deliveryCost: 0,
    })

    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, user.id),
      payload: pickupOrder(cart.id, { promoCode: 'SIMBA10', bonusUsed: 300 }),
    })

    expect(res.statusCode).toBe(201)
    const order = res.json()
    expect(order.subtotal).toBe(expected.subtotal)
    expect(order.total).toBe(expected.total)
    expect(order.bonusUsed).toBe(expected.bonusUsed)
    expect(order.bonusEarned).toBe(expected.bonusEarned)

    const freshUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(freshUser.bonusPoints).toBe(500 - expected.bonusUsed + expected.bonusEarned)
  })

  it('корзина очищается после успеха и остаётся нетронутой при недостатке товара', async () => {
    const prisma = getTestPrisma()
    const okUser = await createUser()
    const { variant: okVariant } = await createProductWithVariant({ price: 100000, stock: 5 })
    const okCart = await createCart(okUser.id, [{ variantId: okVariant.id, quantity: 2 }])

    const okRes = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, okUser.id),
      payload: pickupOrder(okCart.id),
    })
    expect(okRes.statusCode).toBe(201)
    expect(await prisma.cartItem.count({ where: { cartId: okCart.id } })).toBe(0)

    const failUser = await createUser()
    const { variant: scarce } = await createProductWithVariant({ price: 100000, stock: 5 })
    const failCart = await createCart(failUser.id, [{ variantId: scarce.id, quantity: 2 }])

    // остаток проседает уже после наполнения корзины
    await prisma.productVariant.update({ where: { id: scarce.id }, data: { stock: 1 } })

    const failRes = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, failUser.id),
      payload: pickupOrder(failCart.id),
    })

    expect(failRes.statusCode).toBe(400)
    expect(failRes.json().error).toMatch(/Недостаточно товара/i)

    const items = await prisma.cartItem.findMany({ where: { cartId: failCart.id } })
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
    expect(await prisma.order.count({ where: { userId: failUser.id } })).toBe(0)
  })

  it('товар с нулевой ценой нельзя добавить в корзину', async () => {
    const prisma = getTestPrisma()
    const user = await createUser()
    const { variant } = await createProductWithVariant({ price: 0, stock: 10 })

    const res = await app.inject({
      method: 'POST',
      url: '/api/cart/items',
      headers: authHeader(app, user.id),
      payload: { productVariantId: variant.id, quantity: 1 },
    })

    expect(res.statusCode).toBe(400)
    expect(res.json().error).toMatch(/недоступен/i)
    expect(await prisma.cartItem.count()).toBe(0)
  })

  it('баланс бонусов не уходит в минус при двух одновременных заказах с одного аккаунта', async () => {
    const prisma = getTestPrisma()
    // Сценарий обязан быть переподписан: на балансе 500, а два заказа просят
    // по 500 каждый. С балансом 1000 оба запроса законны, и тест проходил бы
    // даже с полностью отключённой защитой — проверяя пустоту.
    const user = await createUser({ bonusPoints: 500 })

    const { variant: variant1 } = await createProductWithVariant({ price: 100000, stock: 5 })
    const { variant: variant2 } = await createProductWithVariant({ price: 100000, stock: 5 })

    const cart1 = await createCart(user.id, [{ variantId: variant1.id, quantity: 1 }])
    const cart2 = await createCart(user.id, [{ variantId: variant2.id, quantity: 1 }])

    // Пре-проверка баланса в роуте пропустит оба: она читает баланс до транзакции.
    const [res1, res2] = await Promise.all([
      app.inject({
        method: 'POST',
        url: '/api/orders',
        headers: authHeader(app, user.id),
        payload: pickupOrder(cart1.id, { bonusUsed: 500 }),
      }),
      app.inject({
        method: 'POST',
        url: '/api/orders',
        headers: authHeader(app, user.id),
        payload: pickupOrder(cart2.id, { bonusUsed: 500 }),
      }),
    ])

    expect([res1.statusCode, res2.statusCode].sort()).toEqual([201, 409])

    const rejected = res1.statusCode === 409 ? res1 : res2
    expect(rejected.json().code).toBe('INSUFFICIENT_BONUS')

    const orders = await prisma.order.findMany({ where: { userId: user.id } })
    expect(orders).toHaveLength(1)
    expect(orders[0].bonusUsed).toBe(500)

    const freshUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(freshUser.bonusPoints).toBe(500 - 500 + orders[0].bonusEarned)
  })

  it('лимит 50% срезает запрос: в заказ и в баланс уходит урезанная сумма', async () => {
    const prisma = getTestPrisma()
    const { variant } = await createProductWithVariant({ price: 100000, stock: 5 })
    const user = await createUser({ bonusPoints: 900 })
    const cart = await createCart(user.id, [{ variantId: variant.id, quantity: 1 }])

    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, user.id),
      payload: pickupOrder(cart.id, { bonusUsed: 900 }),
    })

    // Чек 1000 ₽ → списать можно 500, хотя запрошено 900.
    expect(res.statusCode).toBe(201)
    const order = res.json()
    expect(order.bonusUsed).toBe(500)
    expect(order.total).toBe(50000)
    expect(order.bonusEarned).toBe(25)

    const freshUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } })
    expect(freshUser.bonusPoints).toBe(900 - 500 + 25)
  })
})
