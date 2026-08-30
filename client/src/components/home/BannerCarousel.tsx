import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'

// dotColor задаётся на слайд, а не глобально: фон меняется от светло-голубого
// до navy-900, и одна константа не может остаться читаемой на обоих.
const banners = [
  {
    id: 1,
    title: 'Корм для здоровых почек',
    subtitle: 'Royal Canin Renal — специальное питание для кошек',
    cta: 'Выбрать корм',
    href: '/catalog?category=cats-food',
    bg: 'from-blue-100 to-blue-200',
    textColor: 'text-navy-900',
    subtitleColor: 'text-navy-500',
    accent: 'bg-primary text-white hover:bg-primary-hover',
    dot: { active: 'bg-navy-700', idle: 'bg-navy-700/40 group-hover:bg-navy-700/70' },
    image: '/pets/cat.png',
    imageAlt: '',
  },
  {
    id: 2,
    title: "Новинки от Hill's",
    subtitle: 'Лечебное питание для кошек и собак — теперь в наличии',
    cta: 'Смотреть',
    href: '/catalog?brand=hills',
    bg: 'from-amber-300 to-amber-400',
    textColor: 'text-navy-900',
    subtitleColor: 'text-navy-700',
    accent: 'bg-primary text-white hover:bg-primary-hover',
    dot: { active: 'bg-navy-900', idle: 'bg-navy-900/40 group-hover:bg-navy-900/70' },
    image: '/pets/dogwithcat.png',
    imageAlt: '',
  },
  {
    id: 3,
    title: 'Бонусная программа',
    subtitle: 'Накапливайте бонусы и получайте скидку до 5% с каждой покупки',
    cta: 'Узнать больше',
    href: '/profile',
    bg: 'from-navy-700 to-navy-900',
    textColor: 'text-white',
    subtitleColor: 'text-blue-100',
    accent: 'bg-primary-tint text-navy-900 hover:bg-primary-soft',
    dot: { active: 'bg-white', idle: 'bg-white/50 group-hover:bg-white/80' },
    image: '/pets/smiledog.png',
    imageAlt: '',
  },
]

const SLIDE_MS = 6500

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, SLIDE_MS)
    return () => clearInterval(timer)
  }, [isPaused])

  function prev() {
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
  }

  function next() {
    setCurrent((c) => (c + 1) % banners.length)
  }

  const banner = banners[current]

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* h-56 на мобиле, а не h-48: зона нажатия точек внизу занимает 44px, и на
          192px кнопка CTA уходила под них. */}
      <div className={`bg-gradient-to-r ${banner.bg} h-56 md:h-80 flex items-center`}>
        <div
          key={banner.id}
          className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between w-full h-full animate-fade-in"
        >
          <div className="max-w-lg pt-4 pb-10 md:py-6">
            {/* h2, а не h1: заголовок слайда меняется по таймеру и не может быть
                главным заголовком страницы. Постоянный h1 — в HomePage. */}
            <h2 className={`text-2xl md:text-4xl font-black mb-2 md:mb-3 ${banner.textColor}`}>
              {banner.title}
            </h2>
            <p className={`text-sm md:text-base mb-4 md:mb-6 ${banner.subtitleColor}`}>
              {banner.subtitle}
            </p>
            <Link
              to={banner.href}
              className={`inline-block px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${banner.accent}`}
            >
              {banner.cta}
            </Link>
          </div>

          {/* Питомец занимает правую половину: без него на десктопе оставалась
              пустая полоса градиента, а магазин терял товар/образ на первом
              экране. На мобиле прячем — там места нет. */}
          <img
            src={banner.image}
            alt={banner.imageAlt}
            aria-hidden="true"
            width={520}
            height={320}
            fetchPriority={current === 0 ? 'high' : 'auto'}
            className="hidden md:block h-full w-auto max-w-[48%] object-contain object-bottom select-none pointer-events-none"
          />
        </div>
      </div>

      {/* Стрелки. На мобиле скрыты: там они вставали поверх заголовка —
          для переключения хватает точек. */}
      <button
        type="button"
        onClick={prev}
        aria-label="Предыдущий баннер"
        className="hidden md:flex absolute left-3 top-0 bottom-0 my-auto w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-md items-center justify-center transition-[background-color,box-shadow]"
      >
        <ArrowLeftIcon className="w-4.5 h-4.5 ico-nudge ico-nudge--back" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Следующий баннер"
        className="hidden md:flex absolute right-3 top-0 bottom-0 my-auto w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-md items-center justify-center transition-[background-color,box-shadow]"
      >
        <ArrowRightIcon className="w-4.5 h-4.5 ico-nudge" />
      </button>

      {/* Точки. Видимый размер прежний, но зона нажатия — 44px по MASTER:
          сама точка внутри кнопки-обёртки, а не является ею. */}
      <div className="absolute bottom-0 inset-x-0 flex justify-center">
        {banners.map((b, i) => (
          <button
            type="button"
            key={b.id}
            onClick={() => setCurrent(i)}
            className="group w-11 h-11 flex items-center justify-center"
            aria-label={`Перейти к баннеру ${i + 1}`}
            aria-current={i === current}
          >
            <span
              className={`block h-2 rounded-full transition-[width,background-color] ${
                i === current ? `w-6 ${banner.dot.active}` : `w-2 ${banner.dot.idle}`
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
