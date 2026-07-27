import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { FAQ, type FaqEntry } from '../../lib/faq'

/** На главной — четыре вопроса, остальные на /faq. Источник текста один. */
const faqs = FAQ.slice(0, 4)

function FaqItem({ faq }: { faq: FaqEntry }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="bg-white border border-line rounded-card overflow-hidden">
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-primary-tint transition-colors duration-100 ease"
      >
        <span className="font-semibold pr-4 text-navy-900">{faq.q}</span>
        <svg
          aria-hidden="true"
          className={`w-5 h-5 flex-shrink-0 text-primary-hover transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id={id}
        role="region"
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 leading-relaxed text-navy-500 opacity-0 -translate-y-1 transition-[opacity,transform] duration-200 ease-out" style={{
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(-4px)',
          }}>
            {faq.text}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FaqSection() {
  return (
    <section className="py-12 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-8 text-navy-900">Вопросы и ответы</h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <FaqItem key={faq.id} faq={faq} />
        ))}
      </div>
      <div className="mt-8">
        <Link to="/faq" className="text-primary-hover hover:underline transition-colors">
          Все вопросы и ответы →
        </Link>
      </div>
    </section>
  )
}
