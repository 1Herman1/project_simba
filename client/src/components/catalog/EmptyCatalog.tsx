import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

/**
 * Сидящий пёс в профиль. Силуэт собран из простых форм — круг черепа, скруглённая
 * морда, висячее ухо тоном темнее, круп-окружность и хвост дугой: тонкий контур
 * на пустом экране выглядит недорисованным, плотное пятно читается как рисунок.
 * Декоративный, поэтому спрятан от скринридера — смысл несёт заголовок.
 */
function SittingDog() {
  return (
    <svg viewBox="0 0 230 180" aria-hidden="true" focusable="false" className="w-36 h-auto mx-auto mb-6">
      <ellipse cx="118" cy="164" rx="76" ry="8" className="fill-navy-100" />

      {/* хвост дугой — рисуем до крупа, чтобы он выходил из-за него */}
      <path
        d="M182 132 q26 4 30 -16 q3 -16 -9 -22"
        fill="none"
        strokeWidth="12"
        strokeLinecap="round"
        className="stroke-navy-200"
      />

      <g className="fill-navy-200">
        <circle cx="152" cy="116" r="42" />
        <path d="M100 62 q34 -4 44 26 q10 32 4 62 h-58 q-10 0 -10 -10 z" />
        <path d="M86 60 q22 0 26 24 q6 22 4 66 h-24 q-8 0 -8 -10 q-4 -46 -6 -62 q-2 -14 8 -18 z" />
        <rect x="66" y="140" width="44" height="18" rx="9" />
        <rect x="120" y="142" width="46" height="16" rx="8" />
        <circle cx="98" cy="42" r="29" />
        <rect x="44" y="42" width="50" height="27" rx="13" />
      </g>

      {/* ухо тоном темнее, иначе сливается с черепом */}
      <path
        d="M116 16 q22 0 22 26 q0 26 -20 30 q-9 2 -9 -9 l-2 -37 q0 -10 9 -10 z"
        className="fill-navy-300"
      />

      <g className="fill-navy-400">
        <circle cx="94" cy="35" r="4" />
        <ellipse cx="48" cy="53" rx="8" ry="6" />
      </g>

      <g className="dog-zzz fill-navy-200">
        <circle cx="156" cy="42" r="3" />
        <circle cx="171" cy="26" r="4" />
        <circle cx="189" cy="8" r="5" />
      </g>
    </svg>
  )
}

type Props = {
  /** true — раздел ещё наполняется; false — под фильтры покупателя ничего не нашлось. */
  sectionEmpty: boolean
}

const delay = (ms: number) => ({ '--in-delay': `${ms}ms` }) as CSSProperties

export default function EmptyCatalog({ sectionEmpty }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className={`empty-in text-center py-16 ${mounted ? 'is-in' : ''}`}>
      <SittingDog />
      <h2 className="text-navy-900 text-2xl font-bold mb-2" style={delay(25)}>
        {sectionEmpty ? 'Этот раздел мы сейчас наполняем' : 'Ничего не нашлось'}
      </h2>
      <p className="text-navy-500 text-base mb-8 max-w-prose mx-auto" style={delay(25)}>
        {sectionEmpty
          ? 'Товары появятся здесь в ближайшее время. А пока загляните в корма — там больше пятисот позиций.'
          : 'Попробуйте другой запрос или снимите часть фильтров.'}
      </p>
      <Link to="/catalog" className="btn-primary px-6 rounded-xl text-sm font-bold" style={delay(50)}>
        Весь каталог
      </Link>
    </div>
  )
}
