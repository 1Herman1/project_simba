import { Link } from 'react-router-dom'
import { type CSSProperties } from 'react'
import { useMetaTags } from '../hooks/useMetaTags'
import CountUp from '../components/CountUp'
import MarketplaceCard from '../components/MarketplaceCard'
import { CONTACTS, MARKETPLACES } from '../lib/contacts'
import TelegramIcon from '../components/icons/TelegramIcon'
import { useOnScreen } from '../hooks/useOnScreen'

/** Те же 4 иконки, что в TrustSection.tsx на главной — это одни и те же
    гарантии в двух местах сайта, у них должна быть одна визуальная форма. */
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

/** Пузырь с «печатает» — точки подпрыгивают волной слева направо, ответ уже
    набирают. Самолётик Telegram сюда не берём: он уже занят кнопкой ниже. */
function TypingReplyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-7l-4 3.5V16H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z" />
      <g className="trust-message">
        <circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="10" r="1.1" fill="currentColor" stroke="none" />
        <circle cx="16" cy="10" r="1.1" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

/** Тот же тональный код, что в TrustSection.tsx: синий — про товар и проверку,
    янтарный — про людей и сервис. */
const TONE = {
  primary: 'text-primary-soft',
  amber: 'text-amber-600',
} as const

/** 5 карточек против 4 в TrustSection: шаг стаггера = цикл / число иконок,
    иначе 5-я иконка (600+4*1400=6200мс ≡ 600мс) синхронизируется с первой. */
const iconDelay = (i: number) => ({ '--idle-delay': `${600 + i * 1120}ms` }) as CSSProperties


export default function TrustPage() {
  const iconsRef = useOnScreen<HTMLDivElement>()

  useMetaTags({
    title: 'Почему нам доверяют — Зоомагазин Симба',
    description:
      'Прямые поставки, документы на каждую партию, живые сроки годности, 24 000+ заказов и рейтинг 4,9 на трёх площадках.',
  })

  const reasons = [
    {
      icon: <VerifiedIcon />,
      tone: 'primary' as const,
      title: 'Оригинальная продукция',
      content: (
        <>
          Прямые поставки от официальных дистрибьюторов, документы на каждую партию — сканы на странице{' '}
          <Link to="/certificates" className="font-medium text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">
            Сертификаты
          </Link>
          .
        </>
      ),
    },
    {
      icon: <FreshDateIcon />,
      tone: 'primary' as const,
      title: 'Живые сроки годности',
      content: 'Проверяем каждую поставку на приёмке. Вы можете проверить маркировку при получении, до оплаты.',
    },
    {
      icon: <LoyalHeartIcon />,
      tone: 'amber' as const,
      title: 'Половина заказов — повторные',
      content:
        'Люди возвращаются туда, где корм оригинальный, сроки живые, а упаковка целая.',
    },
    {
      icon: <ReturnBoxIcon />,
      tone: 'amber' as const,
      title: 'Возврат без бюрократии',
      content: (
        <>
          Невскрытую упаковку принимаем 30 дней. Брак меняем без вопросов.{' '}
          <Link to="/returns" className="font-medium text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">
            Условия возврата
          </Link>
        </>
      ),
    },
    {
      icon: <TypingReplyIcon />,
      tone: 'amber' as const,
      title: 'Отвечаем быстро',
      content: 'Telegram, ежедневно 9:00–21:00, обычно в течение 10 минут.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-2">Почему нам доверяют</h1>
      <p className="text-navy-500 mb-10">Не обещания, а то, что можно проверить</p>

      {/* Цифра и площадки — прямо на фоне страницы: белые карточки на подложке
          были карточкой в карточке и съедали ширину на телефоне */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-6">
        <CountUp value={24000} suffix="+" className="text-[40px] leading-none font-black text-navy-900 whitespace-nowrap" />
        <p className="text-navy-500">заказов на трёх площадках · рейтинг 4,9 на каждой</p>
      </div>

      <h2 className="text-2xl font-bold text-navy-900 mb-4">Что говорят площадки</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {MARKETPLACES.map((marketplace) => (
          <MarketplaceCard
            key={marketplace.name}
            name={marketplace.name}
            rating={marketplace.rating}
            stats={marketplace.stats}
            url={marketplace.url}
            showLink={marketplace.name === 'Яндекс Маркет'}
          />
        ))}
      </div>

      {/* Reasons grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Что мы гарантируем</h2>
        <div ref={iconsRef} className="trust-icons grid md:grid-cols-2 gap-4">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className={`bg-white border border-line rounded-card p-5 ${index === 0 ? 'md:col-span-2' : ''}`}
            >
              <div style={iconDelay(index)} className={`mb-3 ${TONE[reason.tone]}`}>{reason.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{reason.title}</h3>
              <p className="text-navy-500 leading-relaxed">
                {reason.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 pt-6 border-t border-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-navy-500">Остались сомнения — спросите нас напрямую. Отвечаем за 10 минут.</p>
        <a
          href={CONTACTS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 min-h-11 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors duration-100 ease"
        >
          <TelegramIcon />
          Написать в Telegram
        </a>
      </div>
    </div>
  )
}
