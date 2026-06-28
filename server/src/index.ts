import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import multipart from '@fastify/multipart'

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

  app.get('/health', async () => ({ status: 'ok' }))

  // Роуты добавим сюда позже
  // await app.register(authRoutes, { prefix: '/api/auth' })
  // await app.register(productRoutes, { prefix: '/api/products' })

  const port = Number(process.env.PORT) || 3000
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`Server running on http://localhost:${port}`)
}

start().catch(console.error)
