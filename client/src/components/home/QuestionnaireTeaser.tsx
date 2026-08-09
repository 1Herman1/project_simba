import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMediaQuery } from '../../hooks/useMediaQuery'

/** Декор по бокам карточки. Файлы — в client/public/decor/.
    Пока файла нет, место остаётся пустым (см. onError). */
const DECOR = [
  { side: 'left' as const, png: '/decor/quiz-left.png', webp: '/decor/quiz-left.webp' },
  { side: 'right' as const, png: '/decor/quiz-right.png', webp: '/decor/quiz-right.webp' },
]

function DecorImage({ side, png, webp }: (typeof DECOR)[number]) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={png}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`quiz-decor quiz-decor--${side}`}
      />
    </picture>
  )
}

export default function QuestionnaireTeaser() {
  /** Ниже 1024px декор не показывается — на узком экране места по бокам нет.
      Условный рендер вместо display:none: иначе браузер скачал бы картинки
      и на телефоне, где их всё равно не видно. */
  const showDecor = useMediaQuery('(min-width: 1024px)')

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
        {showDecor && DECOR.map((d) => <DecorImage key={d.side} {...d} />)}
      </div>
    </section>
  )
}
