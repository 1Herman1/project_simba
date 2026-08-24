import jwt from 'jsonwebtoken'
import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { ApiError } from '../lib/errors.js'

interface JwtPayload {
  userId: string
  role: string
  tv: number // tokenVersion
}

async function authenticatePlugin(fastify: FastifyInstance) {
  fastify.decorate('authenticate', async (request: FastifyRequest) => {
    const token = extractBearerToken(request)
    if (!token) {
      throw new ApiError(401, 'UNAUTHORIZED', 'Требуется авторизация')
    }

    try {
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET || 'dev-secret'
      ) as JwtPayload

      // Verify user still exists and hasn't been modified
      const user = await fastify.prisma.user.findUnique({
        where: { id: payload.userId },
      })

      if (!user || !user.isActive || user.deletedAt) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Пользователь неактивен')
      }

      if (user.tokenVersion !== payload.tv) {
        throw new ApiError(401, 'UNAUTHORIZED', 'Токен больше не действителен')
      }

      request.user = {
        id: user.id,
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || null,
        role: user.role || 'customer',
        tokenVersion: user.tokenVersion,
      }
    } catch (error) {
      if (error instanceof ApiError) throw error
      throw new ApiError(401, 'UNAUTHORIZED', 'Недействительный токен')
    }
  })

  fastify.decorate('authenticateOptional', async (request: FastifyRequest) => {
    try {
      await fastify.authenticate(request)
    } catch {
      // Silent fail: guest is OK
    }
  })
}

function extractBearerToken(request: FastifyRequest): string | null {
  const authHeader = request.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

export default fp(authenticatePlugin, {
  name: 'authenticate',
})

declare module 'fastify' {
  interface FastifyInstance {
    authenticate(request: FastifyRequest): Promise<void>
    authenticateOptional(request: FastifyRequest): Promise<void>
  }

  interface FastifyRequest {
    user?: {
      id: string
      name: string
      phone: string
      email: string | null
      role: string
      tokenVersion: number
    }
  }
}
