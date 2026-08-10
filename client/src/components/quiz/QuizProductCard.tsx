import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cartApi, type QuizProductCard as QuizProductCardType } from '../../lib/api'
import { formatPrice } from '../../lib/format'

interface QuizProductCardProps {
  product: QuizProductCardType
  variant?: 'main' | 'alt'
  onAddToCart?: () => void
}

export default function QuizProductCard({
  product,
  variant = 'main',
  onAddToCart,
}: QuizProductCardProps) {
  const isMain = variant === 'main'
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!product.variant || isAdding) return

    setIsAdding(true)
    try {
      await cartApi.addItem(product.variant.id, 1)
      onAddToCart?.()
    } catch (error) {
      console.error('Failed to add to cart:', error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className={`block bg-white rounded-xl border border-line overflow-hidden hover:shadow-card transition-shadow duration-100 ease ${
        isMain ? 'md:flex gap-6' : ''
      }`}
    >
      {/* Image container */}
      <div
        className={`${
          isMain ? 'md:w-1/2' : 'w-full'
        } bg-blue-50 flex items-center justify-center ${
          isMain ? 'h-80 md:h-96' : 'h-48'
        } relative flex-shrink-0`}
      >
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.badges.map((badge) => (
              <span
                key={badge}
                className="bg-white/90 text-navy-700 text-[10px] font-medium px-2 py-1 rounded-full shadow-sm"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`${isMain ? 'md:w-1/2' : 'w-full'} p-4 md:p-6 flex flex-col`}>
        {product.brandName && (
          <p className="text-xs text-navy-500 mb-2">{product.brandName}</p>
        )}

        <h3 className="text-lg md:text-xl font-semibold text-navy-900 mb-3 flex-1">
          {product.name}
        </h3>

        {/* Price and score */}
        <div className="mb-4">
          {product.variant && (
            <>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-navy-900">
                  {formatPrice(product.variant.price)}
                </span>
                {product.variant.oldPrice && (
                  <span className="text-sm text-navy-300 line-through">
                    {formatPrice(product.variant.oldPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-navy-500">
                Вес: {product.variant.weight} кг
              </p>
            </>
          )}
        </div>

        {/* Match score */}
        <div className="mb-4 text-xs text-navy-500">
          Совпадение: {Math.round(product.matchScore * 100)}%
        </div>

        {/* CTA Button */}
        {product.variant && (
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`w-full py-3 rounded-xl font-medium transition-colors duration-100 ease disabled:opacity-50 disabled:cursor-not-allowed ${
              isMain
                ? 'btn-primary text-base'
                : 'bg-blue-50 text-primary border border-line hover:bg-blue-100'
            }`}
          >
            {isMain ? 'В корзину' : 'Посмотреть'}
          </button>
        )}
      </div>
    </Link>
  )
}
