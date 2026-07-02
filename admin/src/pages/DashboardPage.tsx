import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { dashboardApi, type DashboardStats } from '../lib/api'

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Новый',       color: 'bg-amber-100 text-amber-700' },
  confirmed:  { label: 'Подтверждён', color: 'bg-blue-100 text-blue-700' },
  in_transit: { label: 'Доставка',    color: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Доставлен',   color: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Отменён',     color: 'bg-red-100 text-red-600' },
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.stats()
      .then(r => setStats(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
      </div>
    )
  }

  if (!stats) return <p className="text-gray-500">Не удалось загрузить статистику</p>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Дашборд</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Заказы сегодня"
          value={String(stats.ordersToday)}
          sub={`За месяц: ${stats.ordersMonth}`}
        />
        <StatCard
          label="Выручка сегодня"
          value={`${(stats.revenueToday / 100).toLocaleString('ru-RU')} ₽`}
          sub={`За месяц: ${(stats.revenueMonth / 100).toLocaleString('ru-RU')} ₽`}
        />
        <StatCard
          label="Всего пользователей"
          value={String(stats.totalUsers)}
          sub={`Новых сегодня: ${stats.newUsersToday}`}
        />
        <StatCard
          label="Товаров в каталоге"
          value={String(stats.totalProducts)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Последние заказы</h2>
          <Link to="/orders" className="text-sm text-blue-600 hover:underline">Все заказы</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Заказ</th>
                <th className="px-5 py-3 font-medium">Покупатель</th>
                <th className="px-5 py-3 font-medium">Сумма</th>
                <th className="px-5 py-3 font-medium">Статус</th>
                <th className="px-5 py-3 font-medium">Дата</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(order => {
                const s = STATUS_LABEL[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <Link to={`/orders/${order.id}`} className="font-mono text-blue-600 hover:underline text-xs">
                        #{order.id.slice(-6).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {order.user?.name || order.user?.email || order.user?.phone || '—'}
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {(order.total / 100).toLocaleString('ru-RU')} ₽
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                )
              })}
              {stats.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">Заказов пока нет</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
