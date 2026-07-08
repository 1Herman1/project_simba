import { useState } from 'react'
import { Link } from 'react-router-dom'
import { cartApi, type Product } from '../../lib/api'

export default function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [added, setAdded] = useState(false)
  const [liked, setLiked] = useState(false)

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await cartApi.addItem(selectedVariant.id, 1)
    } catch {
      // ignore, optimistic UI
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const discount = selectedVariant.oldPrice
    ? Math.round((1 - selectedVariant.price / selectedVariant.oldPrice) * 100)
    : null

  return (
    <Link to={`/product/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* Изображение */}
      <div className="relative bg-blue-50 h-44 flex items-center justify-center">
        {discount && (
          <span className="absolute top-2 left-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {product.isGrainFree && (
            <span className="bg-white/90 text-navy-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm">Без зерна</span>
          )}
          {product.isHypoallergenic && (
            <span className="bg-white/90 text-navy-700 text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-sm">Гипоалл.</span>
          )}
        </div>

        <button
          onClick={e => { e.preventDefault(); setLiked(!liked) }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
          <svg className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-navy-300'}`}
            viewBox="0 0 24 24" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Контент */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-navy-300 mb-1">{product.brand?.name ?? ''}</p>
        <h3 className="text-sm font-semibold text-navy-900 mb-2 flex-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.variants.map(v => (
            <button
              key={v.id}
              onClick={e => { e.preventDefault(); setSelectedVariant(v) }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-all ${
                selectedVariant.id === v.id
                  ? 'bg-blue-200 border-blue-200 text-navy-900 font-medium'
                  : 'border-blue-100 text-navy-500 hover:border-blue-200'
              }`}>
              {v.weight}кг
            </button>
          ))}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-navy-900">
            {(selectedVariant.price / 100).toLocaleString('ru-RU')} ₽
          </span>
          {selectedVariant.oldPrice && (
            <span className="text-sm text-navy-300 line-through">
              {(selectedVariant.oldPrice / 100).toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            added
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-200 text-navy-900 hover:bg-blue-300 active:scale-95'
          }`}>
          {added ? '✓ Добавлено' : 'В корзину'}
        </button>
      </div>
    </Link>
  )
}
