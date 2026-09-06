import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { hasTestDb, getTestPrisma, resetDb, closeTestPrisma } from './setup'
import { createUser, createProductWithVariant, createCart, authHeader } from './factories'

// СДЭК в тестовой среде не подключён: без реквизитов провайдер отдаёт
// available: false, и getQuoteForMethod роняет оформление. Подменяем только
// две функции провайдера — вся остальная цепочка (роут → order.service →
// delivery.service) работает по-настоящему, включая выбор ПВЗ-тарифа вместо
// курьерского и сверку стоимости доставки.
vi.mock('../services/delivery/providers/cdek.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../services/delivery/providers/cdek.js')>()),
  getPickupPointQuote: vi.fn(),
  getCourierQuote: vi.fn(),
}))

import * as cdek from '../services/delivery/providers/cdek.js'
import type { DeliveryQuote } from '../services/delivery/types.js'

const PVZ_PRICE = 35000
const COURIER_PRICE = 49000

const quote = (price: number, pvz: boolean): DeliveryQuote => ({
  provider: 'cdek',
  key: pvz ? 'cdek_pvz' : 'cdek_courier',
  kind: pvz ? 'pickup_point' : 'courier',
  title: 'СДЭК',
  description: pvz ? 'В пункт выдачи' : 'Курьер до двери',
  price,
  daysMin: 2,
  daysMax: 5,
  available: true,
})

const point = {
  provider: 'cdek' as const,
  code: 'MSK-42',
  name: 'ПВЗ на Тверской',
  address: 'Москва, ул. Тверская, 1',
  lat: 55.7601,
  lon: 37.6156,
  workTime: 'пн–пт 10:00–20:00',
  phone: '+74951234567',
}

describe.skipIf(!hasTestDb)('Заказ в пункт выдачи СДЭК (интеграционные)', () => {
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
    vi.mocked(cdek.getPickupPointQuote).mockReset().mockResolvedValue(quote(PVZ_PRICE, true))
    vi.mocked(cdek.getCourierQuote).mockReset().mockResolvedValue(quote(COURIER_PRICE, false))
  })

  it('cdek + пункт выдачи и город без улицы → 201, пункт сохранён в заказе целиком', async () => {
    const prisma = getTestPrisma()
    const { variant } = await createProductWithVariant({ price: 100000, stock: 10, weight: 2.5 })
    const user = await createUser()
    const cart = await createCart(user.id, [{ variantId: variant.id, quantity: 2 }])

    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, user.id),
      payload: {
        cartId: cart.id,
        deliveryMethod: 'cdek',
        deliveryAddress: { city: 'Москва' },
        deliveryPoint: point,
        hasSpecialPackaging: false,
        deliveryCost: PVZ_PRICE,
      },
    })

    expect(res.statusCode).toBe(201)
    expect(res.json().deliveryPoint).toEqual(point)

    const row = await prisma.order.findFirstOrThrow()
    expect(row.deliveryPoint).toEqual(point)
    expect(row.deliveryAddress).toEqual({ city: 'Москва' })
    expect(row.deliveryMethod).toBe('cdek')
    expect(row.deliveryCost).toBe(PVZ_PRICE)
    expect(row.total).toBe(row.subtotal + PVZ_PRICE - row.bonusUsed)

    // Тариф ПВЗ, а не курьерский, и вес — из корзины в БД (2 шт × 2.5 кг),
    // а не из запроса покупателя.
    expect(cdek.getCourierQuote).not.toHaveBeenCalled()
    const [addressArg, pkgArg] = vi.mocked(cdek.getPickupPointQuote).mock.calls[0]
    expect(addressArg.pickupPoint).toEqual(point)
    expect(addressArg.city).toBe('Москва')
    expect(pkgArg.weightKg).toBe(5)
  })

  it('заниженная клиентом стоимость доставки → 409 DELIVERY_COST_CHANGED, заказа нет', async () => {
    const prisma = getTestPrisma()
    const { variant } = await createProductWithVariant({ price: 100000, stock: 10, weight: 1 })
    const user = await createUser()
    const cart = await createCart(user.id, [{ variantId: variant.id, quantity: 1 }])

    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, user.id),
      payload: {
        cartId: cart.id,
        deliveryMethod: 'cdek',
        deliveryAddress: { city: 'Москва' },
        deliveryPoint: point,
        hasSpecialPackaging: false,
        deliveryCost: 0,
      },
    })

    expect(res.statusCode).toBe(409)
    expect(res.json().code).toBe('DELIVERY_COST_CHANGED')
    expect(res.json().actualDeliveryCost).toBe(PVZ_PRICE)
    expect(await prisma.order.count()).toBe(0)
  })

  it('cdek без пункта выдачи считается по курьерскому тарифу, deliveryPoint остаётся пустым', async () => {
    const prisma = getTestPrisma()
    const { variant } = await createProductWithVariant({ price: 100000, stock: 10, weight: 1 })
    const user = await createUser()
    const cart = await createCart(user.id, [{ variantId: variant.id, quantity: 1 }])

    const res = await app.inject({
      method: 'POST',
      url: '/api/orders',
      headers: authHeader(app, user.id),
      payload: {
        cartId: cart.id,
        deliveryMethod: 'cdek',
        deliveryAddress: { city: 'Москва', street: 'ул. Тверская', house: '1' },
        hasSpecialPackaging: false,
        deliveryCost: COURIER_PRICE,
      },
    })

    expect(res.statusCode).toBe(201)

    const row = await prisma.order.findFirstOrThrow()
    expect(row.deliveryPoint).toBeNull()
    expect(row.deliveryCost).toBe(COURIER_PRICE)
    expect(cdek.getPickupPointQuote).not.toHaveBeenCalled()
  })
})
