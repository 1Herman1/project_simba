import type { DeliveryKind, DeliveryOptionKey, PickupPoint, PickupPointProvider } from '@simba/shared'

export type { DeliveryKind, DeliveryOptionKey, PickupPoint, PickupPointProvider }

export interface DeliveryAddress {
  city: string
  street?: string
  house?: string
  apartment?: string
  postalCode?: string
  lat?: number
  lon?: number
  /** Выбранный пункт выдачи — для вариантов вида pickup_point. */
  pickupPoint?: PickupPoint
}

export interface DeliveryPackage {
  weightKg: number   // суммарный вес заказа в кг
  lengthCm?: number
  widthCm?: number
  heightCm?: number
}

export interface DeliveryQuote {
  provider: DeliveryProvider
  key: DeliveryOptionKey  // вариант, который видит покупатель
  /// По виду чекаут решает, что спросить: адрес, пункт на карте или ничего.
  kind: DeliveryKind
  title: string           // название для показа пользователю
  description: string
  price: number           // в копейках
  daysMin: number
  daysMax: number
  available: boolean
  error?: string          // если не доступен — причина
}

export interface DeliveryOrder {
  externalId: string      // ID заказа у провайдера
  trackingNumber?: string
  trackingUrl?: string
}

export type DeliveryProvider =
  | 'simba_courier'
  | 'yandex'
  | 'cdek'
  | 'ozon'
  | 'dostavista'
  | 'post'
  | 'pickup'

export type DeliveryMethod =
  | 'yandex'
  | 'cdek'
  | 'ozon'
  | 'dostavista'
  | 'post'
  | 'pickup'
