import { useState, useRef } from 'react'

interface Variant {
  id: string
  weight: number
  price: number
  oldPrice: number | null
}

interface Product {
  id: string
  name: string
  brand: string
  variants: Variant[]
  isGrainFree: boolean
  isHypoallergenic: boolean
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Royal Canin Renal для кошек',
    brand: 'Royal Canin',
    variants: [
      { id: 'v1', weight: 0.5, price: 89900, oldPrice: 99900 },
      { id: 'v2', weight: 2, price: 249900, oldPrice: 279900 },
      { id: 'v3', weight: 4, price: 419900, oldPrice: null },
    ],
    isGrainFree: false,
    isHypoallergenic: false,
  },
  {
    id: '2',
    name: "Hill's Science Plan Adult для собак",
    brand: "Hill's",
    variants: [
      { id: 'v4', weight: 1.5, price: 159900, oldPrice: 179900 },
      { id: 'v5', weight: 6, price: 489900, oldPrice: 549900 },
    ],
    isGrainFree: false,
    isHypoallergenic: true,
  },
  {
    id: '3',
    name: 'Farmina N&D Grain Free Ancestral',
    brand: 'Farmina',
    variants: [
      { id: 'v6', weight: 1.5, price: 219900, oldPrice: null },
      { id: 'v7', weight: 5, price: 589900, oldPrice: 649900 },
    ],
    isGrainFree: true,
    isHypoallergenic: false,
  },
  {
    id: '4',
    name: 'Purina Pro Plan Sensitive для кошек',
    brand: 'Purina Pro Plan',
    variants: [
      { id: 'v8', weight: 0.4, price: 69900, oldPrice: 79900 },
      { id: 'v9', weight: 3, price: 329900, oldPrice: null },
    ],
    isGrainFree: false,
    isHypoallergenic: true,
  },
  {
    id: '5',
    name: 'Monge BWild Grain Free Rabbit',
    brand: 'Monge',
    variants: [
      { id: 'v10', weight: 1.5, price: 189900, oldPrice: 209900 },
      { id: 'v11', weight: 12, price: 989900, oldPrice: null },
    ],
    isGrainFree: true,
    isHypoallergenic: true,
  },
  {
    id: '6',
    name: 'Brit Premium Adult для собак крупных пород',
    brand: 'Brit',
    variants: [
      { id: 'v12', weight: 3, price: 189900, oldPrice: 219900 },
      { id: 'v13', weight: 15, price: 779900, oldPrice: 849900 },
    ],
    isGrainFree: false,
    isHypoallergenic: false,
  },
]

function ProductCard({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0].id)
  const [isFavorite, setIsFavorite] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId)!

  function handleAddToCart() {
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1500)
  }

  return (
    <div className="flex-shrink-0 w-52 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden border border-blue-50">
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
            <span className="bg-blue-100 text-blue-500 text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              Гипоалл.
            </span>
          )}
        </div>

        {/* Избранное */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-2 right-2 transition-all hover:scale-110"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? '#FFB347' : 'none'} stroke={isFavorite ? '#FFB347' : '#8FA8C0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>

      {/* Контент */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-[10px] text-navy-300 font-medium uppercase tracking-wide">{product.brand}</p>
        <p className="text-sm font-semibold text-navy-900 leading-tight line-clamp-2">{product.name}</p>

        {/* Выбор веса */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {product.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
                v.id === selectedVariantId
                  ? 'bg-blue-200 border-blue-200 text-navy-900'
                  : 'border-blue-100 text-navy-500 hover:border-blue-200'
              }`}
            >
              {v.weight < 1 ? `${v.weight * 1000}г` : `${v.weight}кг`}
            </button>
          ))}
        </div>

        {/* Цена */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-navy-900">
            {(selectedVariant.price / 100).toLocaleString('ru-RU')} ₽
          </span>
          {selectedVariant.oldPrice && (
            <span className="text-xs text-navy-300 line-through">
              {(selectedVariant.oldPrice / 100).toLocaleString('ru-RU')} ₽
            </span>
          )}
        </div>

        {/* Кнопка в корзину */}
        <button
          onClick={handleAddToCart}
          className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold transition-all ${
            addedToCart
              ? 'bg-green-100 text-green-700'
              : 'bg-blue-200 hover:bg-blue-300 text-navy-900 hover:scale-[1.02]'
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
}

export default function FeaturedProducts({ title }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollLeft() {
    scrollRef.current?.scrollBy({ left: -220, behavior: 'smooth' })
  }

  function scrollRight() {
    scrollRef.current?.scrollBy({ left: 220, behavior: 'smooth' })
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-navy-900">{title}</h2>
        <div className="flex gap-2">
          <button
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full bg-white border border-blue-100 shadow-sm hover:shadow-md flex items-center justify-center text-navy-500 hover:text-blue-300 transition-all hover:scale-110"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15,18 9,12 15,6"/>
            </svg>
          </button>
          <button
            onClick={scrollRight}
            className="w-8 h-8 rounded-full bg-white border border-blue-100 shadow-sm hover:shadow-md flex items-center justify-center text-navy-500 hover:text-blue-300 transition-all hover:scale-110"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9,18 15,12 9,6"/>
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
