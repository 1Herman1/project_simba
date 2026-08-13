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
