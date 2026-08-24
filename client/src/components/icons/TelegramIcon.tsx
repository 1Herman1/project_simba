interface Props {
  className?: string
  /** outline — контурный самолётик под ряд иконок шапки (там все соседи
      нарисованы линией толщиной 2 и сплошная заливка читалась бы тяжелее их).
      solid — фирменный глиф для CTA-кнопок и подвала, где иконка стоит на
      цветной заливке и контур на ней теряется. */
  variant?: 'solid' | 'outline'
}

export default function TelegramIcon({ className = 'w-5 h-5', variant = 'solid' }: Props) {
  if (variant === 'outline') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
        className={`flex-shrink-0 ${className}`}>
        <path d="M21.6 3.2 2.9 10.4c-.7.3-.7 1.3 0 1.5l4.7 1.6 1.8 5.6c.2.7 1.1.9 1.6.3l2.5-2.7 4.6 3.4c.6.4 1.4.1 1.5-.6l2.9-15c.2-.8-.6-1.4-1.3-1.1Z" />
        <path d="m7.6 13.5 11-8.2-7.2 9.4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" focusable="false" className={`flex-shrink-0 ${className}`}>
      <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.6 10.1l7.4-104.9L366 132.9c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z" />
    </svg>
  )
}
