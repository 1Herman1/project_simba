import axios from 'axios'
import type { QuizAnswers } from './quiz-config'

// ─── HTTP клиент ────────────────────────────────────────────────────────────

// Без явного VITE_API_URL на проде бьём по своему же домену: адрес получается
// относительным, и запрос уходит туда, откуда отдан сайт. На Vercel его
// подхватывает правило перенаправления /api/* на сервер — браузер при этом
// видит только https-адрес витрины, поэтому нет ни mixed content, ни CORS.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000'),
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  const guestToken = localStorage.getItem('guestToken')
  const authToken = token || guestToken
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token')
      // Если был обычный токен (не гостевой) — редирект на /auth
      if (token) {
        localStorage.removeItem('token')
        window.location.href = '/auth'
      } else {
        // Гостевой токен истёк — просто удаляем, не выкидываем гостя
        localStorage.removeItem('guestToken')
      }
    }
    return Promise.reject(error)
  }
)

/**
 * Убедиться, что у гостя есть гостевой токен.
 * Если нет ни обычного токена, ни гостевого — запросить гостевую сессию.
 */
export async function ensureGuestSession(): Promise<void> {
  const token = localStorage.getItem('token')
  const guestToken = localStorage.getItem('guestToken')

  if (token || guestToken) {
    // Уже есть токен
    return
  }

  try {
    const res = await api.post<{ token: string }>('/api/auth/guest-session')
    localStorage.setItem('guestToken', res.data.token)
  } catch {
    // Ошибка при создании гостевой сессии — просто продолжаем, может быть сетевая ошибка
    console.error('Failed to create guest session')
  }
}

// ─── Типы ───────────────────────────────────────────────────────────────────

export interface ProductVariant {
  id: string
  weight: number
  price: number
  oldPrice: number | null
  stock: number
  sku: string | null
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  brand: { id: string; name: string; slug: string } | null
  images: string[]
  isGrainFree: boolean
  isHypoallergenic: boolean
  isWeightControl: boolean
  isFeatured: boolean
  protein: number | null
  fat: number | null
  fiber: number | null
  ash: number | null
  ingredients: string | null
  variants: ProductVariant[]
  categories: { category: { id: string; name: string; slug: string } }[]
}

export interface CartItem {
  id: string
  productVariantId: string
  productId: string
  quantity: number
  productVariant: ProductVariant & { product: Pick<Product, 'id' | 'name' | 'slug' | 'images'> }
}

export interface Cart {
  id: string
  items: CartItem[]
}

export interface Order {
  id: string
  status: 'new' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'
  deliveryMethod: string
  subtotal: number
  total: number
  bonusUsed: number
  bonusEarned: number
  promoCode?: string
  paymentStatus: string
  createdAt: string
  items: {
    id: string
    productName: string
    variantWeight: number
    price: number
    quantity: number
  }[]
}

export interface User {
  userId: string
  name: string
  email: string | null
  phone: string | null
  bonusPoints: number
  bonusLevel: 'newcomer' | 'active' | 'premium'
  role: string
}

export interface DeliveryQuote {
  provider: string
  key: string
  title: string
  description: string
  price: number
  daysMin: number
  daysMax: number
  available: boolean
  error?: string
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (email: string) =>
    api.post('/api/auth/send-otp', { email }),

  verifyOtp: (email: string, code: string, guestToken?: string) => {
    const body: { email: string; code: string; guestToken?: string } = { email, code }
    if (guestToken) body.guestToken = guestToken
    return api.post<{ token: string; user: User }>('/api/auth/verify-otp', body)
  },

  me: () =>
    api.get<User>('/api/auth/me'),
}

// ─── Пользователи ────────────────────────────────────────────────────────────

export const usersApi = {
  updateProfile: (data: { name?: string; phone?: string; email?: string }) =>
    api.put<User>('/api/users/profile', data),
}

// ─── Товары ──────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: {
    search?: string
    category?: string
    brand?: string
    format?: 'dry' | 'wet'
    purpose?: 'medical'
    tags?: string[]
    sort?: string
    page?: number
    limit?: number
    featured?: 'true' | 'false'
  }) => api.get<{ items: Product[]; total: number; page: number; pages: number }>('/api/products/list', { params }),

  popular: (limit?: number) =>
    api.get<{ items: Product[]; basis: 'sales' | 'curated' }>('/api/products/popular', { params: { limit } }),

  bySlug: (slug: string) =>
    api.get<Product>(`/api/products/${slug}`),

  related: (slug: string) =>
    api.get<Product[]>(`/api/products/${slug}/related`),
}

