import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { calcOrderTotals } from '@simba/shared'
import { useCart } from '../context/CartContext'
import { cartApi, authApi, ordersApi, type CartItem } from '../lib/api'
import { formatPrice, formatBonuses } from '../lib/format'
import { CheckIcon } from '../components/icons'

type DeliveryMethod = 'simba_courier' | 'pickup' | 'cdek' | 'yandex' | 'post' | 'ozon' | 'dostavista'
type PaymentMethod = 'card' | 'cash_on_delivery'
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
  simba_courier: '',
  yandex: '',
  cdek: '',
  ozon: '',
  dostavista: '',
  post: '',
  pickup: '',
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
  const { clear: clearCart } = useCart()
  const isLoggedIn = !!localStorage.getItem('token')
  const [step, setStep] = useState<Step>('delivery')
  const [delivery, setDelivery] = useState<DeliveryMethod>('simba_courier')
  const [payment, setPayment] = useState<PaymentMethod>('card')
  const [bonusSpend, setBonusSpend] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [orderPayment, setOrderPayment] = useState<PaymentMethod>('card')
  const [orderBonusEarned, setOrderBonusEarned] = useState(0)
  const [orderTotal, setOrderTotal] = useState(0)
  const [orderBonusUsed, setOrderBonusUsed] = useState(0)
  const [quotes, setQuotes] = useState<DeliveryQuote[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)

  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(true)
  const [userBonusPoints, setUserBonusPoints] = useState(0)
  const [orderError, setOrderError] = useState<string | null>(null)

  const [address, setAddress] = useState({
    city: 'Москва',
    street: '',
    house: '',
    apartment: '',
    comment: '',
    postalCode: '',
  })

  // Если доставка не курьером, отключить наличные
  const isCourierDelivery = delivery === 'simba_courier'
  useEffect(() => {
    if (!isCourierDelivery && payment === 'cash_on_delivery') {
      setPayment('card')
    }
  }, [delivery])

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

  const selectedQuote = quotes.find(q => q.provider === delivery)
  const deliveryCost = selectedQuote?.price ?? 0
  const promoCode = sessionStorage.getItem('promoCode') ?? undefined

  const totals = calcOrderTotals({
    items: cartItems.map(i => ({ price: i.productVariant.price, quantity: i.quantity })),
    promoCode,
    bonusRequested: bonusSpend ? userBonusPoints : 0,
    availableBonus: userBonusPoints,
    deliveryCost,
  })

  const subtotal = totals.subtotal
  const promoDiscount = totals.promoDiscount
  const bonusUsedScoins = totals.bonusUsed
  const bonusDiscount = bonusUsedScoins * 100
  const total = totals.total
  const bonusEarned = totals.bonusEarned

  const stepIndex = STEPS.findIndex(s => s.key === step)

  const handlePlaceOrder = async () => {
    setPlacingOrder(true)
    setOrderError(null)
    try {
      const promoCode = sessionStorage.getItem('promoCode') ?? undefined
      const cartRes = await cartApi.get()
      const createOrderPayload: Parameters<typeof ordersApi.create>[0] = {
        cartId: cartRes.data.id,
        deliveryMethod: delivery === 'simba_courier' ? 'cdek' : delivery,
        deliveryAddress: delivery !== 'pickup' && address.street
          ? { city: address.city, street: address.street, house: address.house, apartment: address.apartment || undefined, postalCode: address.postalCode }
          : undefined,
        comment: address.comment || undefined,
        bonusUsed: bonusUsedScoins,
        promoCode,
        deliveryCost,
        paymentMethod: payment,
      }

      // Для гостя добавить контактные данные
      if (!isLoggedIn && (contactName || contactEmail || contactPhone)) {
        createOrderPayload.contact = {
          name: contactName || undefined,
          email: contactEmail || undefined,
          phone: contactPhone || undefined,
        }
      }

      const res = await ordersApi.create(createOrderPayload)
      setOrderId(res.data.id)
      setOrderPayment(payment)
      setOrderBonusEarned(res.data.bonusEarned)
      setOrderTotal(res.data.total)
      setOrderBonusUsed(res.data.bonusUsed)
      setOrderPlaced(true)
      await clearCart()
      sessionStorage.removeItem('promoCode')
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Не удалось оформить заказ. Попробуйте ещё раз.'
      setOrderError(message)
    } finally {
      setPlacingOrder(false)
    }
  }

  if (cartLoading) {
    return (
      <div className="min-h-[100dvh] bg-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[100dvh] bg-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1E7B4D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          </div>
          <h1 className="text-2xl font-black text-navy-900 mb-2">Заказ оформлен!</h1>
          <p className="text-navy-500 text-sm mb-1">Номер заказа:</p>
          <p className="font-bold text-navy-900 text-lg mb-4">{orderId ? orderId.slice(-6).toUpperCase() : '—'}</p>
          <div className="border border-line rounded-xl p-3 mb-3 text-left">
            <div className="flex justify-between text-sm">
              <span className="text-navy-500">Сумма заказа</span>
              <span className="font-bold text-navy-900 tabular-nums">{formatPrice(orderTotal)}</span>
            </div>
            {orderBonusUsed > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-navy-500">Списано бонусов</span>
                <span className="font-medium text-amber-600 tabular-nums">−{formatBonuses(orderBonusUsed)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mt-1">
              <span className="text-navy-500">Оплата</span>
              <span className="font-medium text-navy-900">
                {orderPayment === 'card' ? 'Картой' : 'Наличными курьеру при получении'}
              </span>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6">
            <p className="text-sm text-navy-700">
              Начислено <span className="font-bold text-amber-600">+{formatBonuses(orderBonusEarned)}</span> на ваш счёт
            </p>
          </div>
          <p className="text-xs text-navy-500 mb-6">
            Отправим письмо, когда заказ будет подтверждён
          </p>
          <div className="flex flex-col gap-2">
            {!isLoggedIn ? (
              <>
                <Link to={`/auth?email=${encodeURIComponent(contactEmail)}`}
                  className="block btn-primary font-bold py-3 rounded-xl text-sm">
                  Войти по {contactEmail} и получить 300 бонусов
                </Link>
                <Link to="/"
                  className="block border border-line text-navy-500 font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors duration-100 ease text-sm">
                  На главную
                </Link>
              </>
            ) : (
              <>
                <Link to="/profile"
                  className="block btn-primary font-bold py-3 rounded-xl text-sm">
                  Мои заказы
                </Link>
                <Link to="/"
                  className="block border border-line text-navy-500 font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors duration-100 ease text-sm">
                  На главную
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-blue-50 pb-6">
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
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-100 ease ${
                  i < stepIndex ? 'bg-primary text-white' :
                  i === stepIndex ? 'bg-primary text-white' :
                  'bg-primary-tint text-navy-500'
                }`}>
                  {i < stepIndex ? <CheckIcon className="w-4 h-4" /> : i + 1}
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
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-[border-color,background-color] text-left ${
                        !opt.available ? 'border-line bg-blue-50 opacity-50 cursor-not-allowed' :
                        delivery === opt.provider
                          ? 'border-primary-soft bg-primary-tint'
                          : 'border-line bg-white hover:border-primary-soft'
                      }`}>
                      {PROVIDER_ICONS[opt.provider] ? <span className="text-2xl">{PROVIDER_ICONS[opt.provider]}</span> : null}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-navy-900 text-sm">{opt.title}</span>
                          {opt.available ? (
                            opt.price > 0
                              ? <span className="text-navy-500 text-xs font-medium">{formatPrice(opt.price)}</span>
                              : <span className="text-green-600 text-xs font-medium">Бесплатно</span>
                          ) : (
                            <span className="text-red-400 text-xs">{opt.error}</span>
                          )}
                        </div>
                        <p className="text-xs text-navy-500">{opt.description}</p>
                        {opt.daysMax > 0 && (
                          <p className="text-xs text-primary-hover mt-0.5">
                            {opt.daysMin === opt.daysMax ? `${opt.daysMin} дн.` : `${opt.daysMin}–${opt.daysMax} дн.`}
                          </p>
                        )}
                        {opt.daysMax === 0 && opt.available && (
                          <p className="text-xs text-primary-hover mt-0.5">Сегодня</p>
                        )}
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        delivery === opt.provider ? 'border-primary-soft bg-primary-soft' : 'border-line'
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
                        aria-label="Город"
                        value={address.city}
                        onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        type="text"
                        placeholder="Улица"
                        aria-label="Улица"
                        value={address.street}
                        onChange={e => setAddress(a => ({ ...a, street: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Дом"
                          aria-label="Дом"
                          value={address.house}
                          onChange={e => setAddress(a => ({ ...a, house: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                        />
                        <input
                          type="text"
                          placeholder="Квартира"
                          aria-label="Квартира"
                          value={address.apartment}
                          onChange={e => setAddress(a => ({ ...a, apartment: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Почтовый индекс"
                        aria-label="Почтовый индекс"
                        value={address.postalCode}
                        onChange={e => setAddress(a => ({ ...a, postalCode: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                      />
                      <textarea
                        placeholder="Комментарий к заказу (необязательно)"
                        aria-label="Комментарий к заказу"
                        value={address.comment}
                        onChange={e => setAddress(a => ({ ...a, comment: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Контактные данные для гостя */}
                {!isLoggedIn && (
                  <div className="mt-5">
                    <h3 className="font-semibold text-navy-900 mb-3 text-sm">Контактные данные</h3>
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        placeholder="Имя"
                        aria-label="Имя"
                        value={contactName}
                        onChange={e => setContactName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        aria-label="Email"
                        value={contactEmail}
                        onChange={e => setContactEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                      />
                      <input
                        type="tel"
                        placeholder="Телефон"
                        aria-label="Телефон"
                        value={contactPhone}
                        onChange={e => setContactPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-line text-sm text-navy-900 focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep('payment')}
                  className="w-full mt-5 btn-primary font-bold py-3 rounded-xl text-sm">
                  Далее: Оплата
                </button>
              </div>
            )}

            {/* ШАГ 2 — Оплата */}
            {step === 'payment' && (
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-navy-900 mb-4">Способ оплаты</h2>

                <div className="flex flex-col gap-2 mb-5">
                  {[
                    { key: 'card' as PaymentMethod, title: 'Картой онлайн', desc: 'Visa, Mastercard, МИР — безопасный платёж' },
                    { key: 'cash_on_delivery' as PaymentMethod, title: 'Наличными курьеру', desc: 'Только при доставке курьером до двери' },
                  ].map(opt => {
                    const isDisabled = opt.key === 'cash_on_delivery' && !isCourierDelivery
                    return (
                      <button
                        key={opt.key}
                        onClick={() => !isDisabled && setPayment(opt.key)}
                        disabled={isDisabled}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-[border-color,background-color] text-left ${
                          isDisabled
                            ? 'border-line bg-blue-50 opacity-60 cursor-not-allowed'
                            : payment === opt.key
                              ? 'border-primary-soft bg-primary-tint'
                              : 'border-line bg-white hover:border-primary-soft'
                        }`}>
                        <div className="flex-1">
                          <p className="font-semibold text-navy-900 text-sm">{opt.title}</p>
                          {isDisabled ? (
                            <p className="text-xs text-navy-500">Доступно только при доставке курьером до двери</p>
                          ) : (
                            <p className="text-xs text-navy-500">{opt.desc}</p>
                          )}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          payment === opt.key ? 'border-primary-soft bg-primary-soft' : 'border-line'
                        }`}>
                          {payment === opt.key && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Бонусы — только для авторизованных */}
                {isLoggedIn && (() => {
                  // Расчитаем максимально доступно в этом заказе
                  const totalsWithMaxBonus = calcOrderTotals({
                    items: cartItems.map(i => ({ price: i.productVariant.price, quantity: i.quantity })),
                    promoCode,
                    bonusRequested: userBonusPoints,
                    availableBonus: userBonusPoints,
                    deliveryCost,
                  })
                  const maxAvailableBonus = totalsWithMaxBonus.bonusUsed

                  const canUseBonus = maxAvailableBonus > 0
                  const actualBonusUsed = bonusSpend ? maxAvailableBonus : 0
                  const isBonusLimited = bonusSpend && maxAvailableBonus < userBonusPoints

                  return (
                    <div className={`rounded-xl border p-4 mb-5 transition-[border-color,background-color] duration-100 ease ${
                      bonusSpend && canUseBonus ? 'border-amber-200 bg-amber-50' :
                      bonusSpend && !canUseBonus ? 'border-line bg-blue-50 opacity-60' :
                      'border-line'
                    }`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bonusSpend && canUseBonus}
                          onChange={e => setBonusSpend(canUseBonus && e.target.checked)}
                          disabled={!canUseBonus}
                          className={`w-4 h-4 accent-amber-400 ${!canUseBonus ? 'cursor-not-allowed' : ''}`}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-navy-900 text-sm">Списать бонусы</p>
                          {canUseBonus ? (
                            <div className="text-xs text-navy-500">
                              {bonusSpend ? (
                                <>
                                  <p>
                                    Спишем <span className="font-bold text-amber-600">{formatBonuses(actualBonusUsed)}</span> = {actualBonusUsed.toLocaleString('ru-RU')} ₽
                                    {userBonusPoints > 0 && ` из ${userBonusPoints.toLocaleString('ru-RU')}`}
                                  </p>
                                  {isBonusLimited && (
                                    <p className="text-navy-500 mt-1">Бонусами можно оплатить до половины заказа</p>
                                  )}
                                </>
                              ) : (
                                <p>
                                  Доступно к списанию: <span className="font-bold text-amber-600">{formatBonuses(maxAvailableBonus)}</span> = {maxAvailableBonus.toLocaleString('ru-RU')} ₽
                                  {userBonusPoints > 0 && ` из ${userBonusPoints.toLocaleString('ru-RU')}`}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-navy-500">Сумма заказа слишком мала для списания</p>
                          )}
                        </div>
                      </label>
                    </div>
                  )
                })()}

                {/* Сообщение для гостей */}
                {!isLoggedIn && (
                  <div className="rounded-xl border border-line bg-blue-50 p-4 mb-5">
                    <p className="text-sm text-navy-700">
                      Войдите, чтобы списать бонусы
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('delivery')}
                    className="flex-1 border border-line text-navy-500 font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors duration-100 ease text-sm">
                    Назад
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-[2] btn-primary font-bold py-3 rounded-xl text-sm">
                    Далее: Подтверждение
                  </button>
                </div>
              </div>
            )}

            {/* ШАГ 3 — Подтверждение */}
            {step === 'confirm' && (
              <div className="bg-white rounded-2xl p-5">
                <h2 className="font-bold text-navy-900 mb-4">Проверьте заказ</h2>

                {/* Краткая сводка */}
                <div className="flex flex-col gap-3 mb-4 p-4 bg-primary-tint rounded-xl">
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
                      {payment === 'card' ? 'Картой онлайн' : 'Наличными курьеру'}
                    </span>
                  </div>
                </div>

                {/* Товары */}
                <div className="flex flex-col gap-2 mb-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {item.productVariant.product.images?.[0] && (
                          <img src={item.productVariant.product.images[0]} alt={item.productVariant.product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-navy-900 truncate">{item.productVariant.product.name}</p>
                        <p className="text-xs text-navy-500">{item.productVariant.weight} кг · {item.quantity} шт.</p>
                      </div>
                      <span className="text-sm font-bold text-navy-900 flex-shrink-0">
                        {formatPrice(item.productVariant.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 border border-line text-navy-500 font-medium py-3 rounded-xl hover:bg-blue-50 transition-colors duration-100 ease text-sm">
                    Назад
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="flex-[2] btn-primary font-bold py-3 rounded-xl text-sm disabled:opacity-60">
                    {placingOrder ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Оформляем...
                      </span>
                    ) : 'Оформить заказ'}
                  </button>
                </div>

                {orderError && (
                  <p className="text-center text-sm text-red-500 mt-3">{orderError}</p>
                )}
                <p className="text-center text-xs text-navy-300 mt-3">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <Link to="/offer" className="text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">условиями оферты</Link>
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
                      {formatPrice(item.productVariant.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-line pt-3 flex flex-col gap-1.5 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-navy-500">Доставка</span>
                  {deliveryCost > 0
                    ? <span className="text-navy-900 font-medium">{formatPrice(deliveryCost)}</span>
                    : <span className="text-green-600 font-medium">Бесплатно</span>
                  }
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Промокод</span>
                    <span className="text-amber-600 font-medium">−{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                {bonusSpend && (
                  <div className="flex justify-between text-sm">
                    <span className="text-navy-500">Бонусы</span>
                    <span className="text-amber-600 font-medium">−{formatPrice(bonusDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-line pt-3 flex justify-between mb-3">
                <span className="font-bold text-navy-900">Итого</span>
                <span className="font-black text-xl text-navy-900">{formatPrice(total)}</span>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 text-xs text-navy-600">
                За этот заказ вы получите <span className="font-bold text-amber-600">+{formatBonuses(bonusEarned)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
