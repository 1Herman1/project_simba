import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const banners = [
  {
    id: 1,
    title: 'Корм для здоровых почек',
    subtitle: 'Royal Canin Renal — специальное питание для кошек',
    cta: 'Выбрать корм',
    href: '/catalog?category=cats-food',
    bg: 'from-blue-100 to-blue-200',
    textColor: 'text-navy-900',
    accent: 'bg-navy-900 text-white hover:bg-navy-700',
    emoji: '🐱',
  },
  {
    id: 2,
    title: "Новинки от Hill's",
    subtitle: 'Лечебное питание для кошек и собак — теперь в наличии',
    cta: 'Смотреть',
    href: '/catalog?brand=hills',
    bg: 'from-amber-300 to-amber-400',
    textColor: 'text-navy-900',
    accent: 'bg-navy-900 text-white hover:bg-navy-700',
    emoji: '🐾',
  },
  {
    id: 3,
    title: 'Бонусная программа',
    subtitle: 'Накапливай баллы и получай скидки до 5% от каждой покупки',
    cta: 'Узнать больше',
    href: '/profile',
    bg: 'from-navy-700 to-navy-900',
    textColor: 'text-white',
    accent: 'bg-blue-200 text-navy-900 hover:bg-blue-300',
    emoji: '🎁',
  },
]

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  function prev() {
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
  }

  function next() {
    setCurrent((c) => (c + 1) % banners.length)
  }

  const banner = banners[current]

  return (
    <div className="relative overflow-hidden">
      <div
        className={`bg-gradient-to-r ${banner.bg} h-48 md:h-80 flex items-center transition-all duration-500`}
      >
        <div className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between w-full">
          <div className="max-w-lg">
            <h1 className={`text-2xl md:text-4xl font-black mb-2 md:mb-3 ${banner.textColor}`}>
              {banner.title}
            </h1>
            <p className={`text-sm md:text-base mb-4 md:mb-6 opacity-80 ${banner.textColor}`}>
              {banner.subtitle}
            </p>
            <Link
              to={banner.href}
              className={`inline-block px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${banner.accent}`}
            >
              {banner.cta} →
            </Link>
          </div>
          <div className="text-6xl md:text-9xl opacity-30 hidden sm:block select-none">
            {banner.emoji}
          </div>
        </div>
      </div>

      {/* Стрелки */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15,18 9,12 15,6"/>
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white shadow-md flex items-center justify-center transition-all hover:scale-110"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9,18 15,12 9,6"/>
        </svg>
      </button>

      {/* Точки */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
