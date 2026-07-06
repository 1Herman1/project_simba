import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi, ordersApi, type User, type Order } from '../lib/api'

type OrderStatus = 'new' | 'confirmed' | 'in_transit' | 'delivered' | 'cancelled'

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  in_transit: 'В пути',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const STATUS_COLOR: Record<OrderStatus, string> = {
  new: 'bg-blue-100 text-blue-400',
  confirmed: 'bg-amber-100 text-amber-600',
  in_transit: 'bg-purple-100 text-purple-600',
  delivered: 'bg-green-100 text-green-600',
  cancelled: 'bg-red-100 text-red-500',
}

const STATUS_STEPS: OrderStatus[] = ['new', 'confirmed', 'in_transit', 'delivered']


const BONUS_LEVELS = [
  { key: 'newcomer', label: 'Новичок', min: 0, max: 999, color: 'bg-navy-100 text-navy-500' },
  { key: 'active', label: 'Активный', min: 1000, max: 4999, color: 'bg-blue-100 text-blue-400' },
  { key: 'premium', label: 'Премиум', min: 5000, max: Infinity, color: 'bg-amber-100 text-amber-600' },
]


type Tab = 'orders' | 'bonuses' | 'settings'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('orders')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all')
  const [user, setUser] = useState<User | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingUser, setLoadingUser] = useState(true)

  useEffect(() => {
    authApi.me()
      .then(res => setUser(res.data))
      .catch(() => navigate('/auth'))
      .finally(() => setLoadingUser(false))
    ordersApi.list()
      .then(res => setOrders(res.data))
      .catch(() => setOrders([]))
  }, [])

  const currentLevel = BONUS_LEVELS.find(l => (user?.bonusLevel ?? 'newcomer') === l.key) ?? BONUS_LEVELS[0]
  const nextLevel = BONUS_LEVELS.find(l => l.min > currentLevel.min)
  const bonusPoints = user?.bonusPoints ?? 0
  const progressToNext = nextLevel
    ? Math.min(100, ((bonusPoints - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100)
    : 100

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Шапка профиля */}
        <div className="bg-white rounded-2xl p-5 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
            🐾
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-navy-900 truncate">{user?.name ?? '—'}</h1>
            <p className="text-sm text-navy-400 truncate">{user?.phone ?? user?.email ?? '—'}</p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${currentLevel.color}`}>
            {currentLevel.label}
          </span>
        </div>

        {/* Табы */}
        <div className="flex bg-white rounded-2xl p-1 mb-4 gap-1">
          {([
            { key: 'orders', label: 'Заказы', icon: '📦' },
            { key: 'bonuses', label: 'Сибакоины', icon: '🐾' },
            { key: 'settings', label: 'Настройки', icon: '⚙️' },
          ] as { key: Tab; label: string; icon: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-blue-200 text-navy-900 shadow-sm'
                  : 'text-navy-400 hover:text-navy-700'
              }`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── ЗАКАЗЫ ── */}
        {tab === 'orders' && (
          <div>
            {/* Фильтр по статусу */}
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
              {([
                { value: 'all', label: 'Все' },
                { value: 'in_transit', label: 'В пути' },
                { value: 'delivered', label: 'Доставлены' },
                { value: 'new', label: 'Новые' },
                { value: 'cancelled', label: 'Отменены' },
              ] as { value: OrderStatus | 'all'; label: string }[]).map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                    filterStatus === f.value
                      ? 'bg-blue-200 text-navy-900'
                      : 'bg-white text-navy-500 hover:bg-blue-50'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center">
                <div className="text-5xl mb-3">📦</div>
                <p className="text-navy-400">Заказов не найдено</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {filteredOrders.map(order => {
                const isExpanded = expandedOrder === order.id
                const stepIndex = STATUS_STEPS.indexOf(order.status)
                const dateStr = new Date(order.createdAt).toLocaleDateString('ru-RU')

                return (
                  <div key={order.id} className="bg-white rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="w-full px-5 py-4 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-navy-900 text-sm">#{order.id.slice(-6).toUpperCase()}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                            {STATUS_LABEL[order.status]}
                          </span>
                        </div>
                        <p className="text-xs text-navy-400">{dateStr} · {order.deliveryMethod}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-navy-900">{(order.total / 100).toLocaleString('ru-RU')} ₽</p>
                        {order.bonusEarned > 0 && (
                          <p className="text-xs text-amber-500">+{order.bonusEarned} сибакоинов</p>
                        )}
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`text-navy-300 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {/* Раскрытый блок */}
                    {isExpanded && (
                      <div className="border-t border-blue-50 px-5 py-4">

                        {/* Прогресс доставки */}
                        {order.status !== 'cancelled' && (
                          <div className="mb-5">
                            <div className="relative flex items-center justify-between mb-2">
                              {STATUS_STEPS.map((s, i) => (
                                <div key={s} className="flex flex-col items-center flex-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                                    i <= stepIndex
                                      ? 'bg-blue-200 text-navy-900'
                                      : 'bg-blue-50 text-navy-300'
                                  }`}>
                                    {i < stepIndex ? '✓' : i === stepIndex ? '●' : '○'}
                                  </div>
                                  <span className="text-[10px] text-navy-400 mt-1 text-center leading-tight">
                                    {STATUS_LABEL[s]}
                                  </span>
                                </div>
                              ))}
                              {/* Линии между шагами */}
                              <div className="absolute top-3.5 left-0 right-0 flex px-3.5">
                                {STATUS_STEPS.slice(0, -1).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-blue-200' : 'bg-blue-100'}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Товары */}
                        <div className="flex flex-col gap-2 mb-4">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                                🐾
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-navy-900 font-medium truncate">{item.productName}</p>
                                <p className="text-xs text-navy-400">{item.variantWeight} кг · {item.quantity} шт.</p>
                              </div>
                              <span className="text-sm font-semibold text-navy-900 flex-shrink-0">
                                {(item.price * item.quantity / 100).toLocaleString('ru-RU')} ₽
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Кнопки */}
                        <div className="flex gap-2 flex-wrap">
                          {order.status === 'delivered' && (
                            <button className="flex-1 bg-blue-200 text-navy-900 font-medium py-2 rounded-xl text-sm hover:bg-blue-300 transition-colors">
                              Повторить заказ
                            </button>
                          )}
                          <button className="flex-1 border border-blue-100 text-navy-500 font-medium py-2 rounded-xl text-sm hover:bg-blue-50 transition-colors">
                            Детали заказа
                          </button>
                          {(order.status === 'new' || order.status === 'confirmed') && (
                            <button className="flex-1 border border-red-100 text-red-400 font-medium py-2 rounded-xl text-sm hover:bg-red-50 transition-colors">
                              Отменить
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── СИБАКОИНЫ ── */}
        {tab === 'bonuses' && (
          <div className="flex flex-col gap-4">
            {/* Баланс */}
            <div className="bg-white rounded-2xl p-6 text-center">
              <p className="text-sm text-navy-400 mb-1">Ваш счёт сибакоинов</p>
              <p className="text-5xl font-black text-amber-400 mb-1">{bonusPoints.toLocaleString()}</p>
              <p className="text-sm text-navy-400">сибакоинов · 1 сибакоин = 1 ₽</p>
            </div>

            {/* Уровень */}
            <div className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-navy-900">Уровень</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentLevel.color}`}>
                  {currentLevel.label}
                </span>
              </div>
              {nextLevel && (
                <>
                  <div className="h-2 bg-blue-50 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                  <p className="text-xs text-navy-400">
                    До уровня <span className="font-semibold text-navy-700">«{nextLevel.label}»</span>:{' '}
                    {Math.max(0, nextLevel.min - bonusPoints)} сибакоинов
                  </p>
                </>
              )}

              <div className="grid grid-cols-3 gap-2 mt-4">
                {BONUS_LEVELS.map(level => (
                  <div
                    key={level.key}
                    className={`rounded-xl p-3 text-center border ${
                      user?.bonusLevel === level.key
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-blue-100 bg-blue-50'
                    }`}>
                    <p className={`text-xs font-bold mb-1 ${user?.bonusLevel === level.key ? 'text-amber-600' : 'text-navy-400'}`}>
                      {level.label}
                    </p>
                    <p className="text-[10px] text-navy-400">
                      {level.max === Infinity ? `от ${level.min}` : `${level.min}–${level.max}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* История начислений */}
            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-bold text-navy-900 mb-3">История начисления сибакоинов</h3>
              <div className="divide-y divide-blue-50">
                {orders.filter(o => o.bonusEarned > 0).map(order => (
                  <div key={order.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm text-navy-900 font-medium">#{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-navy-400">{new Date(order.createdAt).toLocaleDateString('ru-RU')}</p>
                    </div>
                    <span className="text-amber-500 font-bold">+{order.bonusEarned}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── НАСТРОЙКИ ── */}
        {tab === 'settings' && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-bold text-navy-900 mb-4">Личные данные</h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Имя', value: user?.name ?? '' },
                  { label: 'Телефон', value: user?.phone ?? '' },
                  { label: 'Email', value: user?.email ?? '' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="text-xs text-navy-400 block mb-1">{field.label}</label>
                    <input
                      type="text"
                      defaultValue={field.value}
                      className="w-full px-4 py-2.5 rounded-xl border border-blue-100 text-sm text-navy-900 focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                ))}
                <button className="bg-blue-200 text-navy-900 font-bold py-2.5 rounded-xl text-sm hover:bg-blue-300 transition-colors mt-1">
                  Сохранить
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-bold text-navy-900 mb-3">Уведомления</h3>
              {[
                { label: 'SMS о статусе заказа', defaultChecked: true },
                { label: 'Email-рассылка об акциях', defaultChecked: false },
              ].map(item => (
                <label key={item.label} className="flex items-center justify-between py-2.5 cursor-pointer">
                  <span className="text-sm text-navy-700">{item.label}</span>
                  <input type="checkbox" defaultChecked={item.defaultChecked}
                    className="w-4 h-4 accent-blue-300" />
                </label>
              ))}
            </div>

            <button
              onClick={() => { localStorage.removeItem('token'); navigate('/auth') }}
              className="bg-white text-red-400 font-medium py-3.5 rounded-2xl text-sm hover:bg-red-50 transition-colors border border-red-100">
              Выйти из аккаунта
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
