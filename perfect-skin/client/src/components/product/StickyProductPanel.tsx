import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/format'
import type { ProductCardExtended } from '@/types/api'

interface StickyProductPanelProps {
  product: ProductCardExtended
  buttonRef: React.RefObject<HTMLDivElement>
  onAddToCart?: () => void
}

export function StickyProductPanel({
  product,
  buttonRef,
  onAddToCart,
}: StickyProductPanelProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky panel when button is NOT visible
        setIsVisible(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (buttonRef.current) {
      observer.observe(buttonRef.current)
    }

    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current)
      }
    }
  }, [buttonRef])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-divider p-4 shadow-lg z-40 animate-in slide-in-from-bottom-2">
      <div className="container-app flex items-center gap-4">
        {/* Image */}
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-cover rounded"
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-sans font-bold text-text truncate">
            {product.name}
          </h3>
          {product.variants?.[0] && (
            <p className="text-sm text-muted-foreground">
              {product.variants[0].volumeLabel}
            </p>
          )}
          <p className="font-semibold text-text mt-1">
            {formatPrice(product.minPrice)}
          </p>
        </div>

        {/* Button */}
        <button
          onClick={onAddToCart}
          disabled={!product.inStock}
          className="px-6 py-2 bg-accent-ink text-accent-text font-semibold rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity whitespace-nowrap min-h-10"
        >
          В корзину
        </button>
      </div>
    </div>
  )
}
