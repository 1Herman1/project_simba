import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productsApi, cartApi, type Product, type ProductVariant } from '../lib/api'

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'specs' | 'reviews'>('about')
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    productsApi.bySlug(slug)
      .then(res => {
        setProduct(res.data)
        setSelectedVariant(res.data.variants[0] ?? null)
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
    productsApi.related(slug)
      .then(res => setRelated(res.data))
      .catch(() => setRelated([]))
  }, [slug])

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    try {
      await cartApi.addItem(selectedVariant.id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😿</div>
        <p className="text-navy-500 text-lg">Товар не найден</p>
        <Link to="/catalog" className="text-blue-300 hover:text-blue-400">← В каталог</Link>
      </div>
    )
  }

  const discount = selectedVariant.oldPrice
    ? Math.round((1 - selectedVariant.price / selectedVariant.oldPrice) * 100)
    : null

  const pricePerKg = Math.round(selectedVariant.price / selectedVariant.weight)

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Хлебные крошки */}
        <nav className="flex items-center gap-2 text-sm text-navy-300 mb-6 flex-wrap">
          <Link to="/" className="hover:text-blue-300 transition-colors">Главная</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-blue-300 transition-colors">Каталог</Link>
          <span>/</span>
          <Link to="/catalog?category=cats-food" className="hover:text-blue-300 transition-colors">Корм для кошек</Link>
          <span>/</span>
          <span className="text-navy-700 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Основной блок */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

          {/* Левая колонка — Галерея */}
          <div className="flex gap-3">
            {/* Миниатюры */}
            {product.images.length > 1 && (
              <div className="flex flex-col gap-2">
                {product.images.slice(0, 4).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl bg-white border-2 flex items-center justify-center text-2xl transition-all overflow-hidden ${
                      activeImage === i ? 'border-blue-200 shadow-md' : 'border-blue-100 opacity-60 hover:opacity-100'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Большое фото */}
            <div className="flex-1 bg-white rounded-2xl flex items-center justify-center min-h-[400px] relative overflow-hidden">
              {product.images.length > 0
                ? <img src={product.images[activeImage] ?? product.images[0]} alt={product.name} className="w-full h-full object-contain p-4" />
                : <div className="text-[120px] opacity-20">🐾</div>
              }

              {discount && (
                <span className="absolute top-4 left-4 bg-amber-400 text-white font-bold px-3 py-1 rounded-full text-sm">
                  -{discount}%
                </span>
              )}

              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {product.isGrainFree && (
                  <span className="bg-blue-100 text-navy-700 text-xs font-medium px-2 py-1 rounded-full">Без зерна</span>
                )}
                {product.isHypoallergenic && (
                  <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">Гипоалл.</span>
                )}
              </div>
            </div>
          </div>

          {/* Правая колонка — Инфо */}
          <div className="flex flex-col gap-4">

            {/* Бренд */}
            {product.brand && (
            <Link to={`/catalog?brand=${product.brand.slug}`}
              className="text-blue-300 font-semibold text-sm hover:text-blue-400 transition-colors w-fit">
              {product.brand.name}
            </Link>
          )}

            {/* Название */}
            <h1 className="text-xl font-bold text-navy-900 leading-snug">{product.name}</h1>

            {product.variants[0]?.sku && (
              <span className="text-navy-300 text-sm">Арт. {product.variants[0].sku}</span>
            )}

            {/* Варианты веса */}
            <div>
              <p className="text-sm text-navy-500 mb-2">Вес упаковки:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`flex flex-col items-center px-4 py-2 rounded-xl border-2 transition-all ${
                      selectedVariant.id === v.id
                        ? 'border-blue-200 bg-blue-50 shadow-sm'
                        : 'border-blue-100 bg-white hover:border-blue-200'
                    }`}>
                    <span className="font-bold text-navy-900">{v.weight} кг</span>
                    <span className="text-xs text-navy-400">{(Math.round(v.price / v.weight) / 100).toLocaleString('ru-RU')} ₽/кг</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Цена */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-navy-900">
                {(selectedVariant.price / 100).toLocaleString('ru-RU')} ₽
              </span>
              {selectedVariant.oldPrice && (
                <span className="text-lg text-navy-300 line-through">
                  {(selectedVariant.oldPrice / 100).toLocaleString('ru-RU')} ₽
                </span>
              )}
              {discount && (
                <span className="text-amber-500 font-bold text-sm">Скидка {discount}%</span>
              )}
            </div>

            {/* Количество + кнопки */}
            <div className="flex gap-3 items-center">
              {/* Счётчик */}
              <div className="flex items-center border border-blue-100 rounded-xl overflow-hidden bg-white">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-11 flex items-center justify-center text-navy-500 hover:bg-blue-50 transition-colors text-lg font-bold">
                  −
                </button>
                <span className="w-10 text-center font-bold text-navy-900">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-11 flex items-center justify-center text-navy-500 hover:bg-blue-50 transition-colors text-lg font-bold">
                  +
                </button>
              </div>

              {/* В корзину */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                  added ? 'bg-green-100 text-green-700' : 'bg-blue-200 text-navy-900 hover:bg-blue-300 active:scale-95'
                }`}>
                {added ? '✓ Добавлено в корзину' : 'Добавить в корзину'}
              </button>

              {/* В избранное */}
              <button
                onClick={() => setLiked(!liked)}
                className="w-11 h-11 border border-blue-100 rounded-xl flex items-center justify-center bg-white hover:border-blue-200 transition-all hover:scale-110">
                <svg className={`w-5 h-5 transition-colors ${liked ? 'fill-red-500 stroke-red-500' : 'fill-none stroke-navy-300'}`}
                  viewBox="0 0 24 24" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Бонусы */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <div>
                <p className="text-sm font-semibold text-navy-900">Дарим 100 бонусов за отзыв с фото</p>
                <p className="text-xs text-navy-400">1 бонус = 1 рубль скидки на следующий заказ</p>
              </div>
            </div>

            {/* Доставка */}
            <div className="bg-white rounded-xl border border-blue-100 divide-y divide-blue-50">
              {[
                { icon: '⚡', title: 'Экспресс', desc: 'Платно, за 1 час' },
                { icon: '🚚', title: 'Доставка', desc: 'Бесплатно, в интервал' },
                { icon: '🏪', title: 'Самовывоз', desc: 'Бесплатно, от 30 мин' },
              ].map(d => (
                <div key={d.title} className="flex items-center gap-3 p-3">
                  <span className="text-xl">{d.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium text-navy-900 text-sm">{d.title}</span>
                    <span className="text-navy-400 text-xs ml-2">{d.desc}</span>
                  </div>
                  <button className="text-blue-300 text-xs hover:text-blue-400 transition-colors">Указать адрес</button>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Табы */}
        <div className="bg-white rounded-2xl overflow-hidden mb-8">
          <div className="flex border-b border-blue-100">
            {[
              { key: 'about', label: 'О товаре' },
              { key: 'specs', label: 'Характеристики' },
              { key: 'reviews', label: 'Отзывы' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as 'about' | 'specs' | 'reviews')}
                className={`px-6 py-4 text-sm font-medium transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-200 text-blue-400'
                    : 'border-transparent text-navy-500 hover:text-navy-700'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'about' && (
              <div className="prose max-w-none">
                <div className="text-navy-700 leading-relaxed whitespace-pre-line text-sm">{product.description}</div>
                {(product.protein || product.fat) && (
                  <div className="mt-6 grid grid-cols-4 gap-4">
                    {[
                      { label: 'Белки', value: product.protein, unit: '%' },
                      { label: 'Жиры', value: product.fat, unit: '%' },
                      { label: 'Клетчатка', value: product.fiber, unit: '%' },
                      { label: 'Зола', value: product.ash, unit: '%' },
                    ].map(n => n.value && (
                      <div key={n.label} className="bg-blue-50 rounded-xl p-3 text-center">
                        <p className="text-2xl font-black text-blue-300">{n.value}</p>
                        <p className="text-xs text-navy-400">{n.label} {n.unit}</p>
                      </div>
                    ))}
                  </div>
                )}
                {product.ingredients && (
                  <div className="mt-4">
                    <p className="font-semibold text-navy-900 mb-1 text-sm">Состав:</p>
                    <p className="text-navy-500 text-sm">{product.ingredients}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="divide-y divide-blue-50">
                {[
                  product.brand && { label: 'Бренд', value: product.brand.name },
                  { label: 'Белки', value: product.protein ? `${product.protein}%` : null },
                  { label: 'Жиры', value: product.fat ? `${product.fat}%` : null },
                  { label: 'Клетчатка', value: product.fiber ? `${product.fiber}%` : null },
                  { label: 'Зола', value: product.ash ? `${product.ash}%` : null },
                ].filter((s): s is { label: string; value: string } => !!s && !!s.value).map(spec => (
                  <div key={spec.label} className="flex py-3">
                    <span className="text-navy-400 text-sm w-48 flex-shrink-0">{spec.label}</span>
                    <span className="text-navy-900 text-sm font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">✍️</div>
                <p className="text-navy-400 mb-4">Отзывы пока не добавлены</p>
                <button className="bg-blue-200 text-navy-900 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-300 transition-colors">
                  Написать первый отзыв
                </button>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Похожие товары</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(r => {
                const v = r.variants[0]
                return (
                  <Link key={r.id} to={`/product/${r.slug}`}
                    className="bg-white rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="bg-blue-50 rounded-xl h-32 flex items-center justify-center text-4xl mb-3 overflow-hidden">
                      {r.images?.[0] ? <img src={r.images[0]} alt={r.name} className="w-full h-full object-cover" /> : '🐾'}
                    </div>
                    <p className="text-xs text-navy-300 mb-1">{r.brand?.name ?? ''}</p>
                    <p className="text-sm font-semibold text-navy-900 mb-2"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.name}
                    </p>
                    {v && (
                      <>
                        <p className="text-xs text-navy-400 mb-2">{v.weight} кг</p>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold text-navy-900">{(v.price / 100).toLocaleString('ru-RU')} ₽</span>
                          {v.oldPrice && <span className="text-xs text-navy-300 line-through">{(v.oldPrice / 100).toLocaleString('ru-RU')} ₽</span>}
                        </div>
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
