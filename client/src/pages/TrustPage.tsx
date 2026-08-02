import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS, MARKETPLACES } from '../lib/contacts'

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function RepeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36M20.49 15a9 9 0 01-14.85 3.36" />
    </svg>
  )
}

function ArrowReturnIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 7 3 13 9 13" />
      <path d="M21 10a7 7 0 00-7-7 7 7 0 00-7 7" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function TelegramPlaneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a6.6 6.6 0 01-6 6.3v10.7M1 3l10 19 2-8 8-2-20-9.7z" />
    </svg>
  )
}

export default function TrustPage() {
  useMetaTags({
    title: 'Почему нам доверяют — Зоомагазин Симба',
    description:
      'Прямые поставки, документы на каждую партию, живые сроки годности, 24 000+ заказов и рейтинг 4,9 на трёх площадках.',
  })

  const reasons = [
    {
      icon: <ShieldIcon />,
      title: 'Оригинальная продукция',
      content: (
        <>
          Прямые поставки от официальных дистрибьюторов, документы на каждую партию — сканы на странице{' '}
          <Link to="/certificates" className="text-primary-hover underline hover:text-navy-900">
            Сертификаты
          </Link>
          .
        </>
      ),
    },
    {
      icon: <CalendarIcon />,
      title: 'Живые сроки годности',
      content: 'Проверяем каждую поставку на приёмке. Вы можете проверить маркировку при получении, до оплаты.',
    },
    {
      icon: <RepeatIcon />,
      title: 'Половина заказов — повторные',
      content:
        'Люди возвращаются туда, где корм оригинальный, сроки живые, а упаковка целая.',
    },
    {
      icon: <ArrowReturnIcon />,
      title: 'Возврат без бюрократии',
      content: (
        <>
          Невскрытую упаковку принимаем 30 дней. Брак меняем без вопросов.{' '}
          <Link to="/returns" className="text-primary-hover underline hover:text-navy-900">
            Условия возврата
          </Link>
        </>
      ),
    },
    {
      icon: <MessageIcon />,
      title: 'Отвечаем быстро',
      content: 'Telegram, ежедневно 9:00–21:00, обычно в течение 10 минут.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-2">Почему нам доверяют</h1>
      <p className="text-navy-500 mb-10">Не обещания, а то, что можно проверить</p>

      {/* Numbers block */}
      <div className="bg-primary-tint rounded-card p-6 mb-12">
        <div className="flex flex-col gap-6">
          {/* Цифра и пояснение — одной строкой: разряд числа не должен переноситься */}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[40px] leading-none font-black text-navy-900 tabular-nums whitespace-nowrap">
              24 000+
            </span>
            <p className="text-navy-500">заказов на трёх площадках · рейтинг 4,9 на каждой</p>
          </div>

          {/* Marketplace cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {MARKETPLACES.map((marketplace) => (
              <div key={marketplace.name} className="bg-white rounded-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-navy-900">{marketplace.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-600 font-bold">{marketplace.rating}</span>
                    <StarIcon />
                  </div>
                </div>
                <p className="text-sm text-navy-500 mb-3">{marketplace.stats}</p>
                {marketplace.name === 'Яндекс Маркет' && (
                  <a
                    href={marketplace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary-hover underline hover:text-navy-900 text-sm font-medium"
                    aria-label="Читать отзывы на Яндекс Маркете (откроется в новой вкладке)"
                  >
                    Читать отзывы
                    <ExternalLinkIcon />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reasons grid */}
      <section className="mb-12">
        <div className="grid md:grid-cols-2 gap-4">
          {reasons.map((reason, idx) => (
            <div key={idx} className="bg-white border border-line rounded-card p-5">
              <div className="text-primary-soft mb-3">{reason.icon}</div>
              <h3 className="font-bold text-navy-900 mb-2">{reason.title}</h3>
              <p className="text-navy-500 leading-relaxed">
                {typeof reason.content === 'string' ? reason.content : reason.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA block */}
      <div className="bg-primary-tint rounded-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-soft flex-shrink-0 mt-0.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            <p className="text-navy-500">
              Остались сомнения — спросите нас напрямую. Отвечаем за 10 минут.
            </p>
          </div>
          <a
            href={CONTACTS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl px-6 py-3 font-bold hover:bg-primary-hover transition-colors duration-200 ease-out w-full sm:w-auto flex-shrink-0"
          >
            <TelegramPlaneIcon />
            Написать в Telegram
          </a>
        </div>
      </div>
    </div>
  )
}
