/**
 * Силуэты питомцев для первого вопроса подбора. Раньше там стояли эмодзи
 * 🐕 и 🐈 — на каждой системе свой рисунок, к тому же скринридер зачитывает их
 * словами. Манера та же, что у пса в пустом каталоге: плотные пятна по шкале
 * navy, без контура. Цвет наследуется от кнопки, поэтому у выбранного варианта
 * силуэт темнеет вместе с рамкой.
 */

type Props = { className?: string }

export function DogSilhouette({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" className={className}>
      <g fill="currentColor">
        <circle cx="76" cy="78" r="28" />
        <path d="M40 44 q24 -4 32 18 q7 24 3 44 h-40 q-7 0 -7 -7 z" />
        <rect x="28" y="98" width="30" height="13" rx="6.5" />
        <rect x="66" y="99" width="32" height="12" rx="6" />
        <circle cx="42" cy="34" r="20" />
        <rect x="10" y="34" width="35" height="19" rx="9.5" />
      </g>
      <path
        d="M54 14 q15 0 15 18 q0 18 -14 21 q-6 1 -6 -6 l-1 -26 q0 -7 6 -7 z"
        fill="currentColor"
        opacity="0.75"
      />
      <path d="M96 76 q18 -7 18 -24" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
    </svg>
  )
}

export function CatSilhouette({ className = '' }: Props) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" className={className}>
      <path
        d="M100 104 q20 -6 18 -28 q-2 -14 -12 -16"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <path d="M44 106 q-8 0 -8 -8 q0 -34 8 -50 q6 -12 20 -12 q20 0 26 26 q6 26 4 44 z" />
        <ellipse cx="76" cy="100" rx="26" ry="10" />
        <circle cx="50" cy="38" r="22" />
        <path d="M32 24 l-3 -20 l20 11 z" />
        <path d="M68 24 l5 -20 l-19 12 z" />
      </g>
    </svg>
  )
}
