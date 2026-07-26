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

export function authHeader(
  app: FastifyInstance,
  userId: string,
  role: UserRole = 'customer'
) {
  const token = app.jwt.sign({ userId, role })
  return { authorization: `Bearer ${token}` }
}
