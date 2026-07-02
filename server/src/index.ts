import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'
import prismaPlugin from './plugins/prisma'
import authenticatePlugin from './plugins/authenticate'
import authRoutes from './routes/auth/index'
import productRoutes from './routes/products'
import categoryRoutes from './routes/categories'
import brandRoutes from './routes/brands'
import cartRoutes from './routes/cart/index'
import orderRoutes from './routes/orders/index'
import orderAdminRoutes from './routes/orders/admin'
import deliveryRoutes from './routes/delivery/index'
import adminDashboard from './routes/admin/dashboard'
import adminUsers from './routes/admin/users'
import adminBrands from './routes/admin/brands'
import adminBanners from './routes/admin/banners'
import adminImport from './routes/admin/import'

const app = Fastify({ logger: true })

async function start() {
  await app.register(cors, {
    origin: [process.env.CLIENT_URL!, process.env.ADMIN_URL!],
    credentials: true,
  })

  await app.register(jwt, {
    secret: process.env.JWT_SECRET!,
  })

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  })

  await app.register(prismaPlugin)
  await app.register(authenticatePlugin)
  await app.register(authRoutes, { prefix: '/api/auth' })

  app.get('/health', async () => ({ status: 'ok' }))

  await app.register(productRoutes, { prefix: '/api/products' })
  await app.register(categoryRoutes, { prefix: '/api/categories' })
  await app.register(brandRoutes, { prefix: '/api/brands' })
  await app.register(cartRoutes, { prefix: '/api/cart' })
  await app.register(orderRoutes, { prefix: '/api/orders' })
  await app.register(orderAdminRoutes, { prefix: '/api/admin/orders' })
  await app.register(adminDashboard, { prefix: '/api/admin/dashboard' })
  await app.register(adminUsers, { prefix: '/api/admin/users' })
  await app.register(adminBrands, { prefix: '/api/admin/brands' })
  await app.register(adminBanners, { prefix: '/api/admin/banners' })
  await app.register(adminImport, { prefix: '/api/admin/import' })
  await app.register(deliveryRoutes, { prefix: '/api/delivery' })

  const port = Number(process.env.PORT) || 3000
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`Server running on http://localhost:${port}`)
}

start().catch(console.error)
