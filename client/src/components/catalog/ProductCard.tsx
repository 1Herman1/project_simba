import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckIcon, PawIcon } from '../icons'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../lib/api'
import { formatPrice } from '../../lib/format'

export default function ProductCard({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [added, setAdded] = useState(false)
  const [liked, setLiked] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    try {
      await addItem(selectedVariant.id, 1)
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
      className="group bg-white rounded-card overflow-hidden hover:shadow-card hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-100 ease flex flex-col">

      {/* Изображение */}
      <div className="relative bg-white h-44 flex items-center justify-center border-b border-line">
        {/* Фото товара, а при его отсутствии — лапа: раньше здесь был пустой
            прямоугольник цвета фона страницы, и карточка выглядела обрезанной. */}
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain p-2"
          />
        ) : (
          <PawIcon className="w-16 h-16 text-navy-100" />
        )}
        {discount && (
          <span className="absolute top-2 left-2 bg-amber-400 text-navy-900 text-xs font-bold px-2 py-0.5 rounded-full">
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
          aria-label={liked ? 'Убрать из избранного' : 'Добавить в избранное'}
          className="absolute bottom-2 right-2 w-11 h-11 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
          <svg className={`w-4 h-4 transition-colors ${liked ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-navy-300'}`}
            viewBox="0 0 24 24" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Контент */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-navy-500 mb-1">{product.brand?.name ?? ''}</p>
        <h3 className="text-sm font-semibold text-navy-900 mb-2 flex-1"
          style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.variants.map(v => (
            <button
              key={v.id}
              onClick={e => { e.preventDefault(); setSelectedVariant(v) }}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors duration-100 ease ${
                selectedVariant.id === v.id
                  ? 'bg-white border-primary-soft text-primary-hover font-medium'
                  : 'border-line text-navy-500 hover:border-primary-soft'
              }`}>
              {v.weight} кг
            </button>
          ))}
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-navy-900">
            {formatPrice(selectedVariant.price)}
          </span>
          {selectedVariant.oldPrice && (
            <span className="text-sm text-navy-300 line-through">
              {formatPrice(selectedVariant.oldPrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-xl text-sm font-medium ${
            added
              ? 'bg-white border border-line text-navy-900'
              : 'btn-primary'
          }`}>
          {added ? (
            <span className="inline-flex items-center justify-center gap-1.5">
              <CheckIcon className="w-4 h-4 text-[#1E7B4D]" />
              Добавлено
            </span>
          ) : (
            'В корзину'
          )}
        </button>
      </div>
    </Link>
  )
}
