import { useState } from 'react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useReveal } from '../../hooks/useReveal'
import { useQuizParallax } from '../../hooks/useQuizParallax'
import { useDrawer } from '../../context/DrawerContext'
import GiftIcon from '../quiz/GiftIcon'

/** Декор по бокам карточки — новые ассеты с поворотом запечённым.
    Файлы в client/public/decor/. */
const DECOR = [
  { name: 'quiz-left-back', type: 'back' as const, width: 478, height: 861 },
  { name: 'quiz-right-back', type: 'back' as const, width: 537, height: 780 },
  { name: 'paw-front', type: 'front' as const, width: 300, height: 367 },
  { name: 'nose-front', type: 'front' as const, width: 340, height: 361 },
]

function DecorImage({ name, type, width, height }: (typeof DECOR)[number]) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  const side = name.includes('left') ? 'left' : 'right'
  const decorClass = type === 'back'
    ? `quiz-decor quiz-decor--${side}`
    : `quiz-prop ${name.includes('paw') ? 'quiz-prop--paw' : 'quiz-prop--nose'}`

  return (
    <picture>
      <source srcSet={`/decor/${name}.webp`} type="image/webp" />
      <img
        src={`/decor/${name}.png`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        width={width}
        height={height}
        onError={() => setFailed(true)}
        className={decorClass}
      />
    </picture>
  )
}

export default function QuestionnaireTeaser() {
  const { openQuiz } = useDrawer()
  const sceneRef = useReveal<HTMLDivElement>({ rootMargin: '0px 0px -25% 0px' })

  /** Показываем декор только на 1280px и выше — вся геометрия выверена на этих ширинах. */
  const showDecor = useMediaQuery('(min-width: 1280px)')

  /** Параллакс животных по курсору — только там, где декор вообще смонтирован. */
  useQuizParallax(sceneRef, showDecor)

  return (
    <section id="questionnaire" className="scroll-mt-24 py-12 md:py-16 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4">
        {/* Якорь для Reveal: сама сцена с карточкой. Четыре декора входят в этот контекст. */}
        <div ref={sceneRef} className="quiz-scene relative mx-auto w-full max-w-4xl">
          {/* Два фоновых декора (кот + пёс) входят первыми — они за карточкой. */}
          {showDecor && DECOR.filter(d => d.type === 'back').map((d) => <DecorImage key={d.name} {...d} />)}

          <div className="quiz-card relative z-10 rounded-card bg-white border border-line shadow-card px-5 py-8 md:px-8 md:py-10 text-center">
            <h2 className="text-2xl xl:text-3xl font-bold text-navy-900 mb-3">
              Не знаете, какой корм выбрать?
            </h2>
            <p className="text-base leading-relaxed text-navy-500 text-pretty max-w-xl mx-auto mb-6">
              Несколько вопросов о питомце: возраст, размер, здоровье. Подберём не просто бренд, а <strong className="font-semibold text-navy-700">конкретную линейку и вкус</strong>. Займёт около минуты.
            </p>
            <button
              type="button"
              onClick={openQuiz}
              className="btn-primary px-8 rounded-xl font-semibold"
            >
              Подобрать корм
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-navy-500">
              <span className="shrink-0 text-amber-600" aria-hidden="true"><GiftIcon size={16} /></span>
              <span><strong className="font-semibold">+300 бонусов</strong> на первую покупку</span>
            </p>
          </div>

          {/* Два передних декора (лапа + нос) входят последними — они поверх карточки. */}
          {showDecor && DECOR.filter(d => d.type === 'front').map((d) => <DecorImage key={d.name} {...d} />)}
        </div>
      </div>
    </section>
  )
}
