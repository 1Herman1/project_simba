import { useState, useEffect } from 'react'
import { productsApi, type Product } from '../../lib/api'
import ProductCard from './ProductCard'
import { pluralize } from '../../lib/format'
import EmptyCatalog from './EmptyCatalog'

interface Props {
  search: string
  activeTag: string
  category: string
  brand?: string
  format?: string
  purpose?: string
}

export default function CatalogGrid({ search, activeTag, category, brand, format, purpose }: Props) {
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
        if (format === 'dry' || format === 'wet') params.format = format
        if (purpose === 'medical') params.purpose = purpose

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
  }, [search, activeTag, category, brand, format, purpose])

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
    // Пустой раздел и пустая выдача по фильтрам — разные истории, и текст должен
    // их различать: в первом случае покупатель ничего не делал не так.
    const sectionEmpty = !search && !activeTag && !format && !purpose && Boolean(category || brand)
    return <EmptyCatalog sectionEmpty={sectionEmpty} />
  }

  return (
    <>
      <p className="text-sm text-navy-300 mb-4">{pluralize(total, 'товар', 'товара', 'товаров')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}
