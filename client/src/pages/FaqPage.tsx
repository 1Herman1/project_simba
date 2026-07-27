import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS } from '../lib/contacts'
import { FAQ, type FaqEntry } from '../lib/faq'

const faqs = FAQ

function TelegramPlaneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23 3a6.6 6.6 0 01-6 6.3v10.7M1 3l10 19 2-8 8-2-20-9.7z" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function FaqItemComponent({ item }: { item: FaqEntry }) {
  const [open, setOpen] = useState(false)

  const renderAnswer = (type: string) => {
    switch (type) {
      case 'return':
        return (
          <>
            Невскрытую упаковку — да, в течение 30 дней. Вскрытую, к сожалению, нет — санитарные нормы. Подробнее —{' '}
            <Link to="/returns" className="text-primary-hover underline hover:text-navy-900">
              на странице «Обмен и возврат»
            </Link>
            .
          </>
        )
      case 'selection':
        return (
          <>
            Да, это то, что мы делаем лучше всего. Напишите нам о питомце — возраст, порода, особенности — и мы предложим
            варианты. Или{' '}
            <Link to="/questionnaire" className="text-primary-hover underline hover:text-navy-900">
              пройдите подбор корма на сайте
            </Link>
            , это минута.
          </>
        )
      default:
        return item.text
    }
  }

  return (
    <div className="bg-white border border-line rounded-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-primary-tint transition-colors duration-200 ease-out"
        aria-expanded={open}
        aria-controls={`faq-${item.id}`}
      >
        <h2 className="font-bold text-navy-900 pr-4 flex-grow text-base sm:text-lg">{item.q}</h2>
        <div className="flex-shrink-0 text-primary-hover">
          <ChevronIcon className={`transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <div
        id={`faq-${item.id}`}
        role="region"
        className={`overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${open ? '' : ''}`}
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
          display: 'grid',
        }}
      >
        <div className="overflow-hidden">
          <div className={`px-5 pb-5 text-navy-500 leading-relaxed ${open ? 'bg-primary-tint opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`} style={{
            transition: open ? 'opacity 200ms 0ms, transform 200ms 0ms' : 'opacity 140ms 0ms, transform 140ms 0ms',
          }}>
            {renderAnswer(item.id)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FaqPage() {
  useMetaTags({
    title: 'Вопросы и ответы о кормах и заказе — Симба',
    description:
      'Оригинальность кормов Farmina и Monge, сроки годности, возврат, бонусы и помощь с подбором — отвечаем на частые вопросы.',
  })

  // JSON-LD FAQPage
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.text,
      },
    })),
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />

      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-10">Вопросы и ответы</h1>

      <div className="space-y-4 mb-10">
        {faqs.map((faq) => (
          <FaqItemComponent key={faq.id} item={faq} />
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 pt-6 border-t border-line">
        <p className="text-navy-500">Не нашли ответ — </p>
        <a
          href={CONTACTS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-primary text-white rounded-xl px-6 py-3 font-bold hover:bg-primary-hover transition-colors duration-200 ease-out"
        >
          <TelegramPlaneIcon />
          Спросите в Telegram
        </a>
      </div>
    </div>
  )
}
