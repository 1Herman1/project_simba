function GiftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <path d="M12 7V2M7 7h10" />
    </svg>
  )
}

interface QuizIntroProps {
  onStart: () => void
}

export default function QuizIntro({ onStart }: QuizIntroProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Подберём идеальный корм за 60 секунд
          </h1>
          <p className="text-xl text-navy-600 mb-6">
            Ответьте на несколько вопросов о вашем питомце — возраст, размер, особенности здоровья и вкусовые предпочтения. Мы порекомендуем конкретный корм: линейку и вкус, а не просто бренд.
          </p>
        </div>

        <button
          onClick={onStart}
          className="btn-primary rounded-xl px-8 py-4 font-bold text-lg mb-8 inline-block hover:scale-105 transition-transform"
        >
          Начать подбор
        </button>

        <div className="bg-white rounded-xl border border-line p-6 flex items-center justify-center gap-3 mb-8">
          <GiftIcon />
          <span className="text-navy-700 font-medium">После подбора — 300 бонусов на первую покупку</span>
        </div>

        <p className="text-sm text-navy-500">
          Это займёт около минуты. Результат сразу же — без регистрации и звонков.
        </p>
      </div>
    </div>
  )
}
