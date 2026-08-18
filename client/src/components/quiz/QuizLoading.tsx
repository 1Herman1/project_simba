import { useEffect, useState } from 'react'

/**
 * Пёс идёт по следу. Силуэт в той же манере, что SittingDog в EmptyCatalog:
 * плотные скруглённые пятна по шкале navy, без контура. Двигаются только следы —
 * сам пёс неподвижен, иначе сцена читается как шум. Скрыт от скринридера,
 * статус несёт role="status" на контейнере.
 */
function SniffingDog() {
  return (
    <svg viewBox="0 0 260 170" aria-hidden="true" focusable="false" className="w-44 h-auto mx-auto mb-8">
      <ellipse cx="140" cy="156" rx="82" ry="8" className="fill-navy-100" />

      {/* хвост поднят трубой — собака в работе, а не спит */}
      <path
        d="M196 118 q22 -10 22 -34"
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        className="stroke-navy-200"
      />

      <g className="fill-navy-200">
        <circle cx="170" cy="106" r="40" />
        <path d="M118 60 q36 -6 48 26 q10 34 4 62 h-60 q-10 0 -10 -10 z" />
        <rect x="84" y="132" width="42" height="18" rx="9" />
        <rect x="140" y="132" width="46" height="18" rx="9" />
        {/* голова опущена к земле */}
        <circle cx="100" cy="86" r="28" />
        <rect x="52" y="98" width="52" height="26" rx="13" />
      </g>

      <path
        d="M116 60 q22 0 22 26 q0 26 -20 30 q-9 2 -9 -9 l-2 -37 q0 -10 9 -10 z"
        className="fill-navy-300"
      />

      <g className="fill-navy-400">
        <circle cx="96" cy="80" r="4" />
        <ellipse cx="56" cy="110" rx="8" ry="6" />
      </g>

      {/* следы перед носом — единственная движущаяся часть сцены */}
      <g className="quiz-track fill-navy-300">
        <g>
          <ellipse cx="34" cy="146" rx="7" ry="5.5" />
          <circle cx="28" cy="138" r="2.4" />
          <circle cx="35" cy="136" r="2.4" />
          <circle cx="42" cy="139" r="2.4" />
        </g>
        <g>
          <ellipse cx="18" cy="128" rx="7" ry="5.5" />
          <circle cx="12" cy="120" r="2.4" />
          <circle cx="19" cy="118" r="2.4" />
          <circle cx="26" cy="121" r="2.4" />
        </g>
        <g>
          <ellipse cx="34" cy="110" rx="7" ry="5.5" />
          <circle cx="28" cy="102" r="2.4" />
          <circle cx="35" cy="100" r="2.4" />
          <circle cx="42" cy="103" r="2.4" />
        </g>
      </g>
    </svg>
  )
}

const STAGES = ['Смотрим состав кормов', 'Сверяем с возрастом и весом', 'Подбираем оптимальный вариант']

interface QuizLoadingProps {
  inModal?: boolean
}

export default function QuizLoading({ inModal }: QuizLoadingProps) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage(1), 900)
    const t2 = window.setTimeout(() => setStage(2), 1900)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  return (
    <div className={`flex items-center justify-center bg-blue-50 px-4 ${
      inModal ? 'min-h-0' : 'min-h-[100dvh]'
    }`}>
      <div className="text-center" role="status" aria-live="polite">
        <SniffingDog />
        <h1 className="text-2xl font-bold text-navy-900 mb-2">Подбираем корм</h1>
        <p key={stage} className="quiz-stage text-navy-500 text-base">
          {STAGES[stage]}
        </p>
      </div>
    </div>
  )
}
