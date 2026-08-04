import { Link } from 'react-router-dom'
import MarketplaceCard from '../MarketplaceCard'
import { MARKETPLACES } from '../../lib/contacts'

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <polyline points="9 15 11 17 15 13" />
    </svg>
  )
}

function RepeatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36M20.49 15a9 9 0 01-14.85 3.36" />
    </svg>
  )
}

function ArrowReturnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 7 3 13 9 13" />
      <path d="M21 10a7 7 0 00-7-7 7 7 0 00-7 7" />
    </svg>
  )
}

const guarantees = [
  { icon: <ShieldIcon />, title: 'Оригинальная продукция', text: 'Прямые поставки от официальных дистрибьюторов, документы на каждую партию.' },
  { icon: <CalendarIcon />, title: 'Живые сроки годности', text: 'Проверяем каждую поставку на приёмке. Маркировку можно проверить при получении, до оплаты.' },
  { icon: <RepeatIcon />, title: 'Половина заказов — повторные', text: 'Люди возвращаются туда, где корм оригинальный, а сроки живые.' },
  { icon: <ArrowReturnIcon />, title: 'Возврат без бюрократии', text: 'Невскрытую упаковку принимаем 30 дней. Брак меняем без вопросов.' },
]

export default function TrustSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-navy-900">Почему нам доверяют</h2>
        <p className="mt-2 text-navy-500 max-w-prose leading-relaxed">Не обещания, а то, что можно проверить</p>

        {/* Крупный стат-бокс — подложка primary-tint, без рамки */}
        <div className="mt-8 rounded-card bg-white border border-line p-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[40px] leading-none font-black text-navy-900 tabular-nums whitespace-nowrap">24 000+</span>
          <p className="text-navy-500">заказов на трёх площадках · рейтинг 4,9 на каждой</p>
        </div>

        {/* Три мини-карточки площадок */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MARKETPLACES.map((m) => (
            <MarketplaceCard
              key={m.name}
              name={m.name}
              rating={m.rating}
              stats={m.stats}
              url={m.url}
              showLink={m.name === 'Яндекс Маркет'}
            />
          ))}
        </div>

        {/* 2×2 карточки-преимущества со stroke-иконками */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guarantees.map((g) => (
            <div key={g.title} className="bg-white border border-line rounded-card p-5">
              <div className="text-primary-soft mb-3">{g.icon}</div>
              <h3 className="font-bold text-navy-900 mb-1">{g.title}</h3>
              <p className="text-navy-500 leading-relaxed">{g.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/trust"
            className="inline-flex items-center justify-center min-h-11 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors duration-100 ease"
          >
            Подробнее о гарантиях
          </Link>
        </div>
      </div>
    </section>
  )
}
