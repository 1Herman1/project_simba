import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/** Декор по бокам карточки. Файлы кладутся в client/public/decor/ —
    пока их нет, места остаются пустыми (см. onError). */
const DECOR = {
  left: '/decor/quiz-left.png',
  right: '/decor/quiz-right.png',
}

export default function QuestionnaireTeaser() {
  const sceneRef = useRef<HTMLDivElement>(null)

  /** Параллакс: слои смещаются и слегка поворачиваются вслед за курсором —
      левый и правый в противофазе, отсюда ощущение глубины. Только для мыши,
      гасится при prefers-reduced-motion. */
  useEffect(() => {
    const el = sceneRef.current
    if (!el || typeof window.matchMedia !== 'function') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0
    let pending: { x: number; y: number } | null = null

    const paint = () => {
      frame = 0
      if (!pending) return
      el.style.setProperty('--px', pending.x.toFixed(3))
      el.style.setProperty('--py', pending.y.toFixed(3))
      pending = null
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const r = el.getBoundingClientRect()
      // -1..1 от центра секции
      pending = {
        x: ((e.clientX - r.left) / r.width) * 2 - 1,
        y: ((e.clientY - r.top) / r.height) * 2 - 1,
      }
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const reset = () => {
      pending = { x: 0, y: 0 }
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const enable = () => {
      el.addEventListener('pointermove', onMove, { passive: true })
      el.addEventListener('pointerleave', reset, { passive: true })
    }
    const disable = () => {
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      el.style.removeProperty('--px')
      el.style.removeProperty('--py')
    }

    const sync = () => (fine.matches && !reduced.matches ? enable() : disable())
    sync()
    reduced.addEventListener('change', sync)
    fine.addEventListener('change', sync)

    return () => {
      reduced.removeEventListener('change', sync)
      fine.removeEventListener('change', sync)
      disable()
    }
  }, [])

  return (
    <section id="questionnaire" className="scroll-mt-24 py-12 md:py-16">
      <div ref={sceneRef} className="quiz-scene relative max-w-7xl mx-auto px-4">
        {/* Декор слева */}
        <img
          src={DECOR.left}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="quiz-decor quiz-decor--left"
        />
        {/* Декор справа */}
        <img
          src={DECOR.right}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className="quiz-decor quiz-decor--right"
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="rounded-card bg-white border border-line p-8 text-center">
            <h2 className="text-2xl font-bold text-navy-900 mb-2">
              Не знаете, какой корм выбрать?
            </h2>
            <p className="text-navy-500 mb-6 max-w-md mx-auto">
              Пройдите короткую анкету — подберём оптимальное питание для вашего питомца за 2 минуты
            </p>
            <Link
              to="/questionnaire"
              className="btn-primary px-8 rounded-xl font-semibold"
            >
              Подобрать корм
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
