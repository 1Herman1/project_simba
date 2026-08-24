import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'

const banners = [
  {
    id: 1,
    title: 'Корм для здоровых почек',
    subtitle: 'Royal Canin Renal — специальное питание для кошек',
    cta: 'Выбрать корм',
    href: '/catalog?category=cats-food',
    bg: 'from-blue-100 to-blue-200',
    textColor: 'text-navy-900',
    accent: 'bg-primary text-white hover:bg-primary-hover',
  },
  {
    id: 2,
    title: "Новинки от Hill's",
    subtitle: 'Лечебное питание для кошек и собак — теперь в наличии',
    cta: 'Смотреть',
    href: '/catalog?brand=hills',
    bg: 'from-amber-300 to-amber-400',
    textColor: 'text-navy-900',
    accent: 'bg-primary text-white hover:bg-primary-hover',
  },
  {
    id: 3,
    title: 'Бонусная программа',
    subtitle: 'Накапливайте бонусы и получайте скидку до 5% с каждой покупки',
    cta: 'Узнать больше',
    href: '/profile',
    bg: 'from-navy-700 to-navy-900',
    textColor: 'text-white',
    accent: 'bg-primary-tint text-navy-900 hover:bg-primary-soft',
  },
]

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isHovered])

  function prev() {
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
  }

  function next() {
    setCurrent((c) => (c + 1) % banners.length)
  }

  const banner = banners[current]

  return (
    <div className="relative overflow-hidden" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div
        className={`bg-gradient-to-r ${banner.bg} h-48 md:h-80 flex items-center transition-opacity duration-500`}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between w-full">
          <div className="max-w-lg">
            {/* h2, а не h1: заголовок слайда меняется каждые 4 секунды и не может
                быть главным заголовком страницы. Постоянный h1 — в HomePage. */}
            <h2 className={`text-2xl md:text-4xl font-black mb-2 md:mb-3 ${banner.textColor}`}>
              {banner.title}
            </h2>
            <p className={`text-sm md:text-base mb-4 md:mb-6 opacity-80 ${banner.textColor}`}>
              {banner.subtitle}
            </p>
            <Link
              to={banner.href}
              className={`inline-block px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${banner.accent}`}
            >
              {banner.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Стрелки */}
      <button
        type="button"
        onClick={prev}
        aria-label="Предыдущий баннер"
        className="absolute left-3 top-0 bottom-0 my-auto w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-[background-color,box-shadow]"
      >
        <ArrowLeftIcon className="w-4.5 h-4.5 ico-nudge ico-nudge--back" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Следующий баннер"
        className="absolute right-3 top-0 bottom-0 my-auto w-11 h-11 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-[background-color,box-shadow]"
      >
        <ArrowRightIcon className="w-4.5 h-4.5 ico-nudge" />
      </button>

      {/* Точки */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2">
        {banners.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-[width,background-color] ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Перейти к баннеру ${i + 1}`}
            aria-current={i === current}
          />
        ))}
      </div>
    </div>
  )
}
