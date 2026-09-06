import { describe, it, expect, vi } from 'vitest'
import { createDebouncedAsync } from './debounce'

describe('createDebouncedAsync', () => {
  it('вызывает функцию один раз после паузы, с последними аргументами', async () => {
    vi.useFakeTimers()
    const fn = vi.fn(async (q: string) => q.toUpperCase())
    const debounced = createDebouncedAsync(fn, 300)

    debounced('тв')
    debounced('тве')
    const last = debounced('твер')
    expect(fn).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(300)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('твер')
    await expect(last).resolves.toBe('ТВЕР')
    vi.useRealTimers()
  })

  it('ошибка функции доходит до вызывающего', async () => {
    vi.useFakeTimers()
    const debounced = createDebouncedAsync(async () => {
      throw new Error('сеть')
    }, 100)
    const result = debounced()
    await vi.advanceTimersByTimeAsync(100)
    await expect(result).rejects.toThrow('сеть')
    vi.useRealTimers()
  })
})
