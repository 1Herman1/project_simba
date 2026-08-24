import { Link } from 'react-router-dom'

const categories = [
  {
    num: '01',
    title: 'Уход за лицом',
    shortLabel: 'Лицо',
    desc: 'Кремы, сыворотки и маски ISSEIMI для домашнего и кабинетного ухода.',
    slug: 'kremy-dlya-litsa-i-shei',
    bgColor: 'bg-accent',
    textColor: 'text-foreground',
  },
  {
    num: '02',
    title: 'Сыворотки',
    shortLabel: 'Сыворотки',
    desc: 'Активные концентраты для интенсивного ухода.',
    slug: 'syvorotki',
    bgColor: 'bg-border',
    textColor: 'text-foreground',
  },
  {
    num: '03',
    title: 'Маски',
    shortLabel: 'Маски',
    desc: 'Питающие и очищающие маски для лица.',
    slug: 'maski',
    bgColor: 'bg-foreground',
    textColor: 'text-accent',
  },
  {
    num: '04',
    title: 'Наборы',
    shortLabel: 'Наборы',
    desc: 'Готовые программы ухода и подарочные боксы.',
    slug: 'nabory',
    bgColor: 'bg-muted',
    textColor: 'text-foreground',
  },
]

export function CategoryAccordion() {
  return (
    <section id="catalog" className="bg-background py-20 md:py-32">
      <div className="container-app">
        <h2 className="text-h2 font-heading font-bold mb-12 md:mb-16">
          Категории
        </h2>

        {/* Accordion: flex-grow animation on hover/focus */}
        <div
          className="flex gap-3 md:gap-4 h-96 md:h-full"
          style={{ minHeight: '460px' }}
        >
          {categories.map((cat, idx) => (
            <Link
              key={cat.slug}
              to={`/catalog/${cat.slug}`}
              className={`
                relative flex-1 min-w-0 overflow-hidden rounded-block
                transition-[flex] duration-300 ease-out
                group
                ${cat.bgColor} ${cat.textColor}
                hover:flex-grow-[2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
              `}
              style={{
                flex: idx === 0 ? '1.5 1 0' : '1 1 0',
              }}
            >
              {/* Spine (vertical) */}
              <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-12 md:w-16 flex-shrink-0 pointer-events-none">
                <div className="writing-mode-vertical text-label md:text-body-sm font-heading font-bold opacity-60 rotate-180">
                  {cat.title}
                </div>
              </div>

              {/* Number */}
              <div
                className="absolute left-0 bottom-4 md:bottom-6 w-12 md:w-16 text-center text-label font-heading font-bold opacity-50 pointer-events-none"
              >
                {cat.num}
              </div>

              {/* Open content */}
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-start opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="text-label font-bold opacity-70 mb-2">
                  {cat.num} · {cat.shortLabel}
                </div>
                <h3 className="text-h3 font-heading font-bold mb-3">
                  {cat.title}
                </h3>
                <p className="text-body leading-body opacity-90 mb-4">
                  {cat.desc}
                </p>
                <div className="mt-auto text-body font-bold opacity-60">→</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
