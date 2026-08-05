import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS } from '../lib/contacts'

function GiftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <path d="M12 7V2M7 7h10" />
    </svg>
  )
}

export default function QuestionnairePage() {
  useMetaTags({
    title: 'Подбор корма для кошки и собаки — Симба',
    description:
      'Ответьте на несколько вопросов о питомце и получите рекомендацию: линейку и вкус корма, а не просто бренд.',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-8">
        Подбор корма для питомца
      </h1>

      {/* Main card */}
      <div className="bg-white border border-line rounded-card p-6 md:p-8 text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Не знаете, какой корм выбрать?</h2>
        <p className="text-navy-500 max-w-prose mx-auto mb-6 text-left">
          Ответьте на несколько вопросов о вашем питомце — возраст, размер, особенности здоровья и вкусовые предпочтения. Мы
          порекомендуем конкретный корм: линейку и вкус, а не просто бренд. Это займёт около минуты.
        </p>

        {/* Questionnaire button - currently links to Telegram */}
        {/* TODO: Replace with actual questionnaire form when it's ready */}
        <a
          href={CONTACTS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary rounded-xl px-8 py-3 font-bold mb-3"
        >
          Подобрать корм
        </a>

        <p className="text-sm text-navy-500">Пока подбор ведёт консультант — ответим в Telegram за 10 минут</p>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-navy-500">
          <GiftIcon />
          <span>После подбора — 300 бонусов на первую покупку</span>
        </div>
      </div>

      {/* How it works section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Как это работает</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {[
            { number: 1, text: 'Расскажете о питомце' },
            { number: 2, text: 'Подберём линейку и вкус' },
            { number: 3, text: 'Начислим 300 бонусов' },
          ].map((step) => (
            <div key={step.number} className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                {step.number}
              </div>
              <p className="text-navy-500 pt-1">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
