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
    <div className="bg-card rounded-block overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block overflow-hidden bg-card">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full aspect-[3/4] object-contain rounded-media"
          />
        ) : (
          <div className="w-full aspect-[3/4] flex items-center justify-center bg-muted text-muted-foreground rounded-media">
            Нет изображения
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-2">
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
          className="block text-body font-sans font-bold text-foreground mb-3 hover:text-primary transition-colors"
        >
          {product.name}
        </Link>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-lg font-semibold text-foreground">{formatPrice(product.minPrice)}</span>
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
          className="w-full py-3 px-6 bg-primary text-primary-foreground font-sans font-semibold rounded-pill hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200 min-h-11"
        >
          {product.inStock ? 'В корзину' : 'Нет в наличии'}
        </button>
      </div>
    </div>
  )
}
