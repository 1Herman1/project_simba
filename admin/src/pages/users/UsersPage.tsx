import { useEffect, useState } from 'react'
import { usersApi, type User } from '../../lib/api'

const ROLES = ['customer', 'products_manager', 'orders_manager', 'super_admin']
const ROLE_LABEL: Record<string, string> = {
  customer: 'Покупатель',
  products_manager: 'Менеджер товаров',
  orders_manager: 'Менеджер заказов',
  super_admin: 'Супер-админ',
}
const ROLE_STYLE: Record<string, string> = {
  customer: 'bg-gray-100 text-gray-600',
  products_manager: 'bg-blue-100 text-blue-700',
  orders_manager: 'bg-purple-100 text-purple-700',
  super_admin: 'bg-red-100 text-red-700',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = (p = page, s = search) => {
    setLoading(true)
    const params: Record<string, unknown> = { page: p, limit: 20 }
    if (s) params.search = s
    usersApi.list(params)
      .then(r => { setUsers(r.data.items); setTotal(r.data.total) })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1, search) }, 300)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => { load(page, search) }, [page])

  const handleRoleChange = async (userId: string, role: string) => {
    setUpdatingId(userId)
    try {
      await usersApi.updateRole(userId, role)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u))
    } finally { setUpdatingId(null) }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Пользователи <span className="text-gray-400 font-normal text-base">({total})</span></h1>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по имени, email, телефону..."
          className="w-full max-w-sm px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs border-b border-gray-100 bg-gray-50">
                  <th className="px-5 py-3 font-medium">Пользователь</th>
                  <th className="px-5 py-3 font-medium">Контакт</th>
                  <th className="px-5 py-3 font-medium">Заказов</th>
                  <th className="px-5 py-3 font-medium">Бонусы</th>
                  <th className="px-5 py-3 font-medium">Роль</th>
                  <th className="px-5 py-3 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{user.name || '—'}</p>
                      <p className="text-xs text-gray-400 font-mono">{user.id.slice(-8)}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      <p>{user.email || '—'}</p>
                      <p className="text-xs text-gray-400">{user.phone || ''}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{user._count?.orders ?? 0}</td>
                    <td className="px-5 py-3">
                      <span className="text-amber-600 font-medium">{user.bonusPoints}</span>
                      <span className="text-xs text-gray-400 ml-1">({user.bonusLevel})</span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        disabled={updatingId === user.id}
                        className={`text-xs px-2 py-1 rounded-lg font-medium border-0 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer ${ROLE_STYLE[user.role] ?? 'bg-gray-100 text-gray-600'}`}
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      {search ? 'Ничего не найдено' : 'Пользователей пока нет'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Показано {users.length} из {total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40">←</button>
              <span className="px-3 py-1.5 text-sm text-gray-700">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-40">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
