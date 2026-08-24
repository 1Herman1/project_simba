import { Link } from 'react-router-dom'
import { formatPrice } from '@/lib/format'
import type { ProductCard as ProductCardType } from '@/types/api'

interface ProductCardProps {
  product: ProductCardType
  onAddToCart?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = () => {
    console.log('Add to cart:', product.id)
    if (onAddToCart) {
      onAddToCart(product.id)
    }
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block overflow-hidden bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={`${product.name} от ${product.brand?.name || 'производителя'}`}
            className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-gray-200 text-gray-400">
            Нет изображения
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Brand and Line */}
        {(product.brand || product.line) && (
          <div className="text-xs text-muted-foreground mb-2">
            {product.brand?.name && <span>{product.brand.name}</span>}
            {product.brand?.name && product.line?.name && <span> • </span>}
            {product.line?.name && <span>{product.line.name}</span>}
          </div>
        )}

        {/* Name */}
        <Link
          to={`/product/${product.slug}`}
          className="block text-body font-sans font-bold text-text mb-3 hover:text-accent-ink transition-colors"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-semibold text-text">{formatPrice(product.minPrice)}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        {/* Button */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full py-3 px-4 bg-accent-ink text-accent-text font-sans font-semibold rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 min-h-11"
        >
          {product.inStock ? 'В корзину' : 'Нет в наличии'}
        </button>
      </div>
    </div>
  )
}
