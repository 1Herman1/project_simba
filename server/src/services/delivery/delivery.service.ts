import type { DeliveryAddress, DeliveryPackage, DeliveryQuote, DeliveryOrder, DeliveryProvider } from './types.js'
import * as simba from './providers/simba.js'
import * as yandex from './providers/yandex.js'
import * as cdek from './providers/cdek.js'
import * as ozon from './providers/ozon.js'
import * as dostavista from './providers/dostavista.js'
import * as post from './providers/post.js'

// Самовывоз — всегда доступен, без API
function getPickupQuote(): DeliveryQuote {
  return {
    provider: 'pickup',
    key: 'pickup',
    title: 'Самовывоз',
    description: 'Магазин на ул. Ленина, 12 — бесплатно',
    price: 0,
    daysMin: 0,
    daysMax: 0,
    available: true,
  }
}

// Получить котировки от всех провайдеров параллельно
export async function getAllQuotes(
  address: DeliveryAddress,
  pkg: DeliveryPackage
): Promise<DeliveryQuote[]> {
  const [simbaQ, yandexQ, cdekQ, ozonQ, dostavistaQ, postQ] = await Promise.allSettled([
    simba.getQuote(address, pkg),
    yandex.getQuote(address, pkg),
    cdek.getQuote(address, pkg),
    ozon.getQuote(address, pkg),
    dostavista.getQuote(address, pkg),
    post.getQuote(address, pkg),
  ])

  const quotes: DeliveryQuote[] = [
    simbaQ.status === 'fulfilled' ? simbaQ.value : { provider: 'simba_courier', key: 'simba_courier', title: 'Курьер Simba', description: '', price: 0, daysMin: 0, daysMax: 0, available: false, error: String((simbaQ as PromiseRejectedResult).reason) },
    yandexQ.status === 'fulfilled' ? yandexQ.value : { provider: 'yandex', key: 'yandex_delivery', title: 'Яндекс Доставка', description: '', price: 0, daysMin: 0, daysMax: 0, available: false, error: String((yandexQ as PromiseRejectedResult).reason) },
    cdekQ.status === 'fulfilled' ? cdekQ.value : { provider: 'cdek', key: 'cdek_pvz', title: 'СДЭК', description: '', price: 0, daysMin: 0, daysMax: 0, available: false, error: String((cdekQ as PromiseRejectedResult).reason) },
    ozonQ.status === 'fulfilled' ? ozonQ.value : { provider: 'ozon', key: 'ozon_delivery', title: 'Ozon Delivery', description: '', price: 0, daysMin: 0, daysMax: 0, available: false, error: String((ozonQ as PromiseRejectedResult).reason) },
    dostavistaQ.status === 'fulfilled' ? dostavistaQ.value : { provider: 'dostavista', key: 'dostavista_express', title: 'Достависта', description: '', price: 0, daysMin: 0, daysMax: 0, available: false, error: String((dostavistaQ as PromiseRejectedResult).reason) },
    postQ.status === 'fulfilled' ? postQ.value : { provider: 'post', key: 'post_parcel', title: 'Почта России', description: '', price: 0, daysMin: 0, daysMax: 0, available: false, error: String((postQ as PromiseRejectedResult).reason) },
    getPickupQuote(),
  ]

  return quotes
}

// Создать заказ в выбранном сервисе доставки
export async function createDeliveryOrder(
  provider: DeliveryProvider,
  address: DeliveryAddress,
  pkg: DeliveryPackage,
  orderId: string,
  recipientName: string,
  recipientPhone: string
): Promise<DeliveryOrder> {
  switch (provider) {
    case 'simba_courier':
      return simba.createOrder(address, pkg, orderId)
    case 'yandex':
      return yandex.createOrder(address, pkg, orderId, recipientPhone)
    case 'cdek':
      return cdek.createOrder(address, pkg, orderId)
    case 'ozon':
      return ozon.createOrder(address, pkg, orderId)
    case 'dostavista':
      return dostavista.createOrder(address, pkg, orderId, recipientPhone)
    case 'post':
      return post.createOrder(address, pkg, orderId, recipientName, recipientPhone)
    case 'pickup':
      return { externalId: `PICKUP-${orderId}` }
    default:
      throw new Error(`Unknown delivery provider: ${provider}`)
  }
}
