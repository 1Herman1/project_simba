import type { FastifyInstance } from 'fastify'
import type { UserRole } from '@prisma/client'
import { getTestPrisma } from './setup'

let counter = 0
function uniq(prefix: string) {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export async function createUser(opts: { bonusPoints?: number; name?: string } = {}) {
  const prisma = getTestPrisma()
  return prisma.user.create({
    data: {
      name: opts.name ?? 'Тестовый покупатель',
      email: `${uniq('user')}@example.test`,
      bonusPoints: opts.bonusPoints ?? 0,
    },
  })
}

export async function createProductWithVariant(opts: {
  price: number
  stock: number
  weight?: number
  name?: string
}) {
  const prisma = getTestPrisma()
  const name = opts.name ?? 'Корм тестовый'
  const product = await prisma.product.create({
    data: {
      name,
      slug: uniq('product'),
      description: 'Товар для интеграционных тестов',
      variants: {
        create: {
          price: opts.price,
          stock: opts.stock,
          weight: opts.weight ?? 1,
        },
      },
    },
    include: { variants: true },
  })

  return { product, variant: product.variants[0] }
}

export async function createCart(
  userId: string,
  items: { variantId: string; quantity: number }[]
) {
  const prisma = getTestPrisma()
  const cart = await prisma.cart.create({ data: { userId } })

  for (const item of items) {
    const variant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: item.variantId },
    })
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId: variant.id,
        productId: variant.productId,
        quantity: item.quantity,
      },
    })
  }

  return cart
}

/**
 * Гостевая сессия через настоящий роут: POST /api/auth/guest-session.
 * Возвращает и заголовок, и id гостевого пользователя — гостю в БД принадлежит
 * корзина, а заказ достаётся другому (реальному) пользователю, найденному по email.
 *
 * `ip` подменяет адрес клиента: rate-limit гостевых сессий и заказов живёт в
 * памяти процесса и ключуется по IP, поэтому тесты, идущие с одного адреса,
 * влияли бы друг на друга.
 */
export async function createGuestSession(app: FastifyInstance, ip?: string) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/guest-session',
    remoteAddress: ip,
  })

  if (res.statusCode !== 200) {
    throw new Error(`guest-session вернул ${res.statusCode}: ${res.body}`)
  }

  const { token } = res.json() as { token: string }
  const decoded = app.jwt.decode<{ userId: string; type: string }>(token)

  if (!decoded) {
    throw new Error('Гостевой токен не декодируется')
  }

  return {
    token,
    userId: decoded.userId,
    headers: { authorization: `Bearer ${token}` },
  }
}

export function authHeader(
  app: FastifyInstance,
  userId: string,
  role: UserRole = 'customer'
) {
  const token = app.jwt.sign({ userId, role })
  return { authorization: `Bearer ${token}` }
}