// ─── Категории ───────────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  slug: string
}

export const categoriesApi = {
  tree: () =>
    api.get<Category[]>('/api/categories/tree'),
}

// ─── Бренды ──────────────────────────────────────────────────────────────────

export interface Brand {
  id: string
  name: string
  slug: string
  logo: string | null
  productCount: number
}

export const brandsApi = {
  list: () =>
    api.get<Brand[]>('/api/brands'),
}

// ─── Избранное ───────────────────────────────────────────────────────────────

export interface Favorite {
  userId: string
  productId: string
  createdAt: string
  product: Product
}

export const favoritesApi = {
  getAll: async () => {
    await ensureGuestSession()
    return api.get<Favorite[]>('/api/favorites')
  },

  add: async (productId: string) => {
    await ensureGuestSession()
    return api.post<Favorite>(`/api/favorites/${productId}`)
  },

  remove: async (productId: string) => {
    await ensureGuestSession()
    return api.delete(`/api/favorites/${productId}`)
  },
}

// ─── Корзина ─────────────────────────────────────────────────────────────────

export const cartApi = {
  get: async () => {
    await ensureGuestSession()
    return api.get<Cart>('/api/cart')
  },

  addItem: async (productVariantId: string, quantity = 1) => {
    await ensureGuestSession()
    return api.post<Cart>('/api/cart/items', { productVariantId, quantity })
  },

  updateItem: async (cartItemId: string, quantity: number) => {
    await ensureGuestSession()
    return api.put<Cart>(`/api/cart/items/${cartItemId}`, { quantity })
  },

  removeItem: async (cartItemId: string) => {
    await ensureGuestSession()
    return api.delete<Cart>(`/api/cart/items/${cartItemId}`)
  },

  clear: async () => {
    await ensureGuestSession()
    return api.delete('/api/cart')
  },
}

// ─── Заказы ──────────────────────────────────────────────────────────────────

export const ordersApi = {
  list: () =>
    api.get<Order[]>('/api/orders'),

  byId: (id: string) =>
    api.get<Order>(`/api/orders/${id}`),

  create: (data: {
    cartId: string
    deliveryMethod: string
    deliveryAddress?: object
    comment?: string
    hasSpecialPackaging?: boolean
    bonusUsed?: number
    promoCode?: string
    deliveryCost?: number
    paymentMethod?: 'card' | 'cash_on_delivery'
    contact?: { name?: string; email?: string; phone?: string }
  }) => api.post<Order>('/api/orders', data),
}

// ─── Доставка ────────────────────────────────────────────────────────────────

export const deliveryApi = {
  quotes: (params: {
    city: string
    street?: string
    house?: string
    postalCode?: string
    weightKg: number
  }) => api.post<{ quotes: DeliveryQuote[] }>('/api/delivery/quotes', params),

  createOrder: (data: {
    provider: string
    orderId: string
    address: object
    weightKg: number
    recipientName: string
    recipientPhone: string
  }) => api.post('/api/delivery/create', data),
}

// ─── Бонусы ──────────────────────────────────────────────────────────────

export interface BonusTransaction {
  id: string
  type: 'welcome' | 'earned' | 'spent' | 'refund_used' | 'revoke_earned' | 'admin_adjust'
  amount: number
  balanceAfter: number
  comment: string | null
  createdAt: string
  orderId: string | null
}

export const bonusesApi = {
  transactions: () =>
    api.get<BonusTransaction[]>('/api/bonuses/transactions'),
}

// ─── Квиз ────────────────────────────────────────────────────────────────

export interface QuizProductCard {
  id: string
  slug: string
  name: string
  brandName: string | null
  image: string | null
  matchScore: number
  variant: { id: string; weight: number; price: number; oldPrice: number | null; stock: number } | null
  badges: string[]
}

export interface QuizMatchResponse {
  sessionId: string
  main: QuizProductCard
  pair: QuizProductCard | null
  alternatives: QuizProductCard[]
  reasons: string[]
  disclaimers: string[]
  relaxed: string[]
  fallbackNote: string | null
  shortfall: { found: number } | null
  bonus: { amount: number; status: 'granted' | 'already_granted' | 'guest'; balance: number | null }
}

export const quizApi = {
  match: (answers: Partial<QuizAnswers>) =>
    api.post<QuizMatchResponse>('/api/quiz/match', answers),

  getSession: (id: string) =>
    api.get<QuizMatchResponse>(`/api/quiz/${id}`),

  claimBonus: (sessionId: string) =>
    api.post<{ granted: boolean; amount: number; balance: number }>('/api/quiz/claim', { sessionId }),
}
