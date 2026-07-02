import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  ordersToday: number
  ordersMonth: number
  revenueToday: number
  revenueMonth: number
  totalUsers: number
  newUsersToday: number
  totalProducts: number
  recentOrders: Order[]
}

export interface ProductVariant {
  id: string
  weight: number
  price: number
  oldPrice?: number
  stock: number
  sku?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  brandId?: string
  brand?: { id: string; name: string; slug: string } | null
  images: string[]
  isActive: boolean
  isGrainFree: boolean
  isHypoallergenic: boolean
  isWeightControl: boolean
  protein?: number
  fat?: number
  fiber?: number
  ash?: number
  ingredients?: string
  seoTitle?: string
  seoDescription?: string
  variants: ProductVariant[]
  categories: { categoryId: string }[]
  createdAt: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  _count?: { products: number }
}

export interface Banner {
  id: string
  title: string
  image: string
  link?: string
  page: 'home' | 'catalog' | 'other'
  position: 'main_slider' | 'promo_strip' | 'sidebar'
  isActive: boolean
  sortOrder: number
  createdAt: string
}

export interface OrderItem {
  id: string
  productName: string
  variantWeight: number
  price: number
  quantity: number
}

export interface Order {
  id: string
  status: string
  deliveryMethod?: string
  subtotal: number
  total: number
  bonusUsed: number
  bonusEarned: number
  paymentStatus: string
  createdAt: string
  user?: { id: string; name?: string; email?: string; phone?: string }
  items: OrderItem[]
}

export interface User {
  id: string
  name?: string
  email?: string
  phone?: string
  role: string
  bonusPoints: number
  bonusLevel: string
  createdAt: string
  _count?: { orders: number }
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const authApi = {
  sendOtp: (contact: string, channel: 'sms' | 'email') =>
    api.post('/api/auth/send-otp', { contact, channel }),
  verifyOtp: (contact: string, code: string) =>
    api.post<{ token: string; user: { role: string } }>('/api/auth/verify-otp', { contact, code }),
  me: () => api.get<{ userId: string; role: string; name?: string }>('/api/auth/me'),
}

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/api/admin/dashboard'),
}

export const productsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<Product>>('/api/products', { params }),
  create: (data: unknown) => api.post<Product>('/api/admin/products', data),
  update: (id: string, data: unknown) => api.put<Product>(`/api/admin/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/products/${id}`),
  importCsv: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<{ created: number; errors: string[] }>('/api/admin/import/csv', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const categoriesApi = {
  list: () => api.get<Category[]>('/api/categories'),
  create: (data: unknown) => api.post<Category>('/api/admin/categories', data),
  update: (id: string, data: unknown) => api.put<Category>(`/api/admin/categories/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/categories/${id}`),
}

export const brandsApi = {
  list: () => api.get<Brand[]>('/api/admin/brands'),
  create: (data: unknown) => api.post<Brand>('/api/admin/brands', data),
  update: (id: string, data: unknown) => api.put<Brand>(`/api/admin/brands/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/brands/${id}`),
}

export const ordersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<Order>>('/api/admin/orders', { params }),
  byId: (id: string) => api.get<Order>(`/api/admin/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put<Order>(`/api/admin/orders/${id}/status`, { status }),
}

export const usersApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Paginated<User>>('/api/admin/users', { params }),
  updateRole: (id: string, role: string) =>
    api.put(`/api/admin/users/${id}/role`, { role }),
}

export const bannersApi = {
  list: () => api.get<Banner[]>('/api/admin/banners'),
  create: (data: unknown) => api.post<Banner>('/api/admin/banners', data),
  update: (id: string, data: unknown) => api.put<Banner>(`/api/admin/banners/${id}`, data),
  delete: (id: string) => api.delete(`/api/admin/banners/${id}`),
}
