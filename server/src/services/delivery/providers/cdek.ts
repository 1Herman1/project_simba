import type { DeliveryAddress, DeliveryPackage, DeliveryQuote, DeliveryOrder } from '../types.js'

// СДЭК API v2: https://api.cdek.ru/v2
// Документация: https://api-docs.cdek.ru/

const BASE_URL = 'https://api.cdek.ru/v2'
const SANDBOX_URL = 'https://api.edu.cdek.ru/v2'

async function getToken(): Promise<string> {
  const clientId = process.env.CDEK_CLIENT_ID
  const clientSecret = process.env.CDEK_CLIENT_SECRET
  const isSandbox = process.env.CDEK_SANDBOX === 'true'

  if (!clientId || !clientSecret) throw new Error('CDEK credentials not set')

  const url = `${isSandbox ? SANDBOX_URL : BASE_URL}/oauth/token`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!res.ok) throw new Error(`CDEK auth failed: ${res.status}`)
  const data = await res.json() as { access_token: string }
  return data.access_token
}

export async function getQuote(
  address: DeliveryAddress,
  pkg: DeliveryPackage
): Promise<DeliveryQuote> {
  const base: DeliveryQuote = {
    provider: 'cdek',
    key: 'cdek_pvz',
    title: 'СДЭК',
    description: 'Пункт выдачи или курьер',
    price: 0,
    daysMin: 2,
    daysMax: 5,
    available: false,
  }

  if (!process.env.CDEK_CLIENT_ID) {
    // API не настроен — возвращаем заглушку
    return { ...base, available: true, price: 0, error: undefined }
  }

  try {
    const token = await getToken()
    const isSandbox = process.env.CDEK_SANDBOX === 'true'
    const url = `${isSandbox ? SANDBOX_URL : BASE_URL}/calculator/tarifflist`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        from_location: { city: 'Москва' },
        to_location: { city: address.city, address: `${address.street} ${address.house}` },
        packages: [{
          weight: Math.ceil(pkg.weightKg * 1000), // граммы
          length: pkg.lengthCm ?? 30,
          width: pkg.widthCm ?? 20,
          height: pkg.heightCm ?? 15,
        }],
      }),
    })

    if (!res.ok) throw new Error(`CDEK calculate failed: ${res.status}`)
    const data = await res.json() as { tariff_codes?: { delivery_sum: number; period_min: number; period_max: number }[] }

    const tariff = data.tariff_codes?.[0]
    if (!tariff) throw new Error('No tariffs')

    return {
      ...base,
      available: true,
      price: Math.round(tariff.delivery_sum * 100),
      daysMin: tariff.period_min,
      daysMax: tariff.period_max,
    }
  } catch (err) {
    return { ...base, available: false, error: String(err) }
  }
}

export async function createOrder(
  address: DeliveryAddress,
  pkg: DeliveryPackage,
  orderId: string
): Promise<DeliveryOrder> {
  if (!process.env.CDEK_CLIENT_ID) {
    return { externalId: `CDEK-MOCK-${orderId}`, trackingNumber: `CDEK${Date.now()}` }
  }

  const token = await getToken()
  const isSandbox = process.env.CDEK_SANDBOX === 'true'
  const url = `${isSandbox ? SANDBOX_URL : BASE_URL}/orders`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      number: orderId,
      tariff_code: 136, // СДЭК до склада
      recipient: {
        name: 'Получатель',
        phones: [{ number: '+70000000000' }],
      },
      to_location: {
        city: address.city,
        address: `${address.street}, ${address.house}`,
        postal_code: address.postalCode,
      },
      packages: [{
        number: `PKG-${orderId}`,
        weight: Math.ceil(pkg.weightKg * 1000),
        length: pkg.lengthCm ?? 30,
        width: pkg.widthCm ?? 20,
        height: pkg.heightCm ?? 15,
      }],
    }),
  })

  if (!res.ok) throw new Error(`CDEK create order failed: ${res.status}`)
  const data = await res.json() as { entity?: { uuid: string }; requests?: { state: string }[] }

  return {
    externalId: data.entity?.uuid ?? orderId,
    trackingUrl: `https://www.cdek.ru/ru/tracking/?order_id=${data.entity?.uuid}`,
  }
}
