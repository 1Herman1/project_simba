import { useState, useRef, useEffect } from 'react'
import { formatPrice } from '../../lib/format'
import { productsApi, favoritesApi, type Product } from '../../lib/api'

const mockDefaults = {
  slug: '',
  description: '',
  images: [] as string[],
  isWeightControl: false,
  isFeatured: true,
  protein: null,
  fat: null,
  fiber: null,
  ash: null,
  ingredients: null,
  categories: [] as Product['categories'],
}

const mockProducts: Product[] = [
  {
    ...mockDefaults,
    id: '1',
    name: 'Royal Canin Renal для кошек',
    brand: { id: 'b-royal-canin', name: "Royal Canin", slug: 'royal-canin' },
    variants: [
      { id: 'v1', weight: 0.5, price: 89900, oldPrice: 99900 , stock: 10, sku: null },
      { id: 'v2', weight: 2, price: 249900, oldPrice: 279900 , stock: 10, sku: null },
      { id: 'v3', weight: 4, price: 419900, oldPrice: null , stock: 10, sku: null },
    ],
    isGrainFree: false,
    isHypoallergenic: false,
  },
  {
    ...mockDefaults,
    id: '2',
    name: "Hill's Science Plan Adult для собак",
    brand: { id: 'b-hills', name: "Hill's", slug: 'hills' },
    variants: [
      { id: 'v4', weight: 1.5, price: 159900, oldPrice: 179900 , stock: 10, sku: null },
      { id: 'v5', weight: 6, price: 489900, oldPrice: 549900 , stock: 10, sku: null },
    ],
    isGrainFree: false,
    isHypoallergenic: true,
  },
  {
    ...mockDefaults,
    id: '3',
    name: 'Farmina N&D Grain Free Ancestral',
    brand: { id: 'b-farmina', name: "Farmina", slug: 'farmina' },
    variants: [
      { id: 'v6', weight: 1.5, price: 219900, oldPrice: null , stock: 10, sku: null },
      { id: 'v7', weight: 5, price: 589900, oldPrice: 649900 , stock: 10, sku: null },
    ],
    isGrainFree: true,
    isHypoallergenic: false,
  },
  {
    ...mockDefaults,
    id: '4',
    name: 'Purina Pro Plan Sensitive для кошек',
    brand: { id: 'b-purina-pro-plan', name: "Purina Pro Plan", slug: 'purina-pro-plan' },
    variants: [
      { id: 'v8', weight: 0.4, price: 69900, oldPrice: 79900 , stock: 10, sku: null },
      { id: 'v9', weight: 3, price: 329900, oldPrice: null , stock: 10, sku: null },
    ],
    isGrainFree: false,
    isHypoallergenic: true,
  },
  {
    ...mockDefaults,
    id: '5',
    name: 'Monge BWild Grain Free Rabbit',
    brand: { id: 'b-monge', name: "Monge", slug: 'monge' },
    variants: [
      { id: 'v10', weight: 1.5, price: 189900, oldPrice: 209900 , stock: 10, sku: null },
      { id: 'v11', weight: 12, price: 989900, oldPrice: null , stock: 10, sku: null },
    ],
    isGrainFree: true,
    isHypoallergenic: true,
  },
  {
    ...mockDefaults,
    id: '6',
    name: 'Brit Premium Adult для собак крупных пород',
    brand: { id: 'b-brit', name: "Brit", slug: 'brit' },
    variants: [
      { id: 'v12', weight: 3, price: 189900, oldPrice: 219900 , stock: 10, sku: null },
      { id: 'v13', weight: 15, price: 779900, oldPrice: 849900 , stock: 10, sku: null },
    ],
    isGrainFree: false,
    isHypoallergenic: false,
  },
]

