import { useState } from 'react'
import { Link } from 'react-router-dom'
import MarketplaceCard from '../MarketplaceCard'
import { CONTACTS, MARKETPLACES, LEGAL } from '../../lib/contacts'

// Иконка бумажного самолётика Telegram
function TelegramPlaneIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  )
}

// Иконка трубки — Feather, тот же path что в шапке
function PhoneIcon() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

// Иконка звезды для рейтинга

// Иконка внешней ссылки

// Иконка шеврона (для аккордеона)
function ChevronIcon({ open }: { open?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={`transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
      width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
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
    { label: 'Почему нам доверяют', to: '/trust' },
    { label: 'Сертификаты кормов', to: '/certificates' },
    { label: 'Отзывы', to: '/reviews' },
    { label: 'Блог', to: '/blog' },
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
            onMouseMove={(e) => {
              const t = e.currentTarget
              const r = t.getBoundingClientRect()
              t.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
              t.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
            }}
            className="group relative overflow-hidden bg-primary hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 text-white font-semibold px-4 py-3 rounded-xl transition-[background-color,transform] duration-100 ease-smooth flex items-center justify-center min-h-11 text-base"
            aria-label="Написать нам в Telegram — ответим за 10 минут"
          >
            <span aria-hidden="true" className="btn-shine" />
            <span className="relative z-10 flex items-center gap-2">
              <TelegramPlaneIcon />
              Telegram — ответим за 10 минут
            </span>
          </a>

          {/* Телефон */}
          <a
            href={CONTACTS.phoneHref}
            className="flex items-center gap-2 text-base md:text-sm text-navy-900 hover:text-primary-hover transition-colors duration-100 ease min-h-11 md:min-h-auto"
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
            <a href={CONTACTS.emailHref} className="text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">
              {CONTACTS.email}
            </a>
            <span className="text-navy-500"> — для юрлиц и поставщиков</span>
          </div>
        </div>

        {/* Колонка 2: ПОКУПАТЕЛЯМ — аккордеон на мобиле */}
        <div className="flex flex-col">
          <button
            onClick={() => setBuyers2Open(!buyers2Open)}
            className="md:hidden flex items-center justify-between py-3 min-h-11 font-bold text-navy-900 uppercase tracking-wide text-sm mb-2 hover:text-primary-hover transition-colors duration-100 ease"
            aria-expanded={buyers2Open}
            aria-controls="buyers-accordion"
          >
            Покупателям
            <ChevronIcon open={buyers2Open} />
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
                  <Link key={item.to} to={item.to} className="text-base md:text-sm text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">
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
            className="md:hidden flex items-center justify-between py-3 min-h-11 font-bold text-navy-900 uppercase tracking-wide text-sm mb-2 hover:text-primary-hover transition-colors duration-100 ease"
            aria-expanded={about2Open}
            aria-controls="about-accordion"
          >
            О магазине
            <ChevronIcon open={about2Open} />
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
                      <span className="text-base md:text-sm text-navy-500 cursor-default">
                        {item.label}
                        {/* Подсказка title на телефоне не показывается — пишем словом. */}
                        <span className="ml-2 text-xs uppercase tracking-wide text-navy-500">скоро</span>
                      </span>
                    ) : item.hash ? (
                      <a href={`${item.to}${item.hash}`} className="text-base md:text-sm text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">
                        {item.label}
                      </a>
                    ) : (
                      <Link to={item.to || ''} className="text-base md:text-sm text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">
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

          <div className="flex flex-col gap-3">
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

          {/* Пояснение под карточками */}
          <p className="text-base md:text-sm text-navy-500">Заказывая на сайте, вы получаете бонусы и цены без наценки площадок.</p>
        </div>
      </div>

      {/* Нижняя полоса */}
      <div className="border-t border-line bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-start md:justify-between gap-6 text-base md:text-sm text-navy-500">
          {/* Левая часть: copyright + оплата (строка часов убрана — дублирует колонку 1) */}
          <div className="space-y-2 flex-1">
            <p>© 2026 Симба · {LEGAL.entity} · {LEGAL.inn} · Москва</p>
            <p className="flex items-center gap-1.5">
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              Оплата: МИР · Visa · Mastercard · СБП
            </p>
          </div>

          {/* Правая часть: три мета-пункта в один ряд, на мобиле — перенос.
              Роутов и студии пока нет → это НЕ ссылки, а статичные пункты в
              resting-цвете ссылок (navy-700) без hover, чтобы не обещать переход.
              TODO: когда появятся страницы/студия — заменить span на Link/a
              и добавить hover:text-primary-hover transition-colors. */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 md:justify-end text-navy-700">
            <span className="cursor-default">Разработка сайтов</span>
            <span className="cursor-default">Политика конфиденциальности</span>
            <span className="cursor-default">Публичная оферта</span>
          </div>
        </div>

        {/* Отступ для фиксированного мобильного навбара */}
        <div className="pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0" />
      </div>
    </footer>
  )
}
