import { Link } from 'react-router-dom'
import { getPublished } from '../../content/blog'

function ImagePlaceholderIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

export default function BlogSection() {
  const posts = getPublished().slice(0, 3)

  return (
    <section id="blog" className="scroll-mt-24 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-navy-900">Полезные статьи</h2>
          <Link
            to="/blog"
            className="font-medium text-sm text-navy-700 hover:text-primary-hover transition-colors duration-100 ease"
          >
            Все статьи
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="bg-white border border-line rounded-card overflow-hidden transition-[transform,box-shadow,border-color] duration-100 ease hover:border-primary-soft hover:shadow-card hover:-translate-y-0.5"
            >
              {/* Обложка */}
              {post.cover ? (
                <img src={post.cover} alt={post.title} className="w-full aspect-[16/10] object-cover" />
              ) : (
                <div className="w-full aspect-[16/10] bg-primary-tint flex items-center justify-center text-primary-soft">
                  <ImagePlaceholderIcon />
                </div>
              )}

              {/* Контент */}
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
                  })} · {post.readingMinutes} мин
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