function ProductCard({ product, isFavorited, onToggleFavorite }: {
  product: Product
  isFavorited: boolean
  onToggleFavorite: (productId: string) => void
}) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id)
  const [addedToCart, setAddedToCart] = useState(false)

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId)!

  function handleAddToCart() {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  function handleFavoriteClick() {
    onToggleFavorite(product.id)
  }

  return (
    <div className="flex-shrink-0 w-52 bg-white rounded-card shadow-sm hover:shadow-card hover:-translate-y-0.5 transition-[transform,box-shadow] duration-100 flex flex-col overflow-hidden border border-line">
      {/* Изображение */}
      <div className="relative h-44 bg-blue-50 flex items-center justify-center">

        {/* Бейджики */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isGrainFree && (
            <span className="bg-green-100 text-green-700 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              Без зерна
            </span>
          )}
          {product.isHypoallergenic && (
            <span className="bg-blue-100 text-primary-hover text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              Гипоалл.
            </span>
          )}
        </div>

        {/* Избранное */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Убрать из избранного' : 'Добавить в избранное'}
          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center transition-transform hover:scale-110 rounded-full"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFavorited ? 'text-amber-400' : 'text-navy-300'}>
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Контент */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-[10px] text-navy-500 font-medium uppercase tracking-wide">{product.brand?.name}</p>
        <p className="text-sm font-semibold text-navy-900 leading-tight line-clamp-2">{product.name}</p>

        {/* Выбор веса */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-[background-color,border-color] duration-100 ${
                v.id === selectedVariantId
                  ? 'bg-primary-tint border-primary-soft text-navy-900'
                  : 'border-line text-navy-500 hover:border-primary-soft'
              }`}
            >
              {v.weight < 1 ? `${v.weight * 1000}г` : `${v.weight}кг`}
            </button>
          ))}
        </div>

        {/* Цена */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-navy-900">
            {formatPrice(selectedVariant.price)}
          </span>
          {selectedVariant.oldPrice && (
            <span className="text-xs text-navy-300 line-through">
              {formatPrice(selectedVariant.oldPrice)}
            </span>
          )}
        </div>

        {/* Кнопка в корзину */}
        <button
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-[background-color,transform] duration-100 ${
            addedToCart
              ? 'bg-green-100 text-green-700'
              : 'bg-primary text-white hover:bg-primary-hover hover:scale-[1.02]'
          }`}
        >
          {addedToCart ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              Добавлено
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              В корзину
            </>
          )}
        </button>
      </div>
    </div>
  )
}

interface FeaturedProductsProps {
  title: string
  products?: Product[]
}

export default function FeaturedProducts({ title, products: passedProducts }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<Product[]>(passedProducts || mockProducts)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(!passedProducts)
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')

  useEffect(() => {
    if (!passedProducts) {
      productsApi.list({ featured: 'true' })
        .then(res => setProducts(res.data.items))
        .catch(() => setProducts(mockProducts))
        .finally(() => setLoading(false))
    }

    favoritesApi.getAll()
      .then(res => {
        setFavorites(new Set(res.data.map(f => f.productId)))
      })
      .catch(() => {})
  }, [passedProducts])

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' })
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' })
  }

  async function handleToggleFavorite(productId: string) {
    // Блокировка повторного клика
    if (pendingIds.has(productId)) return

    const isFav = favorites.has(productId)
    const prevFavorites = new Set(favorites)

    // Оптимистичное обновление
    setPendingIds(prev => new Set(prev).add(productId))
    setFavorites(prev => {
      const next = new Set(prev)
      isFav ? next.delete(productId) : next.add(productId)
      return next
    })
    setError('')

    try {
      if (isFav) {
        await favoritesApi.remove(productId)
      } else {
        await favoritesApi.add(productId)
      }
    } catch (err: any) {
      // Откат при ошибке
      setFavorites(prevFavorites)

      // Если не авторизован, перенаправим на логин
      if (!localStorage.getItem('token')) {
        window.location.href = '/auth'
      } else {
        setError(err?.response?.data?.error || 'Ошибка при изменении избранного')
      }
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev)
        next.delete(productId)
        return next
      })
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">×</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-navy-900">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full bg-white border border-line shadow-sm hover:shadow-md flex items-center justify-center text-navy-500 hover:text-primary-hover transition-[color,box-shadow] hover:scale-110"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="w-8 h-8 rounded-full bg-white border border-line shadow-sm hover:shadow-md flex items-center justify-center text-navy-500 hover:text-primary-hover transition-[color,box-shadow] hover:scale-110"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorited={favorites.has(product.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </section>
  )
}
