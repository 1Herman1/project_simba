import { Link } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'

const categories = [
  {
    id: 'dogs',
    label: 'СОБАКИ',
    href: '/catalog?species=dog',
    image: '/categories/dogs.png',
    fit: 'contain' as const,
  },
  {
    id: 'cats',
    label: 'КОТЫ И КОШКИ',
    href: '/catalog?species=cat',
    image: '/categories/cats.png',
    fit: 'contain' as const,
  },
  {
    id: 'vet',
    label: 'ВЕТАПТЕКА',
    href: '/catalog?category=care',
    image: '/categories/vet.png',
    // Нос и лапа — фотография без прозрачности: заполняет плитку целиком.
    fit: 'cover' as const,
  },
]

export default function CategoryTiles() {
  const groupRef = useReveal<HTMLDivElement>()

  return (
    <section id="categories" className="scroll-mt-24 py-12 md:py-16">
      <div ref={groupRef} className="reveal-group max-w-7xl mx-auto px-4">
        <h2 className="reveal-item text-2xl font-bold text-navy-900">Категории</h2>

        {/* Три равные плитки в сетку: мобиль — вертикальный стек, планшет+ — три в ряд.
            Пропорция ~1:1.2, так что на 3 колонки aspect-ratio[4/5] = 80% по высоте. */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={cat.href}
              aria-label={cat.label}
              /* Серая плитка и радиус 32px — по референсу текущего сайта клиента
                 (решение владельца, исключение из шкалы радиусов MASTER). */
              className="reveal-item group relative block overflow-hidden rounded-[32px] bg-[#D9D9D9] aspect-[4/3] sm:aspect-[4/5] transition-transform duration-[160ms] ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-card"
            >
              {/* Вырезанный объект на прозрачном фоне, прижат к низу и центру */}
              <img
                src={cat.image}
                alt=""
                aria-hidden="true"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
                className={
                  cat.fit === 'cover'
                    ? 'pointer-events-none select-none absolute inset-0 h-full w-full object-cover'
                    : 'pointer-events-none select-none absolute inset-x-0 bottom-0 h-[88%] mx-auto w-auto object-contain'
                }
              />

              {/* Подпись внизу поверх затемняющего градиента — читается и на светлой шерсти */}
              <div className="absolute inset-x-0 bottom-0 pt-16 pb-6 flex items-end justify-center bg-gradient-to-t from-black/55 to-transparent">
                <span className="text-center uppercase tracking-wide font-semibold text-lg lg:text-xl text-white">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
