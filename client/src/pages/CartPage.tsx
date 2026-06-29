import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

// Порог бесплатной доставки в копейках (2000 ₽)
const FREE_DELIVERY_THRESHOLD = 200000

// Бонусный процент от суммы заказа
const BONUS_RATE = 0.01

const mockItems = [
  {
    id: '1',
    productId: '1',
    slug: 'royal-canin-renal',
    name: 'Royal Canin Renal для взрослых кошек при хронической почечной недостаточности',
    brand: 'Royal Canin',
    weight: 2,
    price: 249900,
    oldPrice: 279900,
    quantity: 1,
    stock: 23,
  },
  {
    id: '2',
    productId: '2',
    slug: 'hills-kd',
    name: "Hill's Prescription Diet k/d Kidney Care для кошек",
    brand: "Hill's",
    weight: 1.5,
    price: 219900,
    oldPrice: 249900,
    quantity: 2,
    stock: 10,
  },
  {
    id: '3',
    productId: '3',
    slug: 'purina-nf',
    name: 'Purina Pro Plan Veterinary Diets NF Renal Function',
    brand: 'Purina',
    weight: 1.5,
    price: 189900,
    oldPrice: null,
    quantity: 1,
    stock: 5,
  },
]

export default function CartPage() {
  const [items, setItems] = useState(mockItems)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)) }
          : item
      )
    )
  }

  const removeItem = (id: string) => {
    setRemovingId(id)
    setTimeout(() => {
      setItems(prev => prev.filter(item => item.id !== id))
      setRemovingId(null)
    }, 300)
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = items.reduce((sum, item) =>
    item.oldPrice ? sum + (item.oldPrice - item.price) * item.quantity : sum, 0)
  const promoDiscount = promoApplied ? Math.round(subtotal * 0.1) : 0
  const total = subtotal - promoDiscount

  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const deliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)
  const bonusEarned = Math.floor(total * BONUS_RATE)

  const handlePromo = () => {
    if (promoCode.toLowerCase() === 'simba10') setPromoApplied(true)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-8xl">🛒</div>
        <h2 className="text-2xl font-bold text-navy-900">Корзина пуста</h2>
        <p className="text-navy-400 text-center">Добавьте товары из каталога, чтобы оформить заказ</p>
        <Link to="/catalog"
          className="bg-blue-200 text-navy-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-300 transition-colors">
          Перейти в каталог
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-navy-900 mb-4">
          Корзина <span className="text-navy-300 font-normal text-lg">({items.length} товара)</span>
        </h1>

        {/* Полоса до бесплатной доставки */}
        <div className="bg-white rounded-2xl px-5 py-4 mb-6">
          {toFreeDelivery > 0 ? (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-navy-700 font-medium">
                  До бесплатной доставки: <span className="text-blue-300 font-bold">{(toFreeDelivery / 100).toLocaleString('ru-RU')} ₽</span>
                </span>
                <span className="text-navy-400 text-xs">от {(FREE_DELIVERY_THRESHOLD / 100).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-200 rounded-full transition-all duration-500"
                  style={{ width: `${deliveryProgress}%` }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-2 bg-green-100 rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-green-400 rounded-full w-full" />
              </div>
              <span className="text-green-600 text-sm font-semibold whitespace-nowrap">🚚 Доставка бесплатна!</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Список товаров */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {items.map(item => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 flex gap-4 transition-all duration-300 ${
                  removingId === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                }`}
              >
                {/* Фото */}
                <Link to={`/product/${item.slug}`}
                  className="w-24 h-24 bg-blue-50 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 hover:opacity-80 transition-opacity">
                  🐾
                </Link>

                {/* Инфо */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-navy-300 mb-0.5">{item.brand}</p>
                  <Link to={`/product/${item.slug}`}
                    className="text-sm font-semibold text-navy-900 hover:text-blue-300 transition-colors line-clamp-2 block mb-1">
                    {item.name}
                  </Link>
                  <p className="text-xs text-navy-400 mb-3">{item.weight} кг</p>

                  <div className="flex items-center justify-between flex-wrap gap-3">
                    {/* Счётчик */}
                    <div className="flex items-center border border-blue-100 rounded-xl overflow-hidden bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-9 h-9 flex items-center justify-center text-navy-500 hover:bg-blue-50 transition-colors font-bold text-lg">
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-navy-900 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-9 h-9 flex items-center justify-center text-navy-500 hover:bg-blue-50 transition-colors font-bold text-lg disabled:opacity-30">
                        +
                      </button>
                    </div>

                    {/* Цена */}
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-navy-900">
                        {(item.price * item.quantity / 100).toLocaleString('ru-RU')} ₽
                      </span>
                      {item.oldPrice && (
                        <span className="text-xs text-navy-300 line-through">
                          {(item.oldPrice * item.quantity / 100).toLocaleString('ru-RU')} ₽
                        </span>
                      )}
                    </div>

                    {/* Удалить */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-navy-300 hover:text-red-400 transition-colors p-1">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Продолжить покупки */}
            <Link to="/catalog"
              className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition-colors text-sm font-medium mt-2 w-fit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Продолжить покупки
            </Link>
          </div>

          {/* Итого */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 sticky top-24">
              <h2 className="text-lg font-bold text-navy-900 mb-4">Итого</h2>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Товары ({items.reduce((s, i) => s + i.quantity, 0)} шт.)</span>
                  <span className="text-navy-900">{(subtotal / 100).toLocaleString('ru-RU')} ₽</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Скидка</span>
                    <span className="text-green-600">−{(discount / 100).toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                {promoApplied && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Промокод SIMBA10</span>
                    <span className="text-green-600">−{(promoDiscount / 100).toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Доставка</span>
                  <span className="text-green-600">Бесплатно</span>
                </div>
              </div>

              <div className="border-t border-blue-100 pt-3 mb-4">
                <div className="flex justify-between">
                  <span className="font-bold text-navy-900">К оплате</span>
                  <span className="font-black text-xl text-navy-900">{(total / 100).toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>

              {/* Промокод */}
              {!promoApplied ? (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    placeholder="Промокод"
                    className="flex-1 px-3 py-2 rounded-xl border border-blue-100 text-sm focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    onClick={handlePromo}
                    className="px-4 py-2 bg-blue-100 text-navy-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors">
                    Применить
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-4 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span className="text-green-600 text-sm font-medium">✓ Промокод применён</span>
                  <button
                    onClick={() => { setPromoApplied(false); setPromoCode('') }}
                    className="ml-auto text-navy-300 hover:text-navy-500 text-xs">
                    Отменить
                  </button>
                </div>
              )}

              {/* Бонусы */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎁</span>
                  <p className="text-sm font-semibold text-navy-900">
                    За этот заказ вы получите{' '}
                    <span className="text-amber-500">+{bonusEarned} бонусов</span>
                  </p>
                </div>
                <p className="text-xs text-navy-400 mb-2">1 бонус = 1 ₽ скидки на следующий заказ</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-white border border-amber-200 text-navy-600 px-2 py-0.5 rounded-full">Новичок: 0–999</span>
                  <span className="bg-white border border-amber-200 text-navy-600 px-2 py-0.5 rounded-full">Активный: 1000+</span>
                  <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Премиум: 5000+</span>
                </div>
              </div>

              <Link to="/checkout"
                className="block w-full bg-blue-200 text-navy-900 font-bold py-3.5 rounded-xl text-center hover:bg-blue-300 active:scale-95 transition-all text-sm">
                Оформить заказ
              </Link>

              <p className="text-center text-xs text-navy-300 mt-3">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="#" className="text-blue-300 hover:underline">условиями оферты</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
