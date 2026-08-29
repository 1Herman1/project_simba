import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import LottieScene from '../LottieScene'


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
      <LottieScene
          load={() => import('../../lottie/empty-catalog.json')}
          className="w-36 aspect-[1065/922] mx-auto mb-6"
        />
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
