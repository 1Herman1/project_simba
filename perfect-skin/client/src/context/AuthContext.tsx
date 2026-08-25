import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { fetchApi, ApiError } from '@/lib/api'

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  role: string
}

interface SendOtpResponse {
  channel: string
  expiresIn: number
  resendAfter: number
}

interface VerifyOtpResponse {
  token: string
  user: User
  cartMerged?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthed: boolean
  sendOtp: (phone: string) => Promise<SendOtpResponse>
  verifyOtp: (phone: string, code: string) => Promise<VerifyOtpResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // При монтировании проверяем токен и загружаем пользователя
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('ps_token')
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const userData = await fetchApi<User>('/api/v1/auth/me')
        setUser(userData)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          // Токен невалиден — очищаем
          localStorage.removeItem('ps_token')
          setUser(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const sendOtp = async (phone: string): Promise<SendOtpResponse> => {
    const response = await fetchApi<SendOtpResponse>('/api/v1/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    })
    return response
  }

  const verifyOtp = async (phone: string, code: string): Promise<VerifyOtpResponse> => {
    const response = await fetchApi<VerifyOtpResponse>('/api/v1/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    })

    // Сохраняем токен и пользователя
    localStorage.setItem('ps_token', response.token)
    setUser(response.user)

    return response
  }

  const logout = async () => {
    try {
      await fetchApi<void>('/api/v1/auth/logout', {
        method: 'POST',
      })
    } finally {
      // Очищаем в любом случае
      localStorage.removeItem('ps_token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthed: !!user,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
