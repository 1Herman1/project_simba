import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkRole } from '../../middleware/check-role'
import { QUIZ_TAGS } from '../../lib/quiz-tags'

const variantSchema = z.object({
  weight: z.number().positive(),
  price: z.number().int().positive(),
  oldPrice: z.number().int().positive().optional(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().optional(),
})

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  brandId: z.string().uuid().optional(),
  images: z.array(z.string().url()).default([]),
  isGrainFree: z.boolean().default(false),
  isHypoallergenic: z.boolean().default(false),
  isWeightControl: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  protein: z.number().positive().optional(),
  fat: z.number().positive().optional(),
  fiber: z.number().positive().optional(),
  ash: z.number().positive().optional(),
  ingredients: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  categoryIds: z.array(z.string().uuid()).default([]),
  quizTags: z.array(z.enum(QUIZ_TAGS)).default([]),
  variants: z.array(variantSchema).min(1),
})

const updateSchema = createSchema.partial()

export default async function adminCrudRoute(app: FastifyInstance) {
  const adminGuard = { preHandler: [app.authenticate, checkRole(['super_admin', 'products_manager'])] }

  app.get<{ Params: { id: string } }>('/:id', adminGuard, async (request, reply) => {
    const { id } = request.params
    const product = await app.prisma.product.findUnique({
      where: { id },
      include: { variants: true, categories: true },
    })
    if (!product) {
      return reply.status(404).send({ error: 'Product not found' })
    }
    return reply.send(product)
  })

  app.post('/', adminGuard, async (request, reply) => {
    const parsed = createSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0].message })
    }

    const { categoryIds, variants, ...data } = parsed.data

    const product = await app.prisma.product.create({
      data: {
        ...data,
        categories: {
          create: categoryIds.map((categoryId) => ({ categoryId })),
        },
        variants: {
          create: variants,
        },
      },
      include: { variants: true, categories: true },
    })

    return reply.status(201).send(product)
  })

  app.put<{ Params: { id: string } }>('/:id', adminGuard, async (request, reply) => {
    const parsed = updateSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.status(400).send({ error: parsed.error.errors[0].message })
    }

    const { id } = request.params
    const { categoryIds, variants, ...data } = parsed.data

    const exists = await app.prisma.product.findUnique({ where: { id } })
    if (!exists) {
      return reply.status(404).send({ error: 'Product not found' })
    }

    const product = await app.prisma.$transaction(async (tx) => {
      if (categoryIds !== undefined) {
        await tx.productCategory.deleteMany({ where: { productId: id } })
      }
      if (variants !== undefined) {
        await tx.productVariant.deleteMany({ where: { productId: id } })
      }

      return tx.product.update({
        where: { id },
        data: {
          ...data,
          ...(categoryIds !== undefined && {
            categories: {
              create: categoryIds.map((categoryId) => ({ categoryId })),
            },
          }),
          ...(variants !== undefined && {
            variants: {
              create: variants,
            },
          }),
        },
        include: { variants: true, categories: true },
      })
    })

    return reply.send(product)
  })

  app.delete<{ Params: { id: string } }>('/:id', adminGuard, async (request, reply) => {
    const { id } = request.params

    const exists = await app.prisma.product.findUnique({ where: { id } })
    if (!exists) {
      return reply.status(404).send({ error: 'Product not found' })
    }

    await app.prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return reply.send({ success: true })
  })
}
