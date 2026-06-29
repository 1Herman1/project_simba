import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

// Mock данные товара
const mockProduct = {
  id: '1',
  name: 'Royal Canin Renal для взрослых кошек при хронической почечной недостаточности',
  slug: 'royal-canin-renal',
  brand: 'Royal Canin',
  brandSlug: 'royal-canin',
  sku: '1063004',
  country: 'Франция',
  rating: 4.9,
  reviewCount: 13,
  images: [], // заглушки
  isGrainFree: false,
  isHypoallergenic: false,
  isWeightControl: false,
  description: `Royal Canin Renal — полнорационный диетический корм для взрослых кошек при хронической почечной недостаточности (ХПН).

Преимущества:
• Пониженное содержание фосфора — снижает нагрузку на почки и замедляет прогрессирование болезни
• Высококачественные белки — поддерживают мышечную массу при ограниченном их количестве
• Повышенная энергетическая ценность — компенсирует сниженный аппетит
• Омега-3 жирные кислоты (EPA и DHA) — противовоспалительное действие
• Антиоксиданты (витамины E и C) — поддержка иммунитета

Срок годности: 18 месяцев с даты производства.`,
  protein: 25.0,
  fat: 20.0,
  fiber: 0.6,
  ash: 4.5,
  ingredients: 'Дегидрированная птица, кукуруза, пшеничный глютен, животный жир, рисовая мука, гидролизат белков животного происхождения, свекольный жом, рыбий жир, соевое масло',
  specs: [
    { label: 'Артикул', value: '1063004' },
    { label: 'Бренд', value: 'Royal Canin' },
    { label: 'Страна-производитель', value: 'Франция' },
    { label: 'Тип корма', value: 'Сухой' },
    { label: 'Для кого', value: 'Кошки' },
    { label: 'Назначение', value: 'Лечебный' },
    { label: 'Возраст питомца', value: 'Для взрослых от 1 года' },
    { label: 'Тип упаковки', value: 'Пакет' },
    { label: 'Особые показания', value: 'Почечная недостаточность' },
  ],
  variants: [
    { id: 'v1', weight: 0.5, price: 89900, oldPrice: 99900, stock: 45, pricePerKg: 179800 },
    { id: 'v2', weight: 2, price: 249900, oldPrice: 279900, stock: 23, pricePerKg: 124950 },
    { id: 'v3', weight: 4, price: 419900, oldPrice: null, stock: 12, pricePerKg: 104975 },
  ],
  reviews: [
    { id: '1', author: 'Мила И.', date: '21.04.2026', rating: 5, pros: 'Всё быстро и корректно доставили.', cons: '', comment: '' },
    { id: '2', author: 'Дмитрий Ш.', date: '18.04.2026', rating: 5, pros: 'Отличный корм, с хорошим содержанием мяса и комплекса витаминов. Перевели кошку с года и продолжаем по сей день.', cons: 'За всё время использования их нет.', comment: 'Рекомендую данный корм.' },
    { id: '3', author: 'Наталья К.', date: '16.02.2026', rating: 5, pros: 'Приемлемая цена, большая упаковка, всегда в наличии и свежий.', cons: '', comment: '' },
    { id: '4', author: 'Анастасия С.', date: '25.06.2026', rating: 5, pros: 'Хороший корм, подошёл кошке!', cons: '', comment: '' },
  ],
  related: [
    { id: '2', name: "Hill's k/d Kidney Care", brand: "Hill's", price: 219900, oldPrice: 249900, weight: 1.5, slug: 'hills-kd' },
    { id: '3', name: 'Purina Pro Plan NF Renal', brand: 'Purina', price: 189900, oldPrice: null, weight: 1.5, slug: 'purina-nf' },
    { id: '4', name: 'Monge Vetsolution Renal', brand: 'Monge', price: 249900, oldPrice: 279900, weight: 2, slug: 'monge-renal' },
  ],
}

