import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CONTACTS, MARKETPLACES, LEGAL } from '../../lib/contacts'

// Иконка самолётика для Telegram
function TelegramPlaneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a6.6 6.6 0 01-6 6.3v10.7M1 3l10 19 2-8 8-2-20-9.7z"/>
    </svg>
  )
}

// Иконка трубки
function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.81 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7 8.91a16 16 0 006.07 6.07l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  )
}

// Иконка звезды для рейтинга
function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
    </svg>
  )
}

// Иконка внешней ссылки
function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
      <polyline points="15,3 21,3 21,9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

// Иконка шеврона (для аккордеона)
function ChevronIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}


export default function Footer() {
  const [buyers2Open, setBuyers2Open] = useState(false)
  const [about2Open, setAbout2Open] = useState(false)

  // Контакты в первой колонке
  const buyersLinks = [
    { label: 'Доставка и оплата', to: '/delivery' },
    { label: 'Обмен и возврат', to: '/returns' },
    { label: 'Бонусная программа', to: '/bonuses' },
    { label: 'Подбор корма за 1 минуту', to: '/questionnaire' },
    { label: 'Вопросы и ответы', to: '/faq' },
  ]

  const aboutLinks: Array<{
    label: string
    to?: string
    hash?: string
    comingSoon?: boolean
  }> = [
    { label: 'О компании', to: '/about' },
    { label: 'Почему нам доверяют', to: '/about', hash: '#trust' },
    { label: 'Сертификаты кормов', comingSoon: true },
    { label: 'Блог', comingSoon: true },
    { label: 'Отзывы', comingSoon: true },
  ]

  return (
    <footer className="bg-blue-50 border-t border-line mt-12">
      {/* Верхняя часть — 4 колонки на десктопе, 1 на мобиле */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

        {/* Колонка 1: НАПИШИТЕ НАМ */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-navy-900 uppercase tracking-wide text-sm">Напишите нам</h3>

          {/* Кнопка Telegram — крупная синяя CTA */}
          <a
            href={CONTACTS.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-4 py-3 rounded-xl transition-colors duration-100 ease flex items-center justify-center gap-2 min-h-11 text-base"
            aria-label="Написать нам в Telegram — ответим за 10 минут"
          >
            <TelegramPlaneIcon />
            <span className="hidden sm:inline">Telegram — ответим за 10 минут</span>
            <span className="sm:hidden">Telegram</span>
          </a>

          {/* Телефон */}
          <a
            href={CONTACTS.phoneHref}
            className="flex items-center gap-2 text-base md:text-sm text-navy-900 hover:text-primary transition-colors duration-100 ease min-h-11 md:min-h-auto"
          >
            <PhoneIcon />
            {CONTACTS.phone}
          </a>

          {/* Два абзаца информации */}
          <div className="space-y-2 text-base md:text-sm text-navy-500">
            <p>{CONTACTS.orders}</p>
            <p>{CONTACTS.hours}</p>
          </div>

          {/* Почта */}
          <div className="flex items-baseline gap-2 text-base md:text-sm">
            <a href={CONTACTS.emailHref} className="text-primary-hover hover:text-primary transition-colors duration-100 ease">
              {CONTACTS.email}
            </a>
            <span className="text-navy-500"> — для юрлиц и поставщиков</span>
          </div>
        </div>

        {/* Колонка 2: ПОКУПАТЕЛЯМ — аккордеон на мобиле */}
        <div className="flex flex-col">
          <button
            onClick={() => setBuyers2Open(!buyers2Open)}
            className="md:hidden flex items-center justify-between py-2 font-bold text-navy-900 uppercase tracking-wide text-sm mb-2 hover:text-primary transition-colors duration-100 ease"
            aria-expanded={buyers2Open}
            aria-controls="buyers-accordion"
          >
            Покупателям
            <ChevronIcon />
          </button>

          <h3 className="hidden md:block font-bold text-navy-900 uppercase tracking-wide text-sm mb-4">Покупателям</h3>

          {/* На десктопе всегда видно, на мобиле — через аккордеон */}
          <nav
            id="buyers-accordion"
            className="gap-2 overflow-hidden transition-[grid-template-rows] duration-200 ease-out md:!transition-none md:!overflow-visible md:!flex md:!flex-col md:!gap-4"
            style={{
              display: 'grid',
              gridTemplateRows: buyers2Open ? '1fr' : '0fr',
            }}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-2">
                {buyersLinks.map((item) => (
                  <Link key={item.to} to={item.to} className="text-base md:text-sm text-primary-hover hover:text-primary transition-colors duration-100 ease">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Колонка 3: О МАГАЗИНЕ — аккордеон на мобиле */}
        <div className="flex flex-col">
          <button
            onClick={() => setAbout2Open(!about2Open)}
            className="md:hidden flex items-center justify-between py-2 font-bold text-navy-900 uppercase tracking-wide text-sm mb-2 hover:text-primary transition-colors duration-100 ease"
            aria-expanded={about2Open}
            aria-controls="about-accordion"
          >
            О магазине
            <ChevronIcon />
          </button>

          <h3 className="hidden md:block font-bold text-navy-900 uppercase tracking-wide text-sm mb-4">О магазине</h3>

          {/* На десктопе всегда видно, на мобиле — через аккордеон */}
          <nav
            id="about-accordion"
            className="gap-2 overflow-hidden transition-[grid-template-rows] duration-200 ease-out md:!transition-none md:!overflow-visible md:!flex md:!flex-col md:!gap-4"
            style={{
              display: 'grid',
              gridTemplateRows: about2Open ? '1fr' : '0fr',
            }}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-2">
                {aboutLinks.map((item) => (
                  <div key={item.label}>
                    {item.comingSoon ? (
                      <span className="text-base md:text-sm text-navy-400 cursor-default" title="Скоро">
                        {item.label}
                      </span>
                    ) : item.hash ? (
                      <a href={`${item.to}${item.hash}`} className="text-base md:text-sm text-primary-hover hover:text-primary transition-colors duration-100 ease">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.to || ''} className="text-base md:text-sm text-primary-hover hover:text-primary transition-colors duration-100 ease">
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* Колонка 4: НАМ ДОВЕРЯЮТ */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-navy-900 uppercase tracking-wide text-sm">Нам доверяют</h3>

          {/* Три карточки рядом (не вложенные) */}
          <div className="flex flex-col gap-3">
            {MARKETPLACES.map((marketplace) => (
              <a
                key={marketplace.name}
                href={marketplace.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white border border-line rounded-card p-4 hover:border-primary-soft transition-colors duration-100 ease flex flex-col gap-2"
                aria-label={`${marketplace.name} — рейтинг ${marketplace.rating} из 5, ${marketplace.stats}, откроется в новой вкладке`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-navy-900 flex-1">{marketplace.name}</h4>
                  <ExternalLinkIcon />
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-600 font-bold">{marketplace.rating}</span>
                  <StarIcon />
                </div>
                <p className="text-sm text-navy-500">{marketplace.stats}</p>
              </a>
            ))}
          </div>

          {/* Пояснение под карточками */}
          <p className="text-base md:text-sm text-navy-500">Заказывая на сайте, вы получаете бонусы и цены без наценки площадок.</p>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="border-t border-line bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-navy-500">
          {/* Левая часть: copyright */}
          <div className="space-y-2">
            <p>© 2026 Симба · {LEGAL.entity} · {LEGAL.inn} · {LEGAL.city}</p>
            <p className="flex items-center gap-1">
              <span>🔒</span> МИР · Visa · Mastercard · СБП
            </p>
          </div>

          {/* Правая часть: ссылки */}
          <div className="flex items-center gap-6">
            <span className="text-navy-400 cursor-default" title="Скоро">
              Политика конфиденциальности
            </span>
            <span className="text-navy-400 cursor-default" title="Скоро">
              Публичная оферта
            </span>
          </div>
        </div>

        {/* Отступ для фиксированного мобильного навбара */}
        <div className="pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0" />
      </div>
    </footer>
  )
}
