import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import cors from '@fastify/cors'
import rateLimit from '@fastify/rate-limit'
import prismaPlugin from './plugins/prisma.js'
import authenticatePlugin from './plugins/authenticate.js'
import { ApiError, errorResponse } from './lib/errors.js'

const app = Fastify({
  logger: true,
})

// Register plugins
await app.register(prismaPlugin)
await app.register(cookie, {
  secret: process.env.PS_COOKIE_SECRET || 'dev-secret-change-in-production',
  hook: 'preHandler',
})
await app.register(cors, {
  origin: (process.env.PS_CORS_ORIGIN || 'http://localhost:3000').split(','),
  credentials: true,
})
await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
})
await app.register(authenticatePlugin)

// Error handler
app.setErrorHandler((error, request, reply) => {
  if (error instanceof ApiError) {
    return reply.status(error.status).send(errorResponse(error))
  }

  app.log.error({ error, requestId: request.id })
  reply.status(500).send(
    errorResponse(
      new ApiError(500, 'INTERNAL_ERROR', 'Внутренняя ошибка сервера')
    )
  )
})

// Health check
app.get('/api/v1/health', async (request, reply) => {
  return { ok: true, timestamp: new Date().toISOString() }
})

// TODO: Register routes
// - GET /api/v1/products, /facets, /:slug
// - GET /api/v1/categories/tree, /:slug
// - GET /api/v1/brands, /:slug, /lines
// - GET|POST|PATCH|DELETE /api/v1/cart/**
// - GET /api/v1/delivery/methods
// - POST /api/v1/promo/validate
// - POST|GET /api/v1/orders
// - POST /api/v1/auth/**

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
    app.log.info('Server is running on http://0.0.0.0:3000')
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

export default app
