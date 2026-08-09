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
        <circle cx="12" cy="9" r="5.8" />
        <polyline points="9.4 9 11.1 10.7 14.6 7.2" />
        <path d="M8.3 13.4 L6.8 21.4 L12 18.7 L17.2 21.4 L15.7 13.4" />
      </g>
    </svg>
  )
}

/** Календарь с датами: две отмечены как обычные дни, одна проверена галочкой —
    двигается только галочка (.trust-check), рамка и точки стоят на месте. */
function FreshDateIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2.5" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
      <path d="M3 10h18" />
      <circle cx="7.4" cy="13.8" r="1.05" fill="currentColor" stroke="none" />
      <circle cx="11.4" cy="13.8" r="1.05" fill="currentColor" stroke="none" />
      <g className="trust-check">
        <polyline points="13.4 17.2 15.5 19.3 18.7 15.1" />
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
        <path d="M12 4a8 8 0 0 1 8 8" />
        <polyline points="17.5 9.5 20 12 22.5 9.5" />
        <path d="M12 20a8 8 0 0 1-8-8" />
        <polyline points="6.5 14.5 4 12 1.5 14.5" />
      </g>
      <path d="M12 17l-3.8-3.7a3.1 3.1 0 0 1 3.8-3.6 3.1 3.1 0 0 1 3.8 3.6z" />
    </svg>
  )
}

/** Посылка со стрелкой внутрь: буквально «привезти коробку обратно» —
    двигается только стрелка (.trust-return), сама коробка стоит на месте. */
function ReturnBoxIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.6" y="4.6" width="18.8" height="4" rx="1" />
      <path d="M4.2 8.6h15.6v9.6a1.8 1.8 0 0 1-1.8 1.8H6a1.8 1.8 0 0 1-1.8-1.8z" />
      <g className="trust-return">
        <path d="M15.4 14.3H8.6" />
        <polyline points="11 11.9 8.6 14.3 11 16.7" />
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
