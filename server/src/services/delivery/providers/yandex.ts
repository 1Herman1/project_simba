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

  // Без координат считать нечего. Раньше здесь молча подставлялся центр Москвы,
  // и покупателю из любого другого места показывалась цена доставки до центра
  // столицы — то есть заведомо неверная. Лучше не предлагать службу, чем
  // назвать цену, которой не будет.
  if (address.lat === undefined || address.lon === undefined) {
    return { ...base, available: false, error: 'Уточните адрес на карте' }
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
            coordinates: [address.lon, address.lat],
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

  // Заказ без координат отправлять нельзя: подстановка центра Москвы, которая
  // стояла здесь, отправила бы курьера не туда, а покупатель узнал бы об этом
  // последним. Котировка до этого шага уже отказывает по той же причине.
  if (address.lat === undefined || address.lon === undefined) {
    throw new Error('Для Яндекс.Доставки нужен адрес, уточнённый на карте')
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
            coordinates: [address.lon, address.lat],
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
