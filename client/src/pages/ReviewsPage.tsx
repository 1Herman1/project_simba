import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'
import { MARKETPLACES } from '../lib/contacts'

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

export default function ReviewsPage() {
  useMetaTags({
    title: 'Отзывы о зоомагазине Симба',
    description:
      'Мы не публикуем отзывы на сайте вручную — читайте нас на Яндекс Маркете, Ozon и Авито, где отзывы оставляют реальные покупатели.',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-3">Что о нас говорят</h1>

      <p className="text-navy-500 max-w-prose mb-10 leading-relaxed">
        Мы не публикуем отзывы у себя на сайте вручную — их невозможно проверить. Вместо этого читайте нас там, где отзывы
        оставляют реальные покупатели после реальных заказов.
      </p>

      {/* Marketplaces grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        {MARKETPLACES.map((marketplace, idx) => (
          <div
            key={marketplace.name}
            className={`bg-white rounded-card p-5 flex flex-col ${idx === 0 ? 'border-2 border-primary-soft' : 'border border-line'}`}
          >
            <h3 className="font-bold text-navy-900 mb-3">{marketplace.name}</h3>

            <div className="flex items-baseline gap-1.5 mb-4">
              <span className="text-amber-600 font-bold">{marketplace.rating}</span>
              <span className="text-amber-600">★</span>
            </div>

            <p className="text-sm text-navy-500 mb-4 flex-grow">{marketplace.stats}</p>

            {idx === 0 ? (
              <a
                href={marketplace.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-primary-hover font-bold hover:text-navy-900 transition-colors duration-200 ease-out"
                aria-label={`${marketplace.name}, рейтинг ${marketplace.rating} из 5, читать отзывы, откроется в новой вкладке`}
              >
                Читать отзывы
                <ExternalLinkIcon />
              </a>
            ) : null}
          </div>
        ))}
      </div>

      {/* Info block */}
      <div className="bg-primary-tint rounded-card p-5">
        <p className="text-navy-500 leading-relaxed">
          Заказывая на сайте, вы получаете{' '}
          <Link to="/bonuses" className="text-primary-hover underline hover:text-navy-900 transition-colors duration-200 ease-out">
            бонусы
          </Link>
          {' '}и цены без наценки площадок.
        </p>
      </div>
    </div>
  )
}
