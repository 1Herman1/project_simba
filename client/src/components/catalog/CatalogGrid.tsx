import { useState, useEffect } from 'react'
import { productsApi, type Product } from '../../lib/api'
import ProductCard from './ProductCard'

interface Props {
  search: string
  activeTag: string
  category: string
  brand?: string
}

export default function CatalogGrid({ search, activeTag, category, brand }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params: Record<string, string | string[]> = {}
        if (search) params.search = search
        if (activeTag) params.tags = [activeTag]
        if (category) params.category = category
        if (brand) params.brand = brand

        const res = await productsApi.list(params)
        setProducts(res.data.items)
        setTotal(res.data.total)
      } catch {
        setProducts([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search, activeTag, category, brand])

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl h-72 animate-pulse" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-navy-500 text-lg mb-2">Ничего не найдено</p>
        <p className="text-navy-300 text-sm">Попробуйте другой запрос или выберите другую категорию</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-navy-300 mb-4">{total} товаров</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}
