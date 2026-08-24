import { useEffect, useState } from 'react'
import { fetchApi, ApiError } from '@/lib/api'
import type { ProductsListResponse } from '@/types/api'

export interface CatalogFilters {
  category?: string
  brand?: string[]
  line?: string[]
  need?: string[]
  skin?: string[]
  minPrice?: number
  maxPrice?: number
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular'
  limit?: number
  offset?: number
}

interface UseCatalogListReturn {
  data: ProductsListResponse | null
  loading: boolean
  error: ApiError | null
}

export function useCatalogList(filters: CatalogFilters): UseCatalogListReturn {
  const [data, setData] = useState<ProductsListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()

        if (filters.category) params.append('category', filters.category)
        if (filters.brand?.length) {
          filters.brand.forEach(b => params.append('brand', b))
        }
        if (filters.line?.length) {
          filters.line.forEach(l => params.append('line', l))
        }
        if (filters.need?.length) {
          filters.need.forEach(n => params.append('need', n))
        }
        if (filters.skin?.length) {
          filters.skin.forEach(s => params.append('skin', s))
        }
        if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice))
        if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice))
        if (filters.sort) params.append('sort', filters.sort)
        if (filters.limit) params.append('limit', String(filters.limit))
        if (filters.offset !== undefined) params.append('offset', String(filters.offset))

        const response = await fetchApi<ProductsListResponse>(
          `/api/v1/products?${params.toString()}`
        )
        setData(response)
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err)
        } else {
          setError(new ApiError(500, 'UNKNOWN_ERROR', 'Неизвестная ошибка'))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  return { data, loading, error }
}
