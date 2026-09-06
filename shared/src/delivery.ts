/**
 * Контракт доставки, общий для витрины и сервера.
 *
 * Способ доставки — это служба ПЛЮС вид: СДЭК умеет и до двери, и в пункт
 * выдачи, и покупатель выбирает между ними. Поэтому ключ варианта (`cdek_pvz`)
 * и служба (`cdek`) — разные вещи: заказу пишется служба, а вид определяется
 * тем, есть ли у заказа выбранный пункт.
 */

/** Как заказ попадает к покупателю. */
export type DeliveryKind = 'courier' | 'pickup_point' | 'store'

/** Ключи вариантов, которые показывает чекаут. */
export type DeliveryOptionKey =
  | 'simba_courier'
  | 'cdek_courier'
  | 'cdek_pvz'
  | 'yandex_courier'
  | 'yandex_pvz'
  | 'pickup'
  // Заглушки служб, которые пока не подключены: до двери, без карты.
  | 'post_parcel'
  | 'ozon_delivery'
  | 'dostavista_express'

/** Службы, у которых есть пункты выдачи. */
export type PickupPointProvider = 'cdek' | 'yandex'

/**
 * Пункт выдачи. В заказе хранится целиком: если пункт закроется или сменит
 * адрес, в заказе должно остаться то, куда реально везли.
 */
export interface PickupPoint {
  provider: PickupPointProvider
  /** Код пункта у службы: `MSK123` у СДЭК, `platform_station_id` у Яндекса. */
  code: string
  name: string
  /** Полный адрес одной строкой. */
  address: string
  lat: number
  lon: number
  workTime?: string
  phone?: string
}

export function deliveryKindOf(key: DeliveryOptionKey): DeliveryKind {
  if (key === 'pickup') return 'store'
  if (key.endsWith('_pvz')) return 'pickup_point'
  return 'courier'
}
