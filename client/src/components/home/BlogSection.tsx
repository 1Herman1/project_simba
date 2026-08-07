import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { getPublished, type BlogCategory } from '../../content/blog'
import { useReveal } from '../../hooks/useReveal'

function ImagePlaceholderIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

const CATEGORIES: BlogCategory[] = ['Сравнения кормов', 'Питание', 'Здоровье', 'Кошки', 'Собаки', 'Ветдиеты']

const POSTS_ON_HOME = 6

/** Каскад при скролле: старт 120мс (после заголовка и чипов), шаг 60мс, кап 4 ступени. */
const revealDelay = (i: number) => `${120 + Math.min(i, 3) * 60}ms`
/** Каскад при смене фильтра: короче — действие повторяемое. Шаг 40мс, кап 4 ступени. */
const swapDelay = (i: number) => `${Math.min(i, 3) * 40}ms`

const CHIP_BASE =
  'px-4 min-h-11 rounded-full font-semibold text-sm transition-[background-color,border-color,color,transform] duration-100 ease active:scale-[0.97]'
const CHIP_ON = 'bg-primary text-white border border-primary'
const CHIP_OFF = 'bg-white border border-line text-navy-500 hover:border-primary-soft hover:bg-primary-tint'

export default function BlogSection() {
  /** Наблюдатель на самой группе: секция подключена без обёртки <Reveal>,
      поэтому класс is-visible ей должен ставить собственный хук. */
  const groupRef = useReveal<HTMLDivElement>()
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null)
  /** Растёт с каждым переключением фильтра. 0 = первая отрисовка: там работает scroll-reveal, а не swap-анимация. */
  const [swapCount, setSwapCount] = useState(0)

  const posts = getPublished()
  const filtered = selectedCategory
    ? posts.filter((post) => post.categories.includes(selectedCategory))
    : posts
  const visible = filtered.slice(0, POSTS_ON_HOME)

  const swapping = swapCount > 0
  const swapClass = swapping ? 'animate-card-in' : ''

  const handleCategoryClick = (category: BlogCategory | null) => {
    if (category === selectedCategory) return
    setSelectedCategory(category)
    setSwapCount((n) => n + 1)
  }

  const cardStyle = (i: number) =>
    ({ '--reveal-delay': revealDelay(i), animationDelay: swapDelay(i) }) as CSSProperties

  return (
    <section id="blog" aria-labelledby="blog-title" className="scroll-mt-24 py-12 md:py-16">
      <div ref={groupRef} className="reveal-group max-w-7xl mx-auto px-4">
        <div className="reveal-item">
          <h2 id="blog-title" className="text-2xl font-bold text-navy-900">
            Блог
          </h2>
          <p className="mt-2 text-navy-500 max-w-prose leading-relaxed">
            Разбираем составы кормов и отвечаем на вопросы, которые чаще всего задают на консультациях.
          </p>
        </div>

        <div
          role="group"
          aria-label="Фильтр статей по категориям"
          className="reveal-item mt-6 flex flex-wrap gap-2"
          style={{ '--reveal-delay': '60ms' } as CSSProperties}
        >
          <button
            type="button"
            aria-pressed={selectedCategory === null}
            onClick={() => handleCategoryClick(null)}
            className={`${CHIP_BASE} ${selectedCategory === null ? CHIP_ON : CHIP_OFF}`}
          >
            Все
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={selectedCategory === category}
              onClick={() => handleCategoryClick(category)}
              className={`${CHIP_BASE} ${selectedCategory === category ? CHIP_ON : CHIP_OFF}`}
            >
              {category}
            </button>
          ))}
        </div>

        {visible.length > 0 ? (
          <div
            key={selectedCategory ?? 'all'}
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {visible.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                style={cardStyle(i)}
                className={`reveal-item ${swapClass} bg-white border border-line rounded-card overflow-hidden transition-[transform,box-shadow,border-color] duration-100 ease hover:border-primary-soft hover:shadow-card hover:-translate-y-0.5`}
              >
                {post.cover ? (
                  <img src={post.cover} alt="" className="w-full aspect-[16/10] object-cover" />
                ) : (
                  <div className="w-full aspect-[16/10] bg-primary-tint flex items-center justify-center text-primary-soft">
                    <ImagePlaceholderIcon />
                  </div>
                )}

                <div className="p-5">
                  <p className="text-xs uppercase tracking-wide text-primary-hover font-semibold mb-2">
                    {post.categories.join(' · ')}
                  </p>
                  <h3 className="font-bold text-lg text-navy-900 mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-navy-500 mb-4 line-clamp-2">{post.excerpt}</p>
                  <p className="text-sm text-navy-500 tabular-nums">
                    {new Date(post.date + 'T00:00:00Z').toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })}{' '}
                    · {post.readingMinutes} мин
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div
            key={`empty-${selectedCategory ?? 'all'}`}
            className={`reveal-item ${swapClass} mt-8 bg-white border border-line rounded-card p-6`}
          >
            <h3 className="font-bold text-lg text-navy-900 mb-1">Пока нет статей в этой категории</h3>
            <p className="text-navy-500 leading-relaxed mb-4 max-w-prose">
              Материал в работе. Посмотрите остальные статьи — там есть разборы кормов и советы по питанию.
            </p>
            <button
              type="button"
              onClick={() => handleCategoryClick(null)}
              className="btn-primary px-6 rounded-xl font-bold"
            >
              Показать все статьи
            </button>
          </div>
        )}

        <div className="reveal-item mt-8" style={{ '--reveal-delay': '300ms' } as CSSProperties}>
          <Link to="/blog" className="btn-primary px-6 rounded-xl font-bold">
            Все статьи
          </Link>
        </div>
      </div>
    </section>
  )
}
