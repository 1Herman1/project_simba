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
  },
  {
    id: '2',
    slug: 'holostik-kormy-obzor',
    title: 'Холистик корма: маркетинг или реальная польза?',
    excerpt: 'Разбираемся что скрывается за словом "холистик" на упаковке и когда такой корм действительно нужен, а когда это просто маркетинг.',
    category: 'Питание',
    readTime: '7 мин',
    date: '10 июня 2026',
  },
  {
    id: '3',
    slug: 'avtozakaz-kak-nastroit',
    title: 'Автозаказ корма: настройте один раз и забудьте',
    excerpt: 'Пошаговая инструкция как настроить регулярную доставку корма, чтобы никогда не оказаться без еды для питомца в самый неподходящий момент.',
    category: 'Советы',
    readTime: '3 мин',
    date: '5 июня 2026',
  },
]

export default function BlogSection() {
  return (
    <section className="bg-blue-50 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-navy-900">Полезные статьи</h2>
          <Link
            to="/blog"
            className="font-medium text-sm text-primary-hover hover:underline transition-colors duration-100"
          >
            Все статьи
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map(article => (
            <Link
              key={article.id}
              to={`/blog/${article.slug}`}
              className="bg-white rounded-card overflow-hidden hover:-translate-y-0.5 hover:shadow-card transition-[transform,box-shadow] duration-100 block border border-line"
            >
              <div className="h-36 bg-primary-tint" />
              <div className="p-5">
                <span className="inline-block bg-blue-100 text-primary-hover text-xs font-medium px-3 py-1 rounded-full mb-3">
                  {article.category}
                </span>
                <h3
                  className="font-bold mb-2 leading-snug text-navy-900"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.title}
                </h3>
                <p
                  className="text-sm mb-4 text-navy-500"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-navy-500">
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
