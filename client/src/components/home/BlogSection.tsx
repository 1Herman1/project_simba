import { Link } from 'react-router-dom'

const articles = [
  {
    id: '1',
    slug: 'pochechnaya-nedostatochnost-u-koshek',
    title: 'Почечная недостаточность у кошек: какой корм выбрать?',
    excerpt: "Разбираем состав лечебных кормов Royal Canin Renal, Hill's k/d и Purina NF. Чем они отличаются и какой лучше подойдёт вашей кошке.",
    category: 'Здоровье',
    readTime: '5 мин',
    date: '15 июня 2026',
    bgColor: '#E8F4FD',
  },
  {
    id: '2',
    slug: 'holostik-kormy-obzor',
    title: 'Холистик корма: маркетинг или реальная польза?',
    excerpt: 'Разбираемся что скрывается за словом "холистик" на упаковке и когда такой корм действительно нужен, а когда это просто маркетинг.',
    category: 'Питание',
    readTime: '7 мин',
    date: '10 июня 2026',
    bgColor: '#E8F5E9',
  },
  {
    id: '3',
    slug: 'avtozakaz-kak-nastroit',
    title: 'Автозаказ корма: настройте один раз и забудьте',
    excerpt: 'Пошаговая инструкция как настроить регулярную доставку корма, чтобы никогда не оказаться без еды для питомца в самый неподходящий момент.',
    category: 'Советы',
    readTime: '3 мин',
    date: '5 июня 2026',
    bgColor: '#FFF8E1',
  },
]

export default function BlogSection() {
  return (
    <section className="py-12 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold" style={{ color: '#1A3A5C' }}>Полезные статьи</h2>
          <Link
            to="/blog"
            className="font-medium transition-colors text-sm"
            style={{ color: '#A4D4FC' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#7AB8E8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#A4D4FC')}
          >
            Все статьи
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="bg-white rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 block"
            >
              <div
                className="h-36"
                style={{ backgroundColor: article.bgColor }}
              />
              <div className="p-5">
                <span className="inline-block bg-blue-100 text-blue-500 text-xs font-medium px-3 py-1 rounded-full mb-3">
                  {article.category}
                </span>
                <h3
                  className="font-bold mb-2 leading-snug"
                  style={{
                    color: '#1A3A5C',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{
                    color: '#4A6A8C',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs" style={{ color: '#8AAABF' }}>
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime} чтения</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
