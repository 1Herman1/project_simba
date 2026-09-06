import type { DeliveryAddress, DeliveryPackage, DeliveryQuote, DeliveryOrder, DeliveryProvider, DeliveryMethod, DeliveryOptionKey, DeliveryKind, PickupPointProvider, PickupPoint } from './types.js'
import { getCityCoords } from './city-coords.js'
import * as simba from './providers/simba.js'
import * as yandexPvz from './providers/yandex-pvz.js'
import * as cdek from './providers/cdek.js'

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

  // Если выбран пункт выдачи, сначала проверяем, что он принадлежит выбранной службе
  if (address.pickupPoint) {
    if (address.pickupPoint.provider !== method) {
      throw new Error('Пункт выдачи не принадлежит выбранной службе')
    }
  }

  if (method === 'simba_courier') {
    const quote = await simba.getQuote(address, pkg)
    if (!quote.available) {
      throw new Error('Выбранный способ доставки недоступен')
    }
    return quote
  }

  // СДЭК и Яндекс доставляют только в пункты выдачи
  if (method === 'cdek') {
    if (!address.pickupPoint) {
      throw new Error('СДЭК доставляет только в пункт выдачи')
    }
    const quote = await cdek.getPickupPointQuote(address, pkg)
    if (!quote.available) {
      throw new Error('Выбранный способ доставки недоступен')
    }
    return quote
  }

  if (method === 'yandex') {
    if (!address.pickupPoint) {
      throw new Error('Яндекс Доставка доставляет только в пункт выдачи')
    }
    const quote = await yandexPvz.getPickupPointQuote(address, pkg)
    if (!quote.available) {
      throw new Error('Выбранный способ доставки недоступен')
    }
    return quote
  }

  throw new Error(`Неизвестный способ доставки: ${method}`)
}

// Кэш пунктов выдачи: у Москвы тысячи точек, меняются они раз в неделю, а
// дёргать обе службы на каждого покупателя нельзя. Ключ `${provider}:${city}`,
// срок сутки. Кэшируется только успешный ответ: закэшировать «пунктов нет»
// после сбоя службы значило бы прятать все пункты города на сутки.
const PICKUP_POINTS_TTL_MS = 24 * 60 * 60 * 1000
/// Город — строка от покупателя; без предела кэш можно раздуть выдуманными.
const PICKUP_POINTS_CACHE_MAX = 500
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

  if (pickupPointsCache.size >= PICKUP_POINTS_CACHE_MAX) {
    pickupPointsCache.delete(pickupPointsCache.keys().next().value as string)
  }
  pickupPointsCache.set(cacheKey, { points, expiresAt: now + PICKUP_POINTS_TTL_MS })
  return points
}

/** Для тестов: кэш живёт в модуле, между тестами его надо опустошать. */
export function clearPickupPointsCache() {
  pickupPointsCache.clear()
}

// Получить котировки от всех четырёх способов доставки параллельно
export async function getAllQuotes(
  address: DeliveryAddress,
  pkg: DeliveryPackage
): Promise<DeliveryQuote[]> {
  const [simbaQ, cdekPvzQ, yandexPvzQ] = await Promise.allSettled([
    simba.getQuote(address, pkg),
    cdek.getPickupPointQuote(address, pkg),
    yandexPvz.getPickupPointQuote(address, pkg),
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
    settled(cdekPvzQ, 'cdek', 'cdek_pvz', 'pickup_point', 'СДЭК'),
    settled(yandexPvzQ, 'yandex', 'yandex_pvz', 'pickup_point', 'Яндекс Доставка'),
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
    case 'cdek':
      return cdek.createOrder(address, pkg, orderId)
    case 'yandex':
      // TODO: Создание заказа Яндекс ПВЗ — отдельная задача платформы.
      // Пока используем общий метод yandex; позже переключимся на yandexPvz.createOrder
      return { externalId: `YANDEX_PVZ-${orderId}` }
    case 'pickup':
      return { externalId: `PICKUP-${orderId}` }
    default:
      throw new Error(`Unknown delivery provider: ${provider}`)
  }
}
