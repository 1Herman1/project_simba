import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../lib/format'
import { favoritesApi, type Favorite } from '../lib/api'

function ProductCard({ favorite, onRemove }: {
  favorite: Favorite
  onRemove: (productId: string) => void
}) {
  const product = favorite.product
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [added, setAdded] = useState(false)

  const discount = selectedVariant.oldPrice
    ? Math.round((1 - selectedVariant.price / selectedVariant.oldPrice) * 100)
    : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link to={`/product/${product.slug}`} className="relative block bg-blue-50 h-44 flex items-center justify-center">
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
          onClick={e => { e.preventDefault(); onRemove(product.id) }}
          className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-sm flex items-center justify-center hover:scale-110 transition-transform group">
          <svg className="w-4 h-4 fill-red-400 stroke-red-400 group-hover:fill-red-500" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-navy-300 mb-1">{product.brand?.name || 'Без бренда'}</p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-navy-900 mb-2 hover:text-blue-300 transition-colors"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-wrap gap-1 mb-3">
          {product.variants.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVariant(v)}
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
            {formatPrice(selectedVariant.price)}
          </span>
          {selectedVariant.oldPrice && (
            <span className="text-sm text-navy-300 line-through">
              {formatPrice(selectedVariant.oldPrice)}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className={`w-full py-2 rounded-xl text-sm font-medium transition-all duration-300 mt-auto ${
            added
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-200 text-navy-900 hover:bg-blue-300 active:scale-95'
          }`}>
          {added ? 'Добавлено' : 'В корзину'}
        </button>
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    favoritesApi.getAll()
      .then(res => setFavorites(res.data))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (productId: string) => {
    setRemovingId(productId)
    try {
      await favoritesApi.remove(productId)
      setTimeout(() => {
        setFavorites(prev => prev.filter(f => f.productId !== productId))
        setRemovingId(null)
      }, 300)
    } catch {
      setRemovingId(null)
    }
  }

  const handleClearAll = async () => {
    setFavorites([])
    for (const fav of favorites) {
      await favoritesApi.remove(fav.productId).catch(() => {})
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-blue-50 flex items-center justify-center">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 py-6">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-navy-900">
            Избранное
            {favorites.length > 0 && (
              <span className="text-navy-300 font-normal text-lg ml-2">({favorites.length})</span>
            )}
          </h1>
          {favorites.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-navy-400 hover:text-red-400 transition-colors">
              Очистить всё
            </button>
          )}
        </div>

        {favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-navy-900 mb-2">Здесь пока пусто</h2>
              <p className="text-navy-400 text-sm">Добавляйте товары в избранное — нажмите на сердечко на карточке</p>
            </div>
            <Link
              to="/catalog"
              className="bg-blue-200 text-navy-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-300 transition-colors">
              Перейти в каталог
            </Link>
          </div>
        )}

        {favorites.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4 overflow-x-auto pb-1">
              <button className="whitespace-nowrap bg-white text-navy-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors border border-blue-100">
                Все в корзину
              </button>
              <span className="text-navy-300 text-sm">или выбирайте по одному</span>
            </div>

            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
              {favorites.map(favorite => (
                <div
                  key={favorite.productId}
                  className={`transition-all duration-300 ${
                    removingId === favorite.productId ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`}>
                  <ProductCard favorite={favorite} onRemove={handleRemove} />
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-navy-300 mt-8">
              Нажмите на сердечко на карточке товара чтобы убрать из избранного
            </p>
          </>
        )}

      </div>
    </div>
  )
}
