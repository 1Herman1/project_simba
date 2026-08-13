import { Link } from 'react-router-dom'

/** Спящий котик: раздел не сломан, он просто пока пустой. Рисуем инлайном —
    отдельный файл ради одной картинки тянул бы лишний запрос. */
function SleepingCat() {
  return (
    <svg
      viewBox="0 0 160 110"
      role="img"
      aria-label="Спящий котик"
      className="w-40 h-auto mx-auto mb-6 text-navy-200"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 88h104" />
        <path d="M40 88c0-18 14-30 34-30s34 12 34 30" />
        <path d="M108 88c14 0 20-6 24-14" />
        <circle cx="126" cy="66" r="14" />
        <path d="M114 55l-2-12 11 6M138 55l2-12-11 6" />
        <path d="M120 68q3 2 6 0M132 68q-3 2-6 0" />
        <path d="M124 74h4" />
      </g>
      <g fill="currentColor">
        <circle cx="52" cy="46" r="2" />
        <circle cx="64" cy="36" r="2.6" />
        <circle cx="78" cy="27" r="3.2" />
      </g>
    </svg>
  )
}

type Props = {
  /** true — раздел ещё наполняется; false — под фильтры покупателя ничего не нашлось. */
  sectionEmpty: boolean
}

export default function EmptyCatalog({ sectionEmpty }: Props) {
  return (
    <div className="text-center py-16">
      <SleepingCat />
      {sectionEmpty ? (
        <>
          <p className="text-navy-500 text-lg mb-2">Этот раздел мы сейчас наполняем</p>
          <p className="text-navy-300 text-sm mb-6">
            Товары появятся здесь в ближайшее время. А пока загляните в корма — там больше
            пятисот позиций.
          </p>
        </>
      ) : (
        <>
          <p className="text-navy-500 text-lg mb-2">Ничего не нашлось</p>
          <p className="text-navy-300 text-sm mb-6">
            Попробуйте другой запрос или снимите часть фильтров.
          </p>
        </>
      )}
      <Link
        to="/catalog"
        className="inline-flex items-center justify-center h-11 px-5 rounded-full bg-navy-900 text-white text-sm font-semibold hover:bg-navy-700 transition-colors duration-100 ease"
      >
        Весь каталог
      </Link>
    </div>
  )
}
