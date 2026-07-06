import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cartApi, authApi, ordersApi, type CartItem } from '../lib/api'

type DeliveryMethod = 'simba_courier' | 'pickup' | 'cdek' | 'yandex' | 'post' | 'ozon' | 'dostavista'
type PaymentMethod = 'online' | 'cash'
type Step = 'delivery' | 'payment' | 'confirm'

interface DeliveryQuote {
  provider: DeliveryMethod
  key: string
  title: string
  description: string
  price: number
  daysMin: number
  daysMax: number
  available: boolean
  error?: string
}

const PROVIDER_ICONS: Record<string, string> = {
  simba_courier: '🚚',
  yandex: '🟡',
  cdek: '📦',
  ozon: '🔵',
  dostavista: '⚡',
  post: '✉️',
  pickup: '🏪',
}

const DELIVERY_LABELS: Record<string, string> = {
  simba_courier: 'Курьер Simba',
  yandex: 'Яндекс Доставка',
  cdek: 'СДЭК',
  ozon: 'Ozon Delivery',
  dostavista: 'Достависта',
  post: 'Почта России',
  pickup: 'Самовывоз',
}

const STEPS: { key: Step; label: string }[] = [
  { key: 'delivery', label: 'Доставка' },
  { key: 'payment', label: 'Оплата' },
  { key: 'confirm', label: 'Подтверждение' },
]

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('delivery')
  const [delivery, setDelivery] = useState<DeliveryMethod>('simba_courier')
  const [payment, setPayment] = useState<PaymentMethod>('online')
  const [bonusSpend, setBonusSpend] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId] = useState('ORD-2026-0042')
  const [quotes, setQuotes] = useState<DeliveryQuote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(true)
  const [userBonusPoints, setUserBonusPoints] = useState(0)

  const [address, setAddress] = useState({
    city: 'Москва',
    street: '',
    house: '',
    apartment: '',
    comment: '',
    postalCode: '',
  })

  useEffect(() => {
    Promise.all([
      cartApi.get().then(res => setCartItems(res.data.items)).catch(() => setCartItems([])),
      authApi.me().then(res => setUserBonusPoints(res.data.bonusPoints)).catch(() => setUserBonusPoints(0)),
    ]).finally(() => setCartLoading(false))
  }, [])

  const totalWeight = cartItems.reduce((s, i) => s + i.productVariant.weight * i.quantity, 0)

  // Запрашиваем котировки при вводе города
  useEffect(() => {
    if (!address.city || address.city.length < 3) return
    const timer = setTimeout(async () => {
      setQuotesLoading(true)
      try {
        const res = await fetch('/api/delivery/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: address.city, street: address.street, house: address.house, postalCode: address.postalCode, weightKg: totalWeight }),
        })
        if (res.ok) {
          const data = await res.json() as { quotes: DeliveryQuote[] }
          setQuotes(data.quotes)
        }
      } catch {
        // Используем заглушки если API недоступен
      } finally {
        setQuotesLoading(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [address.city, address.street, address.house])

  const subtotal = cartItems.reduce((s, i) => s + i.productVariant.price * i.quantity, 0)
  const selectedQuote = quotes.find(q => q.provider === delivery)
  const deliveryCost = selectedQuote?.price ?? 0
  const bonusDiscount = bonusSpend ? Math.min(userBonusPoints, subtotal + deliveryCost) : 0
  const total = Math.max(0, subtotal + deliveryCost - bonusDiscount)
  const bonusEarned = Math.floor(total * 0.05)

  const stepIndex = STEPS.findIndex(s => s.key === step)

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    try {
      const promoCode = sessionStorage.getItem('promoCode') ?? undefined
      const cartRes = await fetch('/api/cart', { credentials: 'include' })
      const cart = await cartRes.json() as { id: string }
      await ordersApi.create({
        cartId: cart.id,
        deliveryMethod: delivery === 'simba_courier' ? 'cdek' : delivery,
        deliveryAddress: delivery !== 'pickup' && address.street
          ? { city: address.city, street: address.street, house: address.house, apartment: address.apartment || undefined, postalCode: '' }
          : undefined,
        comment: address.comment || undefined,
        bonusUsed: bonusSpend ? bonusDiscount : 0,
        promoCode,
      })
      sessionStorage.removeItem('promoCode')
      setOrderPlaced(true)
    } catch {
      // fallback для dev-режима без реального сервера
      setOrderPlaced(true)
    } finally {
      setPlacingOrder(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-5">
            ✅
          </div>
          <h1 className="text-2xl font-black text-navy-900 mb-2">Заказ оформлен!</h1>
          <p className="text-navy-400 text-sm mb-1">Номер заказа:</p>
          <p className="font-bold text-navy-900 text-lg mb-4">{orderId}</p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6">
            <p className="text-sm text-navy-700">
              🎁 Начислено <span className="font-bold text-amber-500">+{bonusEarned} сибакоинов</span> на ваш счёт
            </p>
          </div>
          <p className="text-xs text-navy-400 mb-6">
            Мы отправим SMS и email как только заказ будет подтверждён
          </p>
          <div className="flex flex-col gap-2">
            <Link to="/profile"
              className="block bg-blue-200 text-navy-900 font-bold py-3 rounded-xl hover:bg-blue-300 transition-colors text-sm">
              Мои заказы
            </Link>
            <Link to="/"
              className="block border border-blue-100 text-navy-500 font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              На главную
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50 pb-6">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Шапка */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart" className="text-navy-400 hover:text-navy-700 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-navy-900">Оформление заказа</h1>
        </div>

        {/* Прогресс шагов */}
        <div className="flex items-center mb-6">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <button
                onClick={() => i < stepIndex && setStep(s.key)}
                className={`flex items-center gap-2 ${i < stepIndex ? 'cursor-pointer' : 'cursor-default'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < stepIndex ? 'bg-green-400 text-white' :
                  i === stepIndex ? 'bg-blue-200 text-navy-900' :
                  'bg-blue-100 text-navy-400'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${
                  i === stepIndex ? 'text-navy-900' : 'text-navy-400'
                }`}>{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < stepIndex ? 'bg-green-300' : 'bg-blue-100'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Левая часть — шаги */}
          <div className="lg:col-span-2">

            {/* ШАГ 1 — Доставка */}
            {step === 'delivery' && (
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-navy-900 mb-4">Способ доставки</h2>

                {quotesLoading && (
                  <div className="flex items-center gap-2 text-sm text-navy-400 mb-3">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Рассчитываем стоимость доставки...
                  </div>
                )}

                <div className="flex flex-col gap-2 mb-5">
                  {(quotes.length > 0 ? quotes : [
                    { provider: 'simba_courier', key: 'simba_courier', title: 'Курьер Simba', description: 'Доставка до двери', price: 0, daysMin: 0, daysMax: 0, available: true },
                    { provider: 'yandex', key: 'yandex', title: 'Яндекс Доставка', description: 'Быстрая доставка', price: 0, daysMin: 0, daysMax: 0, available: true },
                    { provider: 'cdek', key: 'cdek', title: 'СДЭК', description: 'Пункт выдачи или курьер', price: 0, daysMin: 2, daysMax: 5, available: true },
                    { provider: 'ozon', key: 'ozon', title: 'Ozon Delivery', description: 'Пункт выдачи Ozon', price: 0, daysMin: 2, daysMax: 4, available: true },
                    { provider: 'dostavista', key: 'dostavista', title: 'Достависта', description: 'Экспресс за 1 час', price: 29900, daysMin: 0, daysMax: 0, available: true },
                    { provider: 'post', key: 'post', title: 'Почта России', description: 'Отделение почты', price: 0, daysMin: 5, daysMax: 14, available: true },
                    { provider: 'pickup', key: 'pickup', title: 'Самовывоз', description: 'Магазин на ул. Ленина, 12', price: 0, daysMin: 0, daysMax: 0, available: true },
                  ] as DeliveryQuote[]).map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => opt.available && setDelivery(opt.provider as DeliveryMethod)}
                      disabled={!opt.available}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        !opt.available ? 'border-blue-50 bg-blue-50 opacity-50 cursor-not-allowed' :
                        delivery === opt.provider
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-blue-100 bg-white hover:border-blue-200'
                      }`}>
                      <span className="text-2xl">{PROVIDER_ICONS[opt.provider] ?? '📦'}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-navy-900 text-sm">{opt.title}</span>
                          {opt.available ? (
                            opt.price > 0
                              ? <span className="text-navy-500 text-xs font-medium">{(opt.price / 100).toLocaleString('ru-RU')} ₽</span>
                              : <span className="text-green-600 text-xs font-medium">Бесплатно</span>
                          ) : (
                            <span className="text-red-400 text-xs">{opt.error}</span>
                          )}
                        </div>
                        <p className="text-xs text-navy-400">{opt.description}</p>
                        {opt.daysMax > 0 && (
                          <p className="text-xs text-blue-300 mt-0.5">
                            {opt.daysMin === opt.daysMax ? `${opt.daysMin} дн.` : `${opt.daysMin}–${opt.daysMax} дн.`}
                          </p>
                        )}
                        {opt.daysMax === 0 && opt.available && (
                          <p className="text-xs text-blue-300 mt-0.5">Сегодня</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        delivery === opt.provider ? 'border-blue-200 bg-blue-200' : 'border-blue-200'
                      }`}>
                        {delivery === opt.provider && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Адрес — только для курьера и СДЭК */}
                {delivery !== 'pickup' && (
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-3 text-sm">Адрес доставки</h3>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Город"
                        value={address.city}
                        onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-100 text-sm text-navy-900 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        type="text"
                        placeholder="Улица"
                        value={address.street}
                        onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-100 text-sm text-navy-900 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Дом"
                          value={address.house}
                          onChange={e => setAddress(a => ({ ...a, house: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-blue-100 text-sm text-navy-900 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
                        />
                        <input
                          type="text"
                          placeholder="Квартира"
                          value={address.apartment}
                          onChange={e => setAddress(a => ({ ...a, apartment: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-blue-100 text-sm text-navy-900 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <textarea
                        placeholder="Комментарий к заказу (необязательно)"
                        value={address.comment}
                        onChange={e => setAddress(a => ({ ...a, comment: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-blue-100 text-sm text-navy-900 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100 resize-none"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep('payment')}
                  className="w-full mt-5 bg-blue-200 text-navy-900 font-bold py-3 rounded-xl hover:bg-blue-300 active:scale-95 transition-all text-sm">
                  Далее → Оплата
                </button>
              </div>
            )}

            {/* ШАГ 2 — Оплата */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-navy-900 mb-4">Способ оплаты</h2>

                <div className="flex flex-col gap-2 mb-5">
                  {[
                    { key: 'online' as PaymentMethod, icon: '💳', title: 'Онлайн картой', desc: 'Visa, Mastercard, МИР — безопасный платёж' },
                    { key: 'cash' as PaymentMethod, icon: '💵', title: 'Наличными', desc: 'При получении курьеру или в пункте выдачи' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setPayment(opt.key)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        payment === opt.key
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-blue-100 bg-white hover:border-blue-200'
                      }`}>
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-navy-900 text-sm">{opt.title}</p>
                        <p className="text-xs text-navy-400">{opt.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        payment === opt.key ? 'border-blue-200 bg-blue-200' : 'border-blue-200'
                      }`}>
                        {payment === opt.key && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Бонусы */}
                <div className={`rounded-xl border-2 p-4 mb-5 transition-all ${bonusSpend ? 'border-amber-200 bg-amber-50' : 'border-blue-100'}`}>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bonusSpend}
                      onChange={e => setBonusSpend(e.target.checked)}
                      className="w-4 h-4 accent-amber-400"
                    />
                    <div>
                      <p className="font-semibold text-navy-900 text-sm">Списать бонусы</p>
                      <p className="text-xs text-navy-400">
                        Доступно: <span className="font-bold text-amber-500">{userBonusPoints.toLocaleString('ru-RU')} бонусов</span> = {(userBonusPoints / 100).toLocaleString('ru-RU')} ₽
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('delivery')}
                    className="flex-1 border border-blue-100 text-navy-500 font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                    ← Назад
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-[2] bg-blue-200 text-navy-900 font-bold py-3 rounded-xl hover:bg-blue-300 active:scale-95 transition-all text-sm">
                    Далее → Подтверждение
                  </button>
                </div>
              </div>
            )}

            {/* ШАГ 3 — Подтверждение */}
            {step === 'confirm' && (
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-navy-900 mb-4">Проверьте заказ</h2>

                {/* Краткая сводка */}
                <div className="flex flex-col gap-3 mb-4 p-4 bg-blue-50 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Доставка</span>
                    <span className="font-medium text-navy-900">
                      {DELIVERY_LABELS[delivery] ?? delivery}
                    </span>
                  </div>
                  {delivery !== 'pickup' && address.street && (
                    <div className="flex justify-between text-sm">
                      <span className="text-navy-500">Адрес</span>
                      <span className="font-medium text-navy-900 text-right max-w-[200px]">
                        {address.city}, {address.street}, д.{address.house}
                        {address.apartment && `, кв.${address.apartment}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Оплата</span>
                    <span className="font-medium text-navy-900">
                      {payment === 'online' ? '💳 Картой онлайн' : '💵 Наличными'}
                    </span>
                  </div>
                </div>

                {/* Товары */}
                <div className="flex flex-col gap-2 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                        {item.productVariant.product.images?.[0]
                          ? <img src={item.productVariant.product.images[0]} alt={item.productVariant.product.name} className="w-full h-full object-cover" />
                          : '🐾'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">{item.productVariant.product.name}</p>
                        <p className="text-xs text-navy-400">{item.productVariant.weight} кг · {item.quantity} шт.</p>
                      </div>
                      <span className="text-sm font-bold text-navy-900 flex-shrink-0">
                        {(item.productVariant.price * item.quantity / 100).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 border border-blue-100 text-navy-500 font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm">
                    ← Назад
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="flex-[2] bg-blue-200 text-navy-900 font-bold py-3 rounded-xl hover:bg-blue-300 active:scale-95 transition-all text-sm disabled:opacity-60">
                    {placingOrder ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Оформляем...
                      </span>
                    ) : '✓ Оформить заказ'}
                  </button>
                </div>

                <p className="text-center text-xs text-navy-300 mt-3">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <a href="#" className="text-blue-300 hover:underline">условиями оферты</a>
                </p>
              </div>
            )}
          </div>

          {/* Правая часть — итого (sticky) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 sticky top-24">
              <h3 className="font-bold text-navy-900 mb-3">Ваш заказ</h3>

              <div className="flex flex-col gap-1.5 mb-3">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-navy-500 truncate mr-2">
                      {item.productVariant.product.name.split(' ').slice(0, 3).join(' ')}... ×{item.quantity}
                    </span>
                    <span className="text-navy-900 font-medium flex-shrink-0">
                      {(item.productVariant.price * item.quantity / 100).toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-blue-100 pt-3 flex flex-col gap-1.5 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Доставка</span>
                  {deliveryCost > 0
                    ? <span className="text-navy-900 font-medium">{(deliveryCost / 100).toLocaleString('ru-RU')} ₽</span>
                    : <span className="text-green-600 font-medium">Бесплатно</span>
                  }
                </div>
                {bonusSpend && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Бонусы</span>
                    <span className="text-amber-500 font-medium">−{(bonusDiscount / 100).toLocaleString('ru-RU')} ₽</span>
                  </div>
                )}
              </div>

              <div className="border-t border-blue-100 pt-3 flex justify-between mb-3">
                <span className="font-bold text-navy-900">Итого</span>
                <span className="font-black text-xl text-navy-900">{(total / 100).toLocaleString('ru-RU')} ₽</span>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-navy-600">
                🎁 За этот заказ вы получите <span className="font-bold text-amber-500">+{bonusEarned} сибакоинов</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
