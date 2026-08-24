import { ProductCard } from './ProductCard'
import type { ProductCard as ProductCardType } from '@/types/api'

interface ProductGridProps {
  products: ProductCardType[]
  loading?: boolean
  onAddToCart?: (productId: string) => void
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      <div className="w-full h-64 bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
        <div className="h-11 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, loading, onAddToCart }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="col-span-full py-16 text-center">
        <h3 className="text-xl font-heading font-bold text-text mb-3">Ничего не найдено</h3>
        <p className="text-muted-foreground mb-6">
          По вашему запросу не найдено товаров. Попробуйте изменить фильтры.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
