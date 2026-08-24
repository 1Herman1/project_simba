import { GiftIcon } from '../icons'

interface QuizIntroProps {
  onStart: () => void
  inModal?: boolean
}

export default function QuizIntro({ onStart, inModal }: QuizIntroProps) {
  return (
    <div className={`flex items-center justify-center bg-blue-50 px-4 py-12 ${
      inModal ? 'min-h-0' : 'min-h-[100dvh]'
    }`}>
      <div className="max-w-2xl w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">
            Подберём корм под вашего питомца за пару минут
          </h1>
          <p className="text-lg text-navy-600 mb-6 max-w-prose mx-auto">
            Ответим на несколько вопросов о питомце — возраст, вес, здоровье, вкусы. В ответ получите не бренд, а конкретный корм: линейку и вкус.
          </p>
        </div>

        <button
          onClick={onStart}
          className="btn-primary rounded-xl px-8 py-4 font-bold text-lg mb-8 inline-block"
        >
          Начать подбор
        </button>

        <div className="bg-white rounded-card border border-line p-6 flex items-center justify-center gap-3 mb-8">
          <GiftIcon className="w-6 h-6 text-amber-500" />
          <span className="text-navy-700 font-medium">После подбора — 300 бонусов на первую покупку. Заберёте их после входа в аккаунт</span>
        </div>

        <p className="text-sm text-navy-500">
          Результат — сразу, без звонков и регистрации.
        </p>
      </div>
    </div>
  )
}