export default function ProductPage() {
  const { slug } = useParams()
  const product = mockProduct // позже заменим на API запрос

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0])
  const [activeTab, setActiveTab] = useState<'about' | 'specs' | 'reviews'>('about')
  const [liked, setLiked] = useState(false)
  const [added, setAdded] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const discount = selectedVariant.oldPrice
    ? Math.round((1 - selectedVariant.price / selectedVariant.oldPrice) * 100)
    : null

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
            <div className="flex flex-col gap-2">
              {[0, 1, 2, 3].map(i => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-16 rounded-xl bg-white border-2 flex items-center justify-center text-2xl transition-all ${
                    activeImage === i ? 'border-blue-200 shadow-md' : 'border-blue-100 opacity-60 hover:opacity-100'
                  }`}>
                  🐾
                </button>
              ))}
            </div>

            {/* Большое фото */}
            <div className="flex-1 bg-white rounded-2xl flex items-center justify-center min-h-[400px] relative">
              <div className="text-[120px] opacity-20">🐾</div>

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
            <Link to={`/catalog?brand=${product.brandSlug}`}
              className="text-blue-300 font-semibold text-sm hover:text-blue-400 transition-colors w-fit">
              {product.brand}
            </Link>

            {/* Название */}
            <h1 className="text-xl font-bold text-navy-900 leading-snug">{product.name}</h1>

            {/* Рейтинг + артикул */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <svg key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'}`}
                      fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <span className="font-bold text-navy-900">{product.rating}</span>
                <button onClick={() => setActiveTab('reviews')}
                  className="text-blue-300 hover:text-blue-400 text-sm transition-colors">
                  {product.reviewCount} отзывов
                </button>
              </div>
              <span className="text-navy-300 text-sm">Арт. {product.sku}</span>
            </div>

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
                    <span className="text-xs text-navy-400">{(v.pricePerKg / 100).toLocaleString('ru-RU')} ₽/кг</span>
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
              { key: 'reviews', label: `Отзывы (${product.reviewCount})` },
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
                {product.specs.map(spec => (
                  <div key={spec.label} className="flex py-3">
                    <span className="text-navy-400 text-sm w-48 flex-shrink-0">{spec.label}</span>
                    <span className="text-navy-900 text-sm font-medium">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Итоговый рейтинг */}
                <div className="flex items-center gap-6 mb-6 p-4 bg-blue-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-5xl font-black text-navy-900">{product.rating}</p>
                    <div className="flex justify-center mt-1">
                      {[1,2,3,4,5].map(s => (
                        <svg key={s} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>
                    <p className="text-navy-400 text-xs mt-1">{product.reviewCount} отзывов</p>
                  </div>
                  <button className="ml-auto bg-blue-200 text-navy-900 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-300 transition-colors">
                    Написать отзыв
                  </button>
                </div>

                {/* Список отзывов */}
                <div className="flex flex-col gap-4">
                  {product.reviews.map(review => (
                    <div key={review.id} className="border border-blue-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-navy-900 text-sm">{review.author}</span>
                        <span className="text-navy-300 text-xs">{review.date}</span>
                      </div>
                      <div className="flex mb-3">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
                            fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                        ))}
                      </div>
                      {review.pros && (
                        <div className="mb-1">
                          <span className="text-green-600 text-xs font-medium">Достоинства: </span>
                          <span className="text-navy-700 text-sm">{review.pros}</span>
                        </div>
                      )}
                      {review.cons && (
                        <div className="mb-1">
                          <span className="text-red-500 text-xs font-medium">Недостатки: </span>
                          <span className="text-navy-700 text-sm">{review.cons}</span>
                        </div>
                      )}
                      {review.comment && (
                        <p className="text-navy-600 text-sm mt-1">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Похожие товары */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-navy-900 mb-4">Похожие товары</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.related.map(r => (
              <Link key={r.id} to={`/product/${r.slug}`}
                className="bg-white rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="bg-blue-50 rounded-xl h-32 flex items-center justify-center text-4xl mb-3">🐾</div>
                <p className="text-xs text-navy-300 mb-1">{r.brand}</p>
                <p className="text-sm font-semibold text-navy-900 mb-2"
                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {r.name}
                </p>
                <p className="text-xs text-navy-400 mb-2">{r.weight} кг</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold text-navy-900">{(r.price / 100).toLocaleString('ru-RU')} ₽</span>
                  {r.oldPrice && <span className="text-xs text-navy-300 line-through">{(r.oldPrice / 100).toLocaleString('ru-RU')} ₽</span>}
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
