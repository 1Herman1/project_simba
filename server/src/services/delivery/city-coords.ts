import { lookupCity } from './providers/cdek.js'
import { suggestAddress } from '../address/dadata.js'

export type CityCoords = { lat: number; lon: number }

const cache = new Map<string, CityCoords | null>()

/**
 * Центр города по названию. Нужен Яндексу: его список пунктов выдачи
 * принимает только прямоугольник координат. Источники по очереди — справочник
 * городов СДЭК (в нём есть координаты) и DaData; что подключено, то и
 * отвечает. Оба не подключены — null, и пунктов Яндекса просто не будет.
 */
export async function getCityCoords(city: string): Promise<CityCoords | null> {
  const key = city.toLowerCase().trim()
  if (cache.has(key)) return cache.get(key) ?? null

  let coords: CityCoords | null = null

  const fromCdek = await lookupCity(city).catch(() => null)
  if (fromCdek?.lat !== undefined && fromCdek.lon !== undefined) {
    coords = { lat: fromCdek.lat, lon: fromCdek.lon }
  } else if (process.env.DADATA_TOKEN) {
    const suggestions = await suggestAddress(city).catch(() => [])
    const hit = suggestions.find((s) => s.lat !== undefined && s.lon !== undefined)
    if (hit && hit.lat !== undefined && hit.lon !== undefined) coords = { lat: hit.lat, lon: hit.lon }
  }

  cache.set(key, coords)
  return coords
}
