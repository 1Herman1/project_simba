import type { DeliveryAddress, DeliveryPackage, DeliveryQuote, DeliveryOrder } from '../types.js'

// Собственная курьерская служба — фиксированные правила, никакого внешнего API

export async function getQuote(
  address: DeliveryAddress,
  pkg: DeliveryPackage
): Promise<DeliveryQuote> {
  const isMoscow = address.city.toLowerCase().includes('москв')
  const isSPb = address.city.toLowerCase().includes('петербург') || address.city.toLowerCase().includes('питер')

  if (!isMoscow && !isSPb) {
    return {
      provider: 'simba_courier',
      key: 'simba_courier',
      title: 'Курьер Simba',
      description: 'Доставка до двери',
      price: 0,
      daysMin: 0,
      daysMax: 0,
      available: false,
      error: 'Доступно только по Москве и Санкт-Петербургу',
    }
  }

  // Бесплатно от 2000 руб (200000 копеек) — но вес тоже считаем
  const price = pkg.weightKg > 15 ? 29900 : 0

  return {
    provider: 'simba_courier',
    key: 'simba_courier',
    title: 'Курьер Simba',
    description: 'Доставка до двери сегодня',
    price,
    daysMin: 0,
    daysMax: 0,
    available: true,
  }
}

export async function createOrder(
  address: DeliveryAddress,
  pkg: DeliveryPackage,
  orderId: string
): Promise<DeliveryOrder> {
  // Внутренний заказ — просто фиксируем
  return {
    externalId: `SIMBA-${orderId}`,
    trackingNumber: `SM${Date.now()}`,
  }
}
