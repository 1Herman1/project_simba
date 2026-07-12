import { Link } from 'react-router-dom'

const LEVELS = [
  {
    key: 'newcomer',
    label: 'Новичок',
    range: '0 — 999 сибакоинов',
    color: 'bg-blue-50 border-blue-100',
    badge: 'bg-navy-100 text-navy-500',
    perks: ['Начисление 5% с каждого заказа', 'Оплата заказа сибакоинами: 1 = 1 ₽'],
  },
  {
    key: 'active',
    label: 'Активный',
    range: '1 000 — 4 999 сибакоинов',
    color: 'bg-amber-50 border-amber-100',
    badge: 'bg-blue-100 text-blue-500',
    perks: ['Начисление 5% с каждого заказа', 'Оплата заказа сибакоинами: 1 = 1 ₽', 'Приоритетная поддержка'],
  },
  {
    key: 'premium',
    label: 'Премиум',
    range: 'от 5 000 сибакоинов',
    color: 'bg-amber-100 border-amber-200',
    badge: 'bg-amber-100 text-amber-600',
    perks: ['Начисление 5% с каждого заказа', 'Оплата заказа сибакоинами: 1 = 1 ₽', 'Приоритетная поддержка', 'Эксклюзивные акции'],
  },
]

export default function BonusesPage() {
  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Заголовок */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-navy-900 mb-3">
            Программа лояльности Сибакоины
          </h1>
          <p className="text-navy-400 text-base">
            Покупайте — копите — экономьте. Каждый заказ приносит вам сибакоины, которые можно тратить как скидку.
          </p>
        </div>

        {/* Как работает */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-navy-900 text-lg mb-4">Как это работает</h2>
          <div className="flex flex-col gap-4">
            <div>
              <p className="font-semibold text-navy-900 text-sm">Делаете заказ</p>
              <p className="text-navy-400 text-sm">5% от суммы заказа автоматически зачисляется на ваш бонусный счёт</p>
            </div>
            <div>
              <p className="font-semibold text-navy-900 text-sm">Копите сибакоины</p>
              <p className="text-navy-400 text-sm">1 сибакоин = 1 рубль скидки. Чем больше заказов — тем выше уровень</p>
            </div>
            <div>
              <p className="font-semibold text-navy-900 text-sm">Тратите на скидку</p>
              <p className="text-navy-400 text-sm">При оформлении заказа выберите, сколько сибакоинов списать</p>
            </div>
          </div>
        </div>

        {/* Таблица уровней */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-navy-900 text-lg mb-4">Уровни участника</h2>
          <div className="flex flex-col gap-3">
            {LEVELS.map(level => (
              <div key={level.key} className={`rounded-xl border p-4 ${level.color}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${level.badge}`}>
                    {level.label}
                  </span>
                  <span className="text-xs text-navy-400">{level.range}</span>
                </div>
                <ul className="flex flex-col gap-1">
                  {level.perks.map(perk => (
                    <li key={perk} className="text-sm text-navy-700 flex items-center gap-2">
                      <span className="text-amber-400">✓</span> {perk}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/auth"
            className="flex-1 bg-blue-200 text-navy-900 font-bold py-3.5 rounded-2xl text-center text-sm hover:bg-blue-300 transition-colors">
            Войти и начать копить
          </Link>
          <Link
            to="/catalog"
            className="flex-1 bg-white border border-blue-100 text-navy-700 font-bold py-3.5 rounded-2xl text-center text-sm hover:bg-blue-50 transition-colors">
            Смотреть каталог
          </Link>
        </div>

      </div>
    </div>
  )
}
