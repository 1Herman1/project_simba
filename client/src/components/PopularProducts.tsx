import { useState, useEffect } from 'react'
import { productsApi, type Product } from '../lib/api'
import ProductCard from './catalog/ProductCard'

type Basis = 'sales' | 'curated'

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [basis, setBasis] = useState<Basis>('curated')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    productsApi
      .popular(8)
      .then((res) => {
        setProducts(res.data.items)
        setBasis(res.data.basis)
      })
      .catch((err) => {
        setError(err?.response?.data?.error || 'Ошибка при загрузке товаров')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  // Пока грузится — держим место скелетонами: без них между шапкой и
  // подвалом на миг образуется пустая яма, и на медленной сети это заметно.
  if (loading) {
    return (
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-8 w-56 bg-blue-50 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-blue-50 rounded-card h-72 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || products.length === 0) {
    return null
  }

  const title = basis === 'sales' ? 'Популярные товары' : 'Рекомендуем'

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-navy-900">{title}</h2>
        </div>

        {/* Десктоп: сетка */}
        <div className="hidden md:grid grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Мобайл: горизонтальная лента */}
        <div className="md:hidden flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-52">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Ссылка на каталог */}
        <div className="flex justify-center mt-8">
          <a
            href="/catalog"
            className="btn-outline px-8 py-3 rounded-xl font-semibold"
          >
            Весь каталог
          </a>
        </div>
      </div>
    </section>
  )
}
