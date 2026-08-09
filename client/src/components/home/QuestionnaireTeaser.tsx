import { Link } from 'react-router-dom'

/** Декор по бокам карточки. Файлы — в client/public/decor/.
    Пока файла нет, место остаётся пустым (см. onError). */
const DECOR = {
  left: '/decor/quiz-left.png',
  right: '/decor/quiz-right.png',
}

export default function QuestionnaireTeaser() {
  return (
    <section id="questionnaire" className="scroll-mt-24 py-12 md:py-16">
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Карточка: края уходят под животных */}
        <div className="relative z-10 mx-auto w-full max-w-5xl rounded-card bg-white border border-line px-8 py-14 text-center">
          <h2 className="text-2xl font-bold text-navy-900 mb-2">
            Не знаете, какой корм выбрать?
          </h2>
          <p className="text-navy-500 mb-6 max-w-md mx-auto">
            Пройдите короткую анкету — подберём оптимальное питание для вашего питомца за 2 минуты
          </p>
          <Link to="/questionnaire" className="btn-primary px-8 rounded-xl font-semibold">
            Подобрать корм
          </Link>
        </div>

        {/* Животные поверх карточки: лапа и нос ложатся на неё, остальное уходит за край */}
        <img
          src={DECOR.left}
          alt=""
          aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="quiz-decor quiz-decor--left"
        />
        <img
          src={DECOR.right}
          alt=""
          aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="quiz-decor quiz-decor--right"
        />
      </div>
    </section>
  )
}
