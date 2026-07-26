import type { DeliveryAddress, DeliveryPackage, DeliveryQuote, DeliveryOrder } from '../types.js'

// Яндекс Доставка API
// Документация: https://yandex.ru/dev/delivery-3/doc/dg/concepts/about.html

const BASE_URL = 'https://b2b.taxi.yandex.net/b2b/cargo/integration/v2'

export async function getQuote(
  address: DeliveryAddress,
  pkg: DeliveryPackage
): Promise<DeliveryQuote> {
  const base: DeliveryQuote = {
    provider: 'yandex',
    key: 'yandex_delivery',
    title: 'Яндекс Доставка',
    description: 'Быстрая доставка до двери',
    price: 0,
    daysMin: 0,
    daysMax: 0,
    available: false,
  }

  if (!process.env.YANDEX_DELIVERY_TOKEN) {
    // API не настроен — служба недоступна
    return { ...base, available: false, error: 'Служба доставки не подключена' }
  }

  try {
    const res = await fetch(`${BASE_URL}/check-price`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.YANDEX_DELIVERY_TOKEN}`,
        'Accept-Language': 'ru',
      },
      body: JSON.stringify({
        items: [{
          size: {
            length: (pkg.lengthCm ?? 30) / 100,
            width: (pkg.widthCm ?? 20) / 100,
            height: (pkg.heightCm ?? 15) / 100,
          },
          weight: pkg.weightKg,
          quantity: 1,
        }],
        route_points: [
          { coordinates: [37.617617, 55.755864] }, // Москва — заменить на реальный склад
          {
            coordinates: [address.lon ?? 37.617617, address.lat ?? 55.755864],
            fullname: `${address.city}, ${address.street}, ${address.house}`,
          },
        ],
        type: 'cargo',
      }),
    })

    if (!res.ok) throw new Error(`Yandex price check failed: ${res.status}`)
    const data = await res.json() as { price?: string; currency?: string }

    return {
      ...base,
      available: true,
      price: Math.round(parseFloat(data.price ?? '0') * 100),
    }
  } catch (err) {
    return { ...base, available: false, error: String(err) }
  }
}

export async function createOrder(
  address: DeliveryAddress,
  pkg: DeliveryPackage,
  orderId: string,
  recipientPhone: string
): Promise<DeliveryOrder> {
  if (!process.env.YANDEX_DELIVERY_TOKEN) {
    return { externalId: `YA-MOCK-${orderId}`, trackingNumber: `YA${Date.now()}` }
  }

  const res = await fetch(`${BASE_URL}/claims/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.YANDEX_DELIVERY_TOKEN}`,
    },
    body: JSON.stringify({
      items: [{
        size: {
          length: (pkg.lengthCm ?? 30) / 100,
          width: (pkg.widthCm ?? 20) / 100,
          height: (pkg.heightCm ?? 15) / 100,
        },
        weight: pkg.weightKg,
        title: 'Корм для животных',
        quantity: 1,
        cost_value: '0',
        cost_currency: 'RUB',
      }],
      route_points: [
        {
          point_id: 1,
          visit_order: 1,
          address: { fullname: 'Москва, ул. Склад, 1', coordinates: [37.617617, 55.755864] },
          contact: { name: 'Simba', phone: '+70000000000' },
          type: 'source',
        },
        {
          point_id: 2,
          visit_order: 2,
          address: {
            fullname: `${address.city}, ${address.street}, ${address.house}`,
            coordinates: [address.lon ?? 37.617617, address.lat ?? 55.755864],
          },
          contact: { name: 'Получатель', phone: recipientPhone },
          type: 'destination',
        },
      ],
      emergency_contact: { name: 'Simba', phone: '+70000000000' },
    }),
  })

  if (!res.ok) throw new Error(`Yandex create order failed: ${res.status}`)
  const data = await res.json() as { id: string }

  return {
    externalId: data.id,
    trackingUrl: `https://go.yandex/route/${data.id}`,
  }
}
