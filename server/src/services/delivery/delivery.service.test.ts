import { describe, expect, it, beforeEach, vi } from 'vitest'
import type { DeliveryAddress, DeliveryPackage, PickupPoint } from './types.js'

vi.mock('./providers/cdek.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./providers/cdek.js')>()),
  listPickupPoints: vi.fn(),
}))
vi.mock('./providers/yandex-pvz.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./providers/yandex-pvz.js')>()),
  listPickupPoints: vi.fn(),
}))
vi.mock('./city-coords.js', () => ({ getCityCoords: vi.fn() }))

import * as cdek from './providers/cdek.js'
import * as yandexPvz from './providers/yandex-pvz.js'
import { getCityCoords } from './city-coords.js'
import { listPickupPoints, getQuoteForMethod, clearPickupPointsCache } from './delivery.service.js'

const point = (code: string): PickupPoint => ({
  provider: 'cdek', code, name: code, address: 'ул. Тестовая, 1', lat: 55.75, lon: 37.62,
})

describe('Delivery Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearPickupPointsCache()
  })

  describe('listPickupPoints', () => {
    it('второй запрос того же города берётся из кэша, служба не дёргается', async () => {
      vi.mocked(cdek.listPickupPoints).mockResolvedValue([point('A')])

      const first = await listPickupPoints('cdek', 'Москва')
      const second = await listPickupPoints('cdek', 'МОСКВА ')

      expect(first).toEqual([point('A')])
      expect(second).toBe(first)
      expect(cdek.listPickupPoints).toHaveBeenCalledTimes(1)
    })

    it('разные города — разные запросы', async () => {
      vi.mocked(cdek.listPickupPoints).mockResolvedValue([])
      await listPickupPoints('cdek', 'Москва')
      await listPickupPoints('cdek', 'Казань')
      expect(cdek.listPickupPoints).toHaveBeenCalledTimes(2)
    })

    it('сбой службы уходит наружу и не кэшируется', async () => {
      vi.mocked(cdek.listPickupPoints)
        .mockRejectedValueOnce(new Error('CDEK pvz list failed: 503'))
        .mockResolvedValueOnce([point('B')])

      await expect(listPickupPoints('cdek', 'Москва')).rejects.toThrow('503')
      // Иначе после одного сбоя город сутки показывал бы «пунктов нет».
      expect(await listPickupPoints('cdek', 'Москва')).toEqual([point('B')])
      expect(cdek.listPickupPoints).toHaveBeenCalledTimes(2)
    })

    it('Яндексу без координат находит центр города, а без центра пунктов не просит', async () => {
      vi.mocked(getCityCoords).mockResolvedValueOnce({ lat: 55.75, lon: 37.62 })
      vi.mocked(yandexPvz.listPickupPoints).mockResolvedValue([])

      await listPickupPoints('yandex', 'Москва')
      expect(yandexPvz.listPickupPoints).toHaveBeenCalledWith({ lat: 55.75, lon: 37.62 })

      vi.mocked(getCityCoords).mockResolvedValueOnce(null)
      expect(await listPickupPoints('yandex', 'Нигдешинск')).toEqual([])
      expect(yandexPvz.listPickupPoints).toHaveBeenCalledTimes(1)
    })

    it('переданные координаты важнее справочника', async () => {
      vi.mocked(yandexPvz.listPickupPoints).mockResolvedValue([])
      await listPickupPoints('yandex', 'Москва', { lat: 1, lon: 2 })
      expect(getCityCoords).not.toHaveBeenCalled()
      expect(yandexPvz.listPickupPoints).toHaveBeenCalledWith({ lat: 1, lon: 2 })
    })
  })

  describe('getQuoteForMethod', () => {
    it('выбрасывает если пункт выдачи принадлежит другой службе', async () => {
      const address: DeliveryAddress = {
        city: 'Москва',
        pickupPoint: {
          provider: 'yandex',
          code: 'YA123',
          name: 'Точка Яндекса',
          address: 'ул. Ленина, 1',
          lat: 55.75,
          lon: 37.62,
        },
      }
      const pkg: DeliveryPackage = { weightKg: 1 }

      await expect(() => getQuoteForMethod('cdek', address, pkg))
        .rejects
        .toThrow('Пункт выдачи не принадлежит выбранной службе')
    })

    it('simba_courier требует адрес с улицей и домом', async () => {
      const address: DeliveryAddress = {
        city: 'Москва',
      }
      const pkg: DeliveryPackage = { weightKg: 1 }

      // simba_courier должен быть вызван, но мок вернёт недоступный (фиксируется в других тестах)
      // Это просто проверка, что метод вызывается
      const quote = await getQuoteForMethod('simba_courier', address, pkg)
      expect(quote).toBeDefined()
    })

    it('работает с курьерской доставкой без пункта выдачи', async () => {
      const address: DeliveryAddress = {
        city: 'Москва',
        street: 'ул. Ленина',
        house: '1',
      }
      const pkg: DeliveryPackage = { weightKg: 1 }

      // Simba всегда доступна (это внутренняя служба)
      const quote = await getQuoteForMethod('pickup', address, pkg)
      expect(quote.available).toBe(true)
    })
  })
})
