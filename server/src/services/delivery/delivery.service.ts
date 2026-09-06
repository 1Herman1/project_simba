import type { DeliveryAddress, DeliveryPackage, DeliveryQuote, DeliveryOrder, DeliveryProvider, DeliveryMethod, DeliveryOptionKey, DeliveryKind, PickupPointProvider, PickupPoint } from './types.js'
import { getCityCoords } from './city-coords.js'
import * as simba from './providers/simba.js'
import * as yandex from './providers/yandex.js'
import * as yandexPvz from './providers/yandex-pvz.js'
import * as cdek from './providers/cdek.js'
import * as ozon from './providers/ozon.js'
import * as dostavista from './providers/dostavista.js'
import * as post from './providers/post.js'

// Самовывоз — всегда доступен, без API
function getPickupQuote(): DeliveryQuote {
  return {
    provider: 'pickup',
    key: 'pickup',
    kind: 'store',
    title: 'Самовывоз',
    description: 'Магазин на ул. Ленина, 12 — бесплатно',
    price: 0,
    daysMin: 0,
    daysMax: 0,
    available: true,
  }
}

// Единая функция для недоступных вариантов
function unavailable(
  provider: DeliveryProvider,
  key: DeliveryOptionKey,
  kind: DeliveryKind,
  title: string,
  reason: string
): DeliveryQuote {
  return {
    provider,
    key,
    kind,
    title,
    description: '',
    price: 0,
    daysMin: 0,
    daysMax: 0,
    available: false,
    error: reason,
  }
}

// Получить котировку для выбранного способа доставки
export async function getQuoteForMethod(
  method: DeliveryMethod,
  address: DeliveryAddress,
  pkg: DeliveryPackage
): Promise<DeliveryQuote> {
  if (method === 'pickup') {
    return getPickupQuote()
  }

  let quote: DeliveryQuote

  if (address.pickupPoint) {
    // Если выбран пункт выдачи, проверяем, что он принадлежит выбранной службе
    if (address.pickupPoint.provider !== method) {
      throw new Error('Пункт выдачи не принадлежит выбранной службе')
    }

    // Получаем PVZ-квоту
    if (method === 'cdek') {
      quote = await cdek.getPickupPointQuote(address, pkg)
    } else if (method === 'yandex') {
      quote = await yandexPvz.getPickupPointQuote(address, pkg)
    } else {
      throw new Error(`Служба ${method} не поддерживает пункты выдачи`)
    }
  } else {
    // Получаем курьерскую котировку
    switch (method) {
      case 'yandex':
        quote = await yandex.getQuote(address, pkg)
        break
      case 'cdek':
        quote = await cdek.getCourierQuote(address, pkg)
        break
      case 'ozon':
        quote = await ozon.getQuote(address, pkg)
        break
      case 'dostavista':
        quote = await dostavista.getQuote(address, pkg)
        break
      case 'post':
        quote = await post.getQuote(address, pkg)
        break
      default:
        throw new Error(`Неизвестный способ доставки: ${method}`)
    }
  }

  if (!quote.available) {
    throw new Error('Выбранный способ доставки недоступен')
  }

  return quote
}

// Кэш пунктов выдачи: у Москвы тысячи точек, меняются они раз в неделю, а
// дёргать обе службы на каждого покупателя нельзя. Ключ `${provider}:${city}`,
// срок сутки. Кэшируется только успешный ответ: закэшировать «пунктов нет»
// после сбоя службы значило бы прятать все пункты города на сутки.
const PICKUP_POINTS_TTL_MS = 24 * 60 * 60 * 1000
const pickupPointsCache = new Map<string, { points: PickupPoint[]; expiresAt: number }>()

export async function listPickupPoints(
  provider: PickupPointProvider,
  city: string,
  near?: { lat: number; lon: number }
): Promise<PickupPoint[]> {
  const cacheKey = `${provider}:${city.toLowerCase().trim()}`
  const now = Date.now()

  const cached = pickupPointsCache.get(cacheKey)
  if (cached && now < cached.expiresAt) return cached.points

  let points: PickupPoint[]
  if (provider === 'cdek') {
    points = await cdek.listPickupPoints(city)
  } else {
    // Яндекс отдаёт пункты только по прямоугольнику координат, а у нас есть
    // лишь название города — центр берём из справочников.
    const center = near ?? (await getCityCoords(city))
    points = center ? await yandexPvz.listPickupPoints(center) : []
  }

  pickupPointsCache.set(cacheKey, { points, expiresAt: now + PICKUP_POINTS_TTL_MS })
  return points
}

/** Для тестов: кэш живёт в модуле, между тестами его надо опустошать. */
export function clearPickupPointsCache() {
  pickupPointsCache.clear()
}

// Получить котировки от всех провайдеров параллельно
export async function getAllQuotes(
  address: DeliveryAddress,
  pkg: DeliveryPackage
): Promise<DeliveryQuote[]> {
  const [simbaQ, cdekCourierQ, cdekPvzQ, yandexCourierQ, yandexPvzQ, ozonQ, dostavistaQ, postQ] = await Promise.allSettled([
    simba.getQuote(address, pkg),
    cdek.getCourierQuote(address, pkg),
    cdek.getPickupPointQuote(address, pkg),
    yandex.getQuote(address, pkg),
    yandexPvz.getPickupPointQuote(address, pkg),
    ozon.getQuote(address, pkg),
    dostavista.getQuote(address, pkg),
    post.getQuote(address, pkg),
  ])

  const settled = (
    result: PromiseSettledResult<DeliveryQuote>,
    provider: DeliveryProvider,
    key: DeliveryOptionKey,
    kind: DeliveryKind,
    title: string
  ): DeliveryQuote =>
    result.status === 'fulfilled' ? result.value : unavailable(provider, key, kind, title, String(result.reason))

  return [
    settled(simbaQ, 'simba_courier', 'simba_courier', 'courier', 'Курьер Simba'),
    settled(cdekCourierQ, 'cdek', 'cdek_courier', 'courier', 'СДЭК'),
    settled(cdekPvzQ, 'cdek', 'cdek_pvz', 'pickup_point', 'СДЭК'),
    settled(yandexCourierQ, 'yandex', 'yandex_courier', 'courier', 'Яндекс Доставка'),
    settled(yandexPvzQ, 'yandex', 'yandex_pvz', 'pickup_point', 'Яндекс Доставка'),
    settled(ozonQ, 'ozon', 'ozon_delivery', 'courier', 'Ozon Delivery'),
    settled(dostavistaQ, 'dostavista', 'dostavista_express', 'courier', 'Достависта'),
    settled(postQ, 'post', 'post_parcel', 'courier', 'Почта России'),
    getPickupQuote(),
  ]
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
