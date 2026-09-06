import { lookupCity } from './providers/cdek.js'
import { suggestAddress } from '../address/dadata.js'

export type CityCoords = { lat: number; lon: number }

const cache = new Map<string, CityCoords | null>()

/**
 * Центр города по названию. Нужен Яндексу: его список пунктов выдачи
 * принимает только прямоугольник координат. Источники по очереди — справочник
 * городов СДЭК (в нём есть координаты) и DaData; неподключённый источник
 * молча пропускается, а вот сбой подключённого уходит наружу исключением:
 * иначе разовая сетевая ошибка запоминалась бы как «такого города нет», и
 * пункты Яндекса пропадали бы для него на сутки.
 */
export async function getCityCoords(city: string): Promise<CityCoords | null> {
  const key = city.toLowerCase().trim()
  const cached = cache.get(key)
  if (cached !== undefined) return cached

  let coords: CityCoords | null = null

  // lookupCity сам отвечает null без реквизитов и бросает при сбое API.
  const fromCdek = await lookupCity(city)
  if (fromCdek?.lat !== undefined && fromCdek.lon !== undefined) {
    coords = { lat: fromCdek.lat, lon: fromCdek.lon }
  } else if (process.env.DADATA_TOKEN) {
    const hit = (await suggestAddress(city)).find((s) => s.lat !== undefined && s.lon !== undefined)
    if (hit?.lat !== undefined && hit.lon !== undefined) coords = { lat: hit.lat, lon: hit.lon }
  }

  cache.set(key, coords)
  return coords
}
