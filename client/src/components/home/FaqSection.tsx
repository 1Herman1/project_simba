import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { FAQ, renderFaqAnswer, type FaqEntry } from '../../lib/faq'

/** На главной — четыре вопроса, остальные на /faq. Источник текста один. */
const faqs = FAQ.slice(0, 4)

function FaqItem({ faq }: { faq: FaqEntry }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="bg-white border border-line rounded-card overflow-hidden">
      <h3 className="font-bold text-navy-900 text-base sm:text-lg">
        <button
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-primary-tint transition-colors duration-100 ease"
        >
          <span className="pr-4 flex-grow">{faq.q}</span>
          <svg
            aria-hidden="true"
            className={`w-5 h-5 flex-shrink-0 text-primary-hover transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </h3>
      <div
        id={id}
        role="region"
        className={`grid transition-[grid-template-rows] ease-out ${open ? 'duration-200' : 'duration-150'}`}
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden bg-primary-tint">
          <div
            className={`px-5 pt-4 pb-5 max-w-prose leading-relaxed text-navy-500 transition-[opacity,transform] ease-out ${open ? 'duration-200 opacity-100 translate-y-0' : 'duration-150 opacity-0 -translate-y-1'}`}
          >
            {renderFaqAnswer(faq)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-8 text-navy-900">Вопросы и ответы</h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq) => (
          <FaqItem key={faq.id} faq={faq} />
        ))}
      </div>
      <div className="mt-8">
        <Link to="/faq" className="text-primary-hover hover:underline transition-colors duration-100 ease">
          Все вопросы и ответы →
        </Link>
      </div>
      </div>
    </section>
  )
}
