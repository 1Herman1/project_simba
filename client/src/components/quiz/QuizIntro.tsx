import GiftIcon from './GiftIcon'

interface QuizIntroProps {
  onStart: () => void
}

export default function QuizIntro({ onStart }: QuizIntroProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-blue-50 px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Подберём идеальный корм за минуту
          </h1>
          <p className="text-lg text-navy-600 mb-6 max-w-prose mx-auto">
            Ответим на несколько вопросов о питомце — возраст, вес, здоровье, вкусы. В ответ получите не бренд, а конкретный корм: линейку и вкус.
          </p>
        </div>

        <button
          onClick={onStart}
          className="btn-primary rounded-xl px-8 py-4 font-bold text-lg mb-8 inline-block transition-colors duration-100 ease"
        >
          Начать подбор
        </button>

        <div className="bg-white rounded-card border border-line p-6 flex items-center justify-center gap-3 mb-8">
          <span className="text-amber-500">
            <GiftIcon />
          </span>
          <span className="text-navy-700 font-medium">После подбора — 300 бонусов на первую покупку</span>
        </div>

        <p className="text-sm text-navy-500">
          Результат сразу же — без регистрации и звонков.
        </p>
      </div>
    </div>
  )
}
