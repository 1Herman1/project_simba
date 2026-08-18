import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { calcOrderTotals } from '@simba/shared'
import { useCart } from '../../context/CartContext'
import { cartApi, type CartItem } from '../../lib/api'
import { formatPrice, formatBonuses, pluralize } from '../../lib/format'
import { PawIcon } from '../icons'
import SideDrawer from './SideDrawer'

const FREE_DELIVERY_THRESHOLD = 200000

type Props = {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const { updateItem: updateItemFromCart, removeItem: removeItemFromCart } = useCart()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)

  // Загружаем корзину при открытии шторки
  useEffect(() => {
    if (!open) return
    const loadCart = async () => {
      setLoading(true)
      try {
        const res = await cartApi.get()
        setItems(res.data.items)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    loadCart()
  }, [open])

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQty = Math.max(1, Math.min(item.productVariant.stock, item.quantity + delta))
    if (newQty === item.quantity) return
    try {
      const res = await updateItemFromCart(item.id, newQty)
      setItems(res.data.items)
    } catch { /* ignore */ }
  }

  const removeItem = async (itemId: string) => {
    setRemovingId(itemId)
    setTimeout(async () => {
      try {
        const res = await removeItemFromCart(itemId)
        setItems(res.data.items)
      } catch {
        setItems(prev => prev.filter(i => i.id !== itemId))
      }
      setRemovingId(null)
    }, 300)
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.productVariant.price * item.quantity, 0),
    [items]
  )

  const discount = useMemo(
    () =>
      items.reduce((sum, item) =>
        item.productVariant.oldPrice
          ? sum + (item.productVariant.oldPrice - item.productVariant.price) * item.quantity
          : sum,
        0
      ),
    [items]
  )

  const totals = calcOrderTotals({
    items: items.map(item => ({
      price: item.productVariant.price,
      quantity: item.quantity,
    })),
    promoCode: promoApplied ? 'SIMBA10' : undefined,
    availableBonus: 0,
  })
  const promoDiscount = totals.promoDiscount
  const total = totals.total

  const toFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal)
  const deliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)
  const bonusEarned = totals.bonusEarned

  const handlePromo = () => {
    if (promoCode.toLowerCase() === 'simba10') {
      setPromoApplied(true)
      sessionStorage.setItem('promoCode', promoCode.toUpperCase())
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  // Контент шторки
  let content: React.ReactNode

  if (loading) {
    content = (
      <div className="px-4 py-4 flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 py-4 animate-pulse">
            <div className="w-16 h-16 bg-blue-50 rounded-lg flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 bg-blue-50 rounded w-3/4" />
              <div className="h-3 bg-blue-50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  } else if (items.length === 0) {
    content = (
      <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
        <PawIcon className="w-12 h-12 text-navy-200" />
        <p className="text-center">
          <span className="block font-bold text-navy-900 mb-1">В корзине пока пусто</span>
          <span className="block text-sm text-navy-500">Добавьте товары из каталога</span>
        </p>
        <Link
          to="/catalog"
          onClick={onClose}
          className="btn-primary px-6 py-2 rounded-xl font-bold text-sm"
        >
          Перейти в каталог
        </Link>
      </div>
    )
  } else {
    content = (
      <>
        {/* Полоса до бесплатной доставки */}
        <div className="px-4 py-3 border-b border-line">
          {toFreeDelivery > 0 ? (
            <>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-navy-700 font-medium">
                  До бесплатной доставки: <span className="text-blue-300 font-bold">{formatPrice(toFreeDelivery)}</span>
                </span>
                <span className="text-navy-400 text-xs">от {formatPrice(FREE_DELIVERY_THRESHOLD)}</span>
              </div>
              <div className="h-2 bg-blue-50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-200 rounded-full origin-left transition-transform duration-300"
                  style={{ transform: `scaleX(${deliveryProgress / 100})` }}
                />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-2 bg-green-100 rounded-full flex-1 overflow-hidden">
                <div className="h-full bg-green-400 rounded-full w-full" />
              </div>
              <span className="text-green-600 text-sm font-semibold whitespace-nowrap">Доставка бесплатна!</span>
            </div>
          )}
        </div>

        {/* Список товаров */}
        <ul className="px-4 divide-y divide-line">
          {items.map(item => {
            const v = item.productVariant
            const p = v.product
            return (
              <li
                key={item.id}
                className={`flex gap-3 py-4 transition-opacity duration-200 ease-smooth ${
                  removingId === item.id ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <Link
                  to={`/product/${p.slug}`}
                  onClick={onClose}
                  className="flex-shrink-0 w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden"
                >
                  {p.images[0] ? (
                    <img src={p.images[0]} className="max-h-full max-w-full object-contain p-1" alt={p.name} />
                  ) : (
                    <PawIcon className="w-8 h-8 text-navy-200" />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${p.slug}`}
                    onClick={onClose}
                    className="block text-sm font-semibold text-navy-900 leading-snug line-clamp-2 hover:text-primary-hover"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-navy-500">{v.weight} кг</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    {/* Степпер */}
                    <div className="inline-flex items-center rounded-xl border border-line">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        aria-label="Уменьшить количество"
                        className="btn-press w-11 h-11 flex items-center justify-center text-navy-500 hover:bg-blue-50 font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-navy-900 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        disabled={item.quantity >= v.stock}
                        aria-label="Увеличить количество"
                        className="btn-press w-11 h-11 flex items-center justify-center text-navy-500 hover:bg-blue-50 font-bold disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>

                    {/* Цена */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-navy-900 tabular-nums">
                        {formatPrice(v.price * item.quantity)}
                      </span>
                      {v.oldPrice && (
                        <span className="text-xs text-navy-300 line-through tabular-nums">
                          {formatPrice(v.oldPrice * item.quantity)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Удалить товар из корзины"
                  onClick={() => removeItem(item.id)}
                  className="btn-press flex-shrink-0 w-11 h-11 flex items-center justify-center text-navy-300 hover:text-destructive"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Ссылка "Продолжить покупки" */}
        <div className="px-4 py-3">
          <Link
            to="/catalog"
            onClick={onClose}
            className="flex items-center gap-2 text-navy-700 hover:text-primary-hover transition-colors text-sm font-medium w-fit"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Продолжить покупки
          </Link>
        </div>

        {/* Промокод и бонусы */}
        <div className="px-4 pb-4 flex flex-col gap-3">
          {!promoApplied ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Промокод"
                aria-label="Промокод"
                className="flex-1 px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:border-line focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handlePromo}
                type="button"
                className="btn-press px-4 min-h-[2.75rem] bg-blue-100 text-navy-700 rounded-xl text-sm font-medium hover:bg-blue-200 flex items-center justify-center"
              >
                Применить
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="text-green-600 text-sm font-medium">Промокод применён</span>
              <button
                onClick={() => {
                  setPromoApplied(false)
                  setPromoCode('')
                  sessionStorage.removeItem('promoCode')
                }}
                className="ml-auto text-navy-300 hover:text-navy-500 text-xs"
              >
                Отменить
              </button>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-100 rounded-card px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-navy-900">
                За этот заказ вы получите <span className="text-amber-500">+{formatBonuses(bonusEarned)}</span>
              </p>
            </div>
            <p className="text-xs text-navy-400 mb-2">1 бонус = 1 ₽ скидки на следующий заказ</p>
            <div className="flex gap-2 text-xs">
              <span className="bg-white border border-amber-200 text-navy-600 px-2 py-0.5 rounded-full">Новичок: 0–999</span>
              <span className="bg-white border border-amber-200 text-navy-600 px-2 py-0.5 rounded-full">Активный: 1000+</span>
              <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-medium">Премиум: 5000+</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Футер
  const footerContent =
    !loading && items.length > 0 ? (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-navy-500">Товары ({itemCount} шт.)</span>
            <span className="text-navy-900">{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-navy-500">Скидка</span>
              <span className="text-green-600">−{formatPrice(discount)}</span>
            </div>
          )}
          {promoApplied && (
            <div className="flex justify-between">
              <span className="text-navy-500">Промокод SIMBA10</span>
              <span className="text-green-600">−{formatPrice(promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-navy-500">Доставка</span>
            <span className="text-green-600">Бесплатно</span>
          </div>
        </div>

        <div className="border-t border-line pt-3 mb-2">
          <div className="flex justify-between">
            <span className="font-bold text-navy-900">К оплате</span>
            <span className="font-black text-xl text-navy-900 tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>

        <Link
          to="/checkout"
          onClick={onClose}
          className="btn-primary press-wide w-full rounded-xl font-bold py-3.5 text-center block"
        >
          Оформить заказ
        </Link>

        <p className="text-center text-xs text-navy-400">
          Нажимая кнопку, вы соглашаетесь с условиями оферты
        </p>
      </div>
    ) : null

  return (
    <SideDrawer open={open} onClose={onClose} title="Корзина" footer={footerContent}>
      {content}
    </SideDrawer>
  )
}
