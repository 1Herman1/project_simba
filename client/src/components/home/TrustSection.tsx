import { Link } from 'react-router-dom'
import { type CSSProperties } from 'react'
import MarketplaceCard from '../MarketplaceCard'
import { MARKETPLACES } from '../../lib/contacts'
import CountUp from '../CountUp'
import { useOnScreen } from '../../hooks/useOnScreen'

/** Медаль с галочкой: подтверждённая подлинность, а не абстрактная «защита».
    Вся медаль качается лёгким «оттиском печати» — .trust-shield в index.css. */
function VerifiedIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g className="trust-shield">
        <circle cx="12" cy="9" r="6" />
        <polyline points="9.5 9 11 10.5 14 7.5" />
        <path d="M9 14 7.5 21 12 18 16.5 21 15 14" />
      </g>
    </svg>
  )
}

/** Календарь с датами: две отмечены как обычные дни, одна проверена галочкой —
    двигается только галочка (.trust-check), рамка и точки стоят на месте. */
function FreshDateIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
      <circle cx="7.5" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r="1" fill="currentColor" stroke="none" />
      <g className="trust-check">
        <polyline points="13.5 17 15 18.5 18 15.5" />
      </g>
    </svg>
  )
}

/** Сердце в кольце возврата: клиент возвращается, а не «обновление страницы».
    Стрелки цикла разворачиваются на 180° (точечно-симметричны друг другу —
    переход бесшовный), сердце в центре стоит на месте. */
function LoyalHeartIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g className="trust-cycle">
        <path d="M4 12a8 8 0 0 1 16 0" />
        <polyline points="18 10 20 12 22 10" />
        <path d="M20 12a8 8 0 0 1-16 0" />
        <polyline points="6 14 4 12 2 14" />
      </g>
      <path d="M12 16C9.5 14 8 12.5 8 11A2 2 0 0 1 12 11A2 2 0 0 1 16 11C16 12.5 14.5 14 12 16Z" />
    </svg>
  )
}

/** Посылка со стрелкой внутрь: буквально «привезти коробку обратно» —
    двигается только стрелка (.trust-return), сама коробка стоит на месте. */
function ReturnBoxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <g className="trust-return">
        <line x1="15.5" y1="14.5" x2="8.5" y2="14.5" />
        <polyline points="11.5 11.5 8.5 14.5 11.5 17.5" />
      </g>
    </svg>
  )
}

/** Тот же тональный код, что в AdvantagesSection: синий — про товар и проверку,
    янтарный — про людей и сервис. Подложек нет: Trust тише, чем Advantages. */
const TONE = {
  primary: 'text-primary-soft',
  amber: 'text-amber-600',
} as const

const guarantees = [
  { icon: <VerifiedIcon />, tone: 'primary' as const, title: 'Оригинальная продукция', text: 'Прямые поставки от официальных дистрибьюторов, документы на каждую партию.' },
  { icon: <FreshDateIcon />, tone: 'primary' as const, title: 'Живые сроки годности', text: 'Проверяем каждую поставку на приёмке. Маркировку можно проверить при получении, до оплаты.' },
  { icon: <LoyalHeartIcon />, tone: 'amber' as const, title: 'Половина заказов — повторные', text: 'Люди возвращаются туда, где корм оригинальный, а сроки живые.' },
  { icon: <ReturnBoxIcon />, tone: 'amber' as const, title: 'Возврат без бюрократии', text: 'Невскрытую упаковку принимаем 30 дней. Брак меняем без вопросов.' },
]

/** Тот же паттерн стаггера, что в AdvantagesSection: 600мс форы + 1400мс шаг —
    в движении всегда ровно одна иконка. */
const iconDelay = (i: number) => ({ '--idle-delay': `${600 + i * 1400}ms` }) as CSSProperties

export default function TrustSection() {
  const iconsRef = useOnScreen<HTMLDivElement>()

  return (
    <section id="trust" className="scroll-mt-24 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-navy-900">Почему нам доверяют</h2>
        <p className="mt-2 text-navy-500 max-w-prose leading-relaxed">Не обещания, а то, что можно проверить</p>

        {/* Крупный стат-бокс — подложка primary-tint, без рамки */}
        <div className="mt-8 rounded-card bg-white border border-line p-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <CountUp value={24000} suffix="+" className="text-[40px] leading-none font-black text-navy-900 whitespace-nowrap" />
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
        <div ref={iconsRef} className="trust-icons mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guarantees.map((g, i) => (
            <div key={g.title} className="bg-white border border-line rounded-card p-5">
              <div className="flex items-center gap-3">
                <span style={iconDelay(i)} className={`flex-shrink-0 ${TONE[g.tone]}`}>{g.icon}</span>
                <h3 className="font-bold text-navy-900">{g.title}</h3>
              </div>
              <p className="mt-2 text-navy-500 leading-relaxed">{g.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/trust"
            className="btn-primary px-6 rounded-xl font-bold"
          >
            Подробнее о гарантиях
          </Link>
        </div>
      </div>
    </section>
  )
}
