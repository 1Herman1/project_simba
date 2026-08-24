export function StarIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

type Props = {
  name: string
  rating: string
  stats: string
  url?: string
  /** Ссылку на площадку показываем не везде — это решение владельца, не оформление. */
  showLink?: boolean
  linkLabel?: string
}

/**
 * Одна карточка площадки на весь сайт. До этого она была нарисована тремя
 * разными способами — на странице доверия, на отзывах и в подвале, — а рейтинг
 * двумя: SVG-звездой и текстовым символом другого размера.
 */
export default function MarketplaceCard({
  name,
  rating,
  stats,
  url,
  showLink = false,
  linkLabel = 'Читать отзывы',
}: Props) {
  return (
    <div className="bg-white border border-line rounded-card p-4 transition-[transform,box-shadow,border-color] duration-150 ease-smooth hover:-translate-y-0.5 hover:border-primary-soft hover:shadow-card active:translate-y-0">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-navy-900">{name}</span>
        <span className="flex items-baseline gap-1 text-amber-600 font-bold">
          {rating}
          <StarIcon />
        </span>
      </div>

      <p className="mt-1 text-sm text-navy-500">{stats}</p>

      {showLink && url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${linkLabel} о магазине на площадке ${name}, рейтинг ${rating} из 5, откроется в новой вкладке`}
          className="mt-1 inline-flex items-center gap-1 min-h-11 text-sm font-medium text-navy-700 hover:text-primary-hover transition-colors duration-100 ease"
        >
          {linkLabel}
          <span className="ico-nudge ico-nudge--diag">
            <ExternalLinkIcon />
          </span>
        </a>
      )}
    </div>
  )
}
