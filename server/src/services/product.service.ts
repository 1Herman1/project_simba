import { PrismaClient } from '@prisma/client'

export interface ProductFilters {
  categorySlug?: string
  brandId?: string
  filterValueIds?: string[]
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  featured?: boolean
  page?: number
  limit?: number
}

export async function getProducts(prisma: PrismaClient, filters: ProductFilters) {
  const page = filters.page ?? 1
  const limit = Math.min(filters.limit ?? 20, 100)
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { isActive: true }

  if (filters.search) {
    where.name = { contains: filters.search, mode: 'insensitive' }
  }

  if (filters.brandId) {
    where.brandId = filters.brandId
  }

  if (filters.categorySlug) {
    where.categories = {
      some: {
        category: { slug: filters.categorySlug, isActive: true },
      },
    }
  }

  if (filters.filterValueIds && filters.filterValueIds.length > 0) {
    where.AND = filters.filterValueIds.map((filterValueId) => ({
      filterValues: { some: { filterValueId } },
    }))
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.variants = {
      some: {
        isActive: true,
        ...(filters.minPrice !== undefined && { price: { gte: filters.minPrice } }),
        ...(filters.maxPrice !== undefined && { price: { lte: filters.maxPrice } }),
      },
    }
  }

  if (filters.featured) {
    where.isFeatured = true
  }

  const orderBy = buildOrderBy(filters.sortBy)

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        images: true,
        isGrainFree: true,
        isHypoallergenic: true,
        brand: { select: { name: true } },
        variants: {
          where: { isActive: true },
          orderBy: { weight: 'asc' },
          select: {
            id: true,
            weight: true,
            price: true,
            oldPrice: true,
            stock: true,
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ])

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getProductBySlug(prisma: PrismaClient, slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      brand: { select: { id: true, name: true, slug: true } },
      categories: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
      variants: {
        where: { isActive: true },
        orderBy: { weight: 'asc' },
        select: {
          id: true,
          weight: true,
          price: true,
          oldPrice: true,
          stock: true,
          sku: true,
        },
      },
      filterValues: {
        include: {
          filterValue: {
            include: {
              filter: { select: { name: true } },
            },
          },
        },
      },
    },
  })
}

export async function getRelatedProducts(
  prisma: PrismaClient,
  productId: string,
  categoryIds: string[],
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      categories: {
        some: { categoryId: { in: categoryIds } },
      },
    },
    take: 4,
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      isGrainFree: true,
      isHypoallergenic: true,
      brand: { select: { name: true } },
      variants: {
        where: { isActive: true },
        orderBy: { weight: 'asc' },
        select: {
          id: true,
          weight: true,
          price: true,
          oldPrice: true,
          stock: true,
        },
      },
    },
  })
}

function buildOrderBy(sortBy?: string): Record<string, unknown> | Record<string, unknown>[] {
  switch (sortBy) {
    case 'newest':
      return { createdAt: 'desc' }
    case 'popular':
      return { orderItems: { _count: 'desc' } }
    case 'price_asc':
    case 'price_desc':
      // Сортировка по минимальной цене варианта делается после выборки
      return { createdAt: 'desc' }
    default:
      return { createdAt: 'desc' }
  }
}

export function sortItemsByPrice(
  items: Array<{ variants: Array<{ price: number }> }>,
  sortBy?: string,
) {
  if (sortBy !== 'price_asc' && sortBy !== 'price_desc') return items

  return [...items].sort((a, b) => {
    const minA = Math.min(...a.variants.map((v) => v.price))
    const minB = Math.min(...b.variants.map((v) => v.price))
    return sortBy === 'price_asc' ? minA - minB : minB - minA
  })
}
