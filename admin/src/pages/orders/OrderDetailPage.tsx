import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ordersApi, type Order } from '../../lib/api'
import { formatPrice } from '../../lib/format'

const STATUSES = [
  { value: 'confirmed',  label: 'Подтверждён' },
  { value: 'in_transit', label: 'В доставке' },
  { value: 'delivered',  label: 'Доставлен' },
  { value: 'cancelled',  label: 'Отменён' },
]

const STATUS_STYLE: Record<string, string> = {
  new:        'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  in_transit: 'bg-purple-100 text-purple-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-600',
}
const STATUS_LABEL: Record<string, string> = {
  new: 'Новый', confirmed: 'Подтверждён', in_transit: 'В доставке',
  delivered: 'Доставлен', cancelled: 'Отменён',
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    ordersApi.byId(id)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false))
  }, [id])

  const handleStatus = async (status: string) => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await ordersApi.updateStatus(order.id, status)
      setOrder(res.data)
    } finally { setUpdating(false) }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-12 text-gray-400">Заказ не найден</div>
  }

  const s = STATUS_LABEL[order.status] ?? order.status

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm mb-5 transition-colors"
      >
        Назад к заказам
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Заказ #{order.id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(order.createdAt).toLocaleString('ru-RU')}
          </p>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {s}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Customer */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Покупатель</h2>
          <p className="text-gray-900 font-medium">{order.user?.name || '—'}</p>
          {order.user?.email && <p className="text-sm text-gray-500">{order.user.email}</p>}
          {order.user?.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Оплата и доставка</h2>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Статус оплаты</span>
            <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
              {order.paymentStatus === 'paid' ? 'Оплачен' : 'Не оплачен'}
            </span>
          </div>
          {order.deliveryMethod && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Доставка</span>
              <span className="text-gray-700">{order.deliveryMethod}</span>
            </div>
          )}
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Товары</span>
            <span className="text-gray-700">{formatPrice(order.subtotal)}</span>
          </div>
          {order.bonusUsed > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Бонусы</span>
              <span className="text-red-500">−{order.bonusUsed} scoins</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100 mt-2">
            <span className="text-gray-900">Итого</span>
            <span className="text-gray-900">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Состав заказа</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {order.items.map(item => (
            <div key={item.id} className="px-5 py-3 flex justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                <p className="text-xs text-gray-500">{item.variantWeight} кг × {item.quantity} шт.</p>
              </div>
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Change status */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Изменить статус</h2>
          <div className="flex flex-wrap gap-2">
            {STATUSES.filter(s => s.value !== order.status).map(s => (
              <button
                key={s.value}
                onClick={() => handleStatus(s.value)}
                disabled={updating}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
                  s.value === 'cancelled'
                    ? 'border-red-200 text-red-600 hover:bg-red-50'
                    : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {updating ? '...' : s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
