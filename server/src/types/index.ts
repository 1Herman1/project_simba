export type UserRole = 'super_admin' | 'orders_manager' | 'products_manager' | 'customer'

export type OrderStatus = 'new' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'

export type OtpChannel = 'email' | 'sms'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role: UserRole; type?: 'guest' }
    user: { userId: string; role: UserRole; type?: 'guest' }
  }
}
