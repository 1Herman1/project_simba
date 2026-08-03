import { useParams, Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'
import { getPostBySlug, getPublished } from '../content/blog'
import NotFoundPage from './NotFoundPage'

function ImagePlaceholderIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()

  if (!slug) {
    return <NotFoundPage />
  }

  const post = getPostBySlug(slug)

  // Черновик по прямой ссылке открываться не должен: у него нет тела, и это
  // была бы пустая страница, которую поисковик засчитает как «тонкую».
  if (!post || post.status !== 'published' || !post.body) {
    return <NotFoundPage />
  }

  useMetaTags({
    title: post.metaTitle,
    description: post.metaDescription,
  })

  const publishedPosts = getPublished()
  const allPosts = publishedPosts.filter((p) => p.slug !== slug)

  // Получаем посты из той же категории
  const sameCategoryPosts = allPosts.filter((p) =>
    p.categories.some((cat) => post.categories.includes(cat))
  )

  // Если меньше 3 - добавляем свежие посты
  let relatedPosts = sameCategoryPosts.slice(0, 3)
  if (relatedPosts.length < 3) {
    const freshPosts = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    relatedPosts = [...relatedPosts, ...freshPosts.filter((p) => !relatedPosts.includes(p))].slice(0, 3)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      {/* Хлебная крошка */}
      <Link to="/blog" className="inline-flex items-center gap-2 text-primary-hover hover:underline mb-6 text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Блог
      </Link>

      {/* Категории */}
      <p className="text-xs uppercase tracking-wide text-primary-hover font-semibold mb-3">{post.categories.join(' · ')}</p>

      {/* Заголовок */}
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-4">{post.title}</h1>

      {/* Дата и время чтения */}
      <p className="text-navy-500 tabular-nums mb-8">
        {new Date(post.date + 'T00:00:00Z').toLocaleDateString('ru-RU', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })} · {post.readingMinutes} мин чтения
      </p>

      {/* Обложка */}
      {post.cover ? (
        <img src={post.cover} alt={post.title} className="w-full aspect-[16/9] object-cover rounded-card mb-10" />
      ) : (
        <div className="w-full aspect-[16/9] bg-primary-tint flex items-center justify-center text-primary-soft rounded-card mb-10">
          <ImagePlaceholderIcon />
        </div>
      )}

      {/* Тело статьи */}
      <article
        className="text-navy-500 leading-relaxed mb-12
          [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-navy-900 [&>h2]:mt-10 [&>h2]:mb-3
          [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-navy-900 [&>h3]:mt-6 [&>h3]:mb-2
          [&>p]:mb-4
          [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
          [&>li]:mb-1
          [&_a]:text-primary-hover [&_a]:underline"
      >
        {post.body && post.body()}
      </article>

      {/* Читайте также */}
      {relatedPosts.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-navy-900 mb-6">Читайте также</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.slug}
                to={`/blog/${relatedPost.slug}`}
                className="bg-white border border-line rounded-card overflow-hidden transition-[transform] duration-100 ease hover:border-primary-soft hover:shadow-card hover:-translate-y-0.5"
              >
                {/* Обложка */}
                {relatedPost.cover ? (
                  <img src={relatedPost.cover} alt={relatedPost.title} className="w-full aspect-[16/10] object-cover" />
                ) : (
                  <div className="w-full aspect-[16/10] bg-primary-tint flex items-center justify-center text-primary-soft">
                    <ImagePlaceholderIcon />
                  </div>
                )}

                {/* Контент */}
                <div className="p-5">
                  {/* Категории */}
                  <p className="text-xs uppercase tracking-wide text-primary-hover font-semibold mb-2">
                    {relatedPost.categories.join(' · ')}
                  </p>

                  {/* Заголовок */}
                  <h3 className="font-bold text-lg text-navy-900 mb-2 line-clamp-2">{relatedPost.title}</h3>

                  {/* Описание */}
                  <p className="text-sm text-navy-500 mb-4 line-clamp-2">{relatedPost.excerpt}</p>

                  {/* Дата и время чтения */}
                  <p className="text-sm text-navy-500 tabular-nums">
                    {new Date(relatedPost.date + 'T00:00:00Z').toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })} · {relatedPost.readingMinutes} мин
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4 gap-3">
        <p className="text-navy-500">Не знаете, какой корм подойдёт питомцу — </p>
        <Link
          to="/questionnaire"
          className="bg-primary text-white hover:bg-primary-hover rounded-xl px-6 min-h-11 font-bold transition-colors duration-100 ease flex items-center justify-center w-full sm:w-auto whitespace-nowrap"
        >
          Подобрать за минуту
        </Link>
      </div>
    </div>
  )
}
