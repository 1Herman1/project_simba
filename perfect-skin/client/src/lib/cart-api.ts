import { fetchApi, ApiError } from './api'
import type { Cart, CartWarning } from '@/types/api'

export interface DeliveryMethod {
  code: string
  title: string
  hint?: string
  cost: number
  isFree: boolean
  freeFrom?: number
  amountToFree?: number
  requiresAddress: boolean
  requiresPvzCode?: boolean
}

export interface CartApi {
  getCart(): Promise<Cart>
  addItem(variantId: string, quantity: number): Promise<Cart>
  updateItem(itemId: string, quantity: number): Promise<Cart>
  removeItem(itemId: string): Promise<Cart>
  clear(): Promise<void>
  getDeliveryMethods(promoCode?: string): Promise<DeliveryMethod[]>
  validatePromo(code: string): Promise<{ discount: number; description: string }>
}

// Live-реализация поверх API сервера
class LiveCartApi implements CartApi {
  async getCart(): Promise<Cart> {
    return fetchApi<Cart>('/api/v1/cart')
  }

  async addItem(variantId: string, quantity: number): Promise<Cart> {
    return fetchApi<Cart>('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variantId, quantity }),
    })
  }

  async updateItem(itemId: string, quantity: number): Promise<Cart> {
    return fetchApi<Cart>(`/api/v1/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
  }

  async removeItem(itemId: string): Promise<Cart> {
    return fetchApi<Cart>(`/api/v1/cart/items/${itemId}`, {
      method: 'DELETE',
    })
  }

  async clear(): Promise<void> {
    await fetchApi<void>('/api/v1/cart', {
      method: 'DELETE',
    })
  }

  async getDeliveryMethods(promoCode?: string): Promise<DeliveryMethod[]> {
    const params = new URLSearchParams()
    if (promoCode) params.append('promo', promoCode)
    return fetchApi<DeliveryMethod[]>(`/api/v1/delivery/methods?${params}`)
  }

  async validatePromo(code: string): Promise<{ discount: number; description: string }> {
    return fetchApi<{ discount: number; description: string }>('/api/v1/promo/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }
}

export function getCartApi(): CartApi {
  if (import.meta.env.VITE_API_MODE === 'snapshot') {
    return (async () => {
      const { DemoCartApi } = await import('./cart-demo')
      return new DemoCartApi()
    })() as any
  }
  return new LiveCartApi()
}

// Singleton для повторного использования
let instance: CartApi | null = null

export function cartApi(): CartApi {
  if (!instance) {
    const apiMode = import.meta.env.VITE_API_MODE
    if (apiMode === 'snapshot') {
      // В демо-режиме импортируем синхронно на момент первого обращения
      const { DemoCartApi } = require('./cart-demo')
      instance = new DemoCartApi()
    } else {
      instance = new LiveCartApi()
    }
  }
  return instance
}
