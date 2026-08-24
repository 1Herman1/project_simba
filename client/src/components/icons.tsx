/**
 * Иконки интерфейса. Раньше их роль играли символы и эмодзи («✓ Добавлено»,
 * «Все вопросы →», «●○» в статусе заказа): на разных системах они рисуются
 * по-разному, скринридер читает их вслух как слова, а в кнопку размер и толщину
 * не подогнать. Здесь один набор в единой манере — обводка 2px, скруглённые
 * концы, размер задаётся классом снаружи.
 */

type IconProps = {
  className?: string
}

const base = 'w-5 h-5 flex-shrink-0'

/** Галочка. С классом `icon-check` линия прочерчивается при появлении. */
export function CheckIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M4.5 12.5l5 5 10-11" className="icon-check-path" />
    </svg>
  )
}

export function ArrowRightIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

export function ArrowLeftIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <path d="M19 12H6M11 6l-6 6 6 6" />
    </svg>
  )
}

/** Текущий шаг: залитая точка в кольце — видно даже в чёрно-белой печати. */
export function StepCurrentIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  )
}

/** Будущий шаг: пустое кольцо. */
export function StepPendingIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={`${base} ${className}`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

/** Отпечаток лапы — заглушка на месте отсутствующего фото товара. */
export function PawIcon({ className = '' }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" className={className}>
      <g fill="currentColor">
        <ellipse cx="32" cy="42" rx="15" ry="12" />
        <ellipse cx="15" cy="27" rx="6.5" ry="8.5" transform="rotate(-18 15 27)" className="paw-toe--fl" />
        <ellipse cx="49" cy="27" rx="6.5" ry="8.5" transform="rotate(18 49 27)" className="paw-toe--fr" />
        <ellipse cx="24" cy="15" rx="6" ry="8" transform="rotate(-8 24 15)" className="paw-toe--tl" />
        <ellipse cx="40" cy="15" rx="6" ry="8" transform="rotate(8 40 15)" className="paw-toe--tr" />
      </g>
    </svg>
  )
}

export function CloseIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

type ChevronDownIconProps = IconProps & {
  open?: boolean
}

export function ChevronDownIcon({ className = '', open = false }: ChevronDownIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`ico-chevron ${open ? 'is-open' : ''} ${base} ${className}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function TrashIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={`${base} ${className}`}
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
  )
}
