import { useState } from 'react'
import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS } from '../lib/contacts'
import { FAQ, renderFaqAnswer, type FaqEntry } from '../lib/faq'
import TelegramIcon from '../components/icons/TelegramIcon'

const faqs = FAQ

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

  return (
    <div className="bg-white border border-line rounded-card overflow-hidden">
      <h2 className="font-bold text-navy-900 text-base sm:text-lg">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-primary-tint transition-colors duration-100 ease"
          aria-expanded={open}
          aria-controls={`faq-${item.id}`}
        >
          <span className="pr-4 flex-grow">{item.q}</span>
          <div className="flex-shrink-0 text-primary-hover">
            <ChevronIcon className={`transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`} />
          </div>
        </button>
      </h2>

      <div
        id={`faq-${item.id}`}
        role="region"
        className={`grid transition-[grid-template-rows] ease-out ${open ? 'duration-200' : 'duration-150'}`}
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden bg-primary-tint">
          <div
            className={`px-5 pt-4 pb-5 max-w-prose text-navy-500 leading-relaxed transition-[opacity,transform] ease-out ${open ? 'duration-200 opacity-100 translate-y-0' : 'duration-150 opacity-0 -translate-y-1'}`}
          >
            {renderFaqAnswer(item)}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 pt-6 border-t border-line">
        <p className="text-navy-500">Не нашли ответ? Напишите — отвечаем за 10 минут.</p>
        <a
          href={CONTACTS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary rounded-xl px-6 py-3 font-bold gap-2"
        >
          <TelegramIcon />
          Спросите в Telegram
        </a>
      </div>
    </div>
  )
}
