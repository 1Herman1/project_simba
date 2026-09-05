import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'
import { bannersApi, type Banner } from '../../lib/api'

// Оформление слайда в базе не хранится — владелец меняет содержание, а не
// градиенты. Схемы идут по кругу: dotColor задаётся на слайд, а не глобально,
// потому что фон меняется от светло-голубого до navy-900, и одна константа не
// может остаться читаемой на обоих.
const THEMES = [
  {
    bg: 'from-blue-100 to-blue-200',
    textColor: 'text-navy-900',
    subtitleColor: 'text-navy-500',
    accent: 'bg-primary text-white hover:bg-primary-hover',
    dot: { active: 'bg-navy-700', idle: 'bg-navy-700/40 group-hover:bg-navy-700/70' },
  },
  {
    bg: 'from-amber-300 to-amber-400',
    textColor: 'text-navy-900',
    subtitleColor: 'text-navy-700',
    accent: 'bg-primary text-white hover:bg-primary-hover',
    dot: { active: 'bg-navy-900', idle: 'bg-navy-900/40 group-hover:bg-navy-900/70' },
  },
  {
    bg: 'from-navy-700 to-navy-900',
    textColor: 'text-white',
    subtitleColor: 'text-blue-100',
    accent: 'bg-primary-tint text-navy-900 hover:bg-primary-soft',
    dot: { active: 'bg-white', idle: 'bg-white/50 group-hover:bg-white/80' },
  },
]

const SLIDE_MS = 6500

/** Телефон и компьютер получают разные файлы: широкая десктопная картинка на
    узком экране либо обрезается по краям, либо мельчает до нечитаемости.
    Точка переключения — та же, что у Tailwind md (768px). */
function BannerImage({
  banner,
  priority,
  alt = '',
  className,
}: {
  banner: Banner
  priority: boolean
  alt?: string
  className: string
}) {
  return (
    <picture>
      {banner.imageMobile && <source media="(max-width: 767px)" srcSet={banner.imageMobile} />}
      <img
        src={banner.image}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        fetchPriority={priority ? 'high' : 'auto'}
        className={className}
      />
    </picture>
  )
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    bannersApi
      .list({ page: 'home', position: 'main_slider' })
      .then((res) => setBanners(res.data))
      // Выдумывать баннеры при сбое нельзя: секция просто не показывается.
      .catch(() => setBanners([]))
  }, [])

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

  // Ни одного включённого баннера — секции на главной просто нет.
  if (banners.length === 0) return null

  const banner = banners[current]
  const theme = THEMES[current % THEMES.length]

  return (
    <section
      id="banners"
      aria-label="Акции и предложения"
      className="scroll-mt-24 relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* h-56 на мобиле, а не h-48: зона нажатия точек внизу занимает 44px, и на
          192px кнопка CTA уходила под них. */}
      {banner.showText ? (
        <div className={`bg-gradient-to-r ${theme.bg} h-56 md:h-80 flex items-center`}>
          <div
            key={banner.id}
            className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between w-full h-full animate-fade-in"
          >
            <div className="max-w-lg pt-4 pb-10 md:py-6">
              {/* h2, а не h1: заголовок слайда меняется по таймеру и не может быть
                  главным заголовком страницы. Постоянный h1 — в HomePage. */}
              <h2 className={`text-2xl md:text-4xl font-black mb-2 md:mb-3 ${theme.textColor}`}>
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className={`text-sm md:text-base mb-4 md:mb-6 ${theme.subtitleColor}`}>
                  {banner.subtitle}
                </p>
              )}
              <Link
                to={banner.link ?? "/catalog"}
                className={`inline-block px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors ${theme.accent}`}
              >
                {banner.buttonText ?? "Смотреть"}
              </Link>
            </div>

            {/* Питомец занимает правую половину: без него на десктопе оставалась
                пустая полоса градиента, а магазин терял товар/образ на первом
                экране. На мобиле прячем — там места нет. */}
            <BannerImage
              banner={banner}
              priority={current === 0}
              className="hidden md:block h-full w-auto max-w-[48%] object-contain object-bottom select-none pointer-events-none"
            />
          </div>
        </div>
      ) : (
        /* Готовый баннер: текст уже нарисован на картинке, накладывать свой
           поверх нельзя. Слайд целиком — одна ссылка, а заголовок из админки
           уходит в alt, чтобы баннер не был немым для чтения с экрана. */
        <Link key={banner.id} to={banner.link ?? "/catalog"} className="block animate-fade-in">
          <BannerImage
            banner={banner}
            priority={current === 0}
            alt={banner.title}
            className="w-full h-56 md:h-80 object-cover"
          />
        </Link>
      )}

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
                i === current ? `w-6 ${theme.dot.active}` : `w-2 ${theme.dot.idle}`
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
