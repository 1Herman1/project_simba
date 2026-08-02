import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'

// Иконка: подарок
function GiftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <path d="M12 2v5"/>
      <path d="M9 7h6"/>
    </svg>
  )
}

// Иконка: процент
function PercentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="18" cy="18" r="3"/>
      <path d="M9 9l6 6"/>
    </svg>
  )
}

// Иконка: кошелёк
function WalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 7V4a1 1 0 00-1-1H5a2 2 0 00-2 2v16a2 2 0 002 2h12a1 1 0 001-1v-3"/>
      <polyline points="16 5 12 8 16 11"/>
      <line x1="12" y1="8" x2="2" y2="8"/>
    </svg>
  )
}

const LEVELS = [
  {
    key: 'newcomer',
    label: 'Новичок',
    range: '0 — 999 бонусов',
    color: 'bg-blue-50 border-blue-100',
    badge: 'bg-navy-100 text-navy-500',
    perks: ['Начисление 5% с каждого заказа', 'Оплата бонусами: 1 = 1 ₽, до 50% чека'],
  },
  {
    key: 'active',
    label: 'Активный',
    range: '1 000 — 4 999 бонусов',
    color: 'bg-amber-50 border-amber-100',
    badge: 'bg-blue-100 text-blue-500',
    perks: ['Начисление 5% с каждого заказа', 'Оплата бонусами: 1 = 1 ₽, до 50% чека', 'Приоритетная поддержка'],
  },
  {
    key: 'premium',
    label: 'Премиум',
    range: 'от 5 000 бонусов',
    color: 'bg-amber-100 border-amber-200',
    badge: 'bg-amber-100 text-amber-600',
    perks: ['Начисление 5% с каждого заказа', 'Оплата бонусами: 1 = 1 ₽, до 50% чека', 'Приоритетная поддержка', 'Эксклюзивные акции'],
  },
]

export default function BonusesPage() {
  useMetaTags({
    title: 'Бонусная программа — Зоомагазин Симба',
    description:
      '5% с каждого заказа возвращается бонусами, 300 приветственных при регистрации. Бонусами можно оплатить до половины суммы заказа.',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">

      {/* Заголовок */}
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-8">
        Бонусная программа
      </h1>

      {/* Крупная сводка */}
      <div className="bg-primary-tint rounded-card p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          <div className="flex-1">
            <div className="text-[40px] font-black text-navy-900">5%</div>
            <p className="text-navy-500 leading-relaxed">
              от стоимости товаров в каждом заказе возвращается бонусами · 1 бонус = 1 рубль
            </p>
            <p className="text-xs text-navy-500 mt-3">
              Начисление идёт от товарной части, оплаченной деньгами. Доставка в расчёт не входит, списанные бонусы из базы вычитаются.
            </p>
          </div>
        </div>
      </div>

      {/* Три карточки */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Карточка 1 */}
        <div className="bg-white border border-line rounded-card p-5">
          <div className="text-primary-soft mb-4">
            <GiftIcon />
          </div>
          <h3 className="font-bold text-navy-900 mb-2">300 бонусов новому клиенту</h3>
          <p className="text-navy-500 text-sm">
            Каждый новый покупатель получает 300 приветственных бонусов при регистрации. Потратить их можно уже при первой покупке.
          </p>
        </div>

        {/* Карточка 2 */}
        <div className="bg-white border border-line rounded-card p-5">
          <div className="text-primary-soft mb-4">
            <PercentIcon />
          </div>
          <h3 className="font-bold text-navy-900 mb-2">Как списывать</h3>
          <p className="text-navy-500 text-sm">
            Бонусами можно оплатить до 50% суммы заказа. При оформлении укажите, сколько списать — остаток сохранится на счёте.
          </p>
        </div>

        {/* Карточка 3 */}
        <div className="bg-white border border-line rounded-card p-5">
          <div className="text-primary-soft mb-4">
            <WalletIcon />
          </div>
          <h3 className="font-bold text-navy-900 mb-2">Где смотреть баланс</h3>
          <p className="text-navy-500 text-sm">
            Все бонусы, история заказов и начислений — в личном кабинете.
          </p>
        </div>
      </div>

      {/* Мелкий текст и кнопка */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pb-8 border-b border-line">
        <p className="text-sm text-navy-500">
          Бонусы начисляются после оплаты заказа. Бонусы действуют 6 месяцев с момента начисления.
        </p>
        <Link
          to="/profile"
          className="bg-primary text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-primary-hover transition-colors duration-100 ease whitespace-nowrap min-h-11 flex items-center justify-center"
        >
          Войти в личный кабинет
        </Link>
      </div>

      {/* Блок про подбор корма */}
      <div className="bg-primary-tint rounded-card p-6 text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-navy-900 mb-3">
          Не знаете, какой корм выбрать?
        </h2>
        <p className="text-navy-500 mb-6 leading-relaxed">
          Ответьте на несколько вопросов о питомце — и мы порекомендуем конкретный корм: линейку и вкус, а не просто бренд. Это займёт около минуты.
        </p>
        <Link
          to="/questionnaire"
          className="bg-primary text-white rounded-xl px-6 py-3 font-semibold text-sm hover:bg-primary-hover transition-colors duration-100 ease inline-block min-h-11 flex items-center justify-center"
        >
          Подобрать корм
        </Link>
        <div className="flex items-center justify-center gap-1.5 mt-4 text-sm text-navy-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polyline points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
          </svg>
          После подбора — 300 бонусов на первую покупку
        </div>
      </div>

      {/* Таблица уровней */}
      <div className="mb-8">
        <h2 className="font-bold text-navy-900 text-lg mb-4">Уровни участника</h2>
        <div className="flex flex-col gap-3">
          {LEVELS.map(level => (
            <div key={level.key} className={`rounded-card border p-4 ${level.color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${level.badge}`}>
                  {level.label}
                </span>
                <span className="text-xs text-navy-500">{level.range}</span>
              </div>
              <ul className="flex flex-col gap-1">
                {level.perks.map(perk => (
                  <li key={perk} className="text-sm text-navy-700 flex items-center gap-2">
                    <span className="text-amber-600">✓</span> {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
