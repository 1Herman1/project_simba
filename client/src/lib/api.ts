import axios from 'axios'

// ─── HTTP клиент ────────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

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
  sendOtp: (contact: string, channel: 'email' | 'sms') => {
    const body = channel === 'email' ? { email: contact, channel } : { phone: contact, channel }
    return api.post('/api/auth/send-otp', body)
  },

  verifyOtp: (contact: string, code: string) => {
    const isEmail = contact.includes('@')
    const body = isEmail ? { email: contact, code } : { phone: contact, code }
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
    tags?: string[]
    sort?: string
    page?: number
    limit?: number
  }) => api.get<{ items: Product[]; total: number; page: number; pages: number }>('/api/products/list', { params }),

  bySlug: (slug: string) =>
    api.get<Product>(`/api/products/${slug}`),

  related: (slug: string) =>
    api.get<Product[]>(`/api/products/${slug}/related`),
}

// ─── Категории ───────────────────────────────────────────────────────────────

export const categoriesApi = {
  tree: () =>
    api.get('/api/categories/tree'),
}

// ─── Бренды ──────────────────────────────────────────────────────────────────

export const brandsApi = {
  list: () =>
    api.get('/api/brands'),
}

// ─── Избранное ───────────────────────────────────────────────────────────────

export interface Favorite {
  userId: string
  productId: string
  createdAt: string
  product: Product
}

export const favoritesApi = {
  getAll: () =>
    api.get<Favorite[]>('/api/favorites'),

  add: (productId: string) =>
    api.post<Favorite>(`/api/favorites/${productId}`),

  remove: (productId: string) =>
    api.delete(`/api/favorites/${productId}`),
}

// ─── Корзина ─────────────────────────────────────────────────────────────────

export const cartApi = {
  get: () =>
    api.get<Cart>('/api/cart'),

  addItem: (productVariantId: string, quantity = 1) =>
    api.post<Cart>('/api/cart/items', { productVariantId, quantity }),

  updateItem: (cartItemId: string, quantity: number) =>
    api.put<Cart>(`/api/cart/items/${cartItemId}`, { quantity }),

  removeItem: (cartItemId: string) =>
    api.delete<Cart>(`/api/cart/items/${cartItemId}`),

  clear: () =>
    api.delete('/api/cart'),
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
