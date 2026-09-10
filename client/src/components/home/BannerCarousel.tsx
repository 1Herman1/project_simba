import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon, ArrowRightIcon } from '../icons'
import { bannersApi, type Banner } from '../../lib/api'

interface DragState {
  startX: number
  currentX: number
  startTime: number
  isDragging: boolean
}

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
const DRAG_THRESHOLD = 0.12 // 12% ширины трека
const DRAG_THRESHOLD_PX = 6 // 6px для блокирования клика
const VELOCITY_THRESHOLD = 0.5 // px/мс

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
        fetchPriority={priority ? 'high' : 'auto' as any}
        draggable={false}
        className={className}
      />
    </picture>
  )
}

interface SlideProps {
  banner: Banner
  index: number
  isActive: boolean
  theme: typeof THEMES[0]
  onNavigate?: (index: number) => void
  isDragging?: boolean
}

function Slide({ banner, index, isActive, theme, onNavigate, isDragging }: SlideProps) {
  return (
    <div
      className="carousel-slide w-[82%] md:w-[86%] shrink-0"
      role="presentation"
      aria-hidden={!isActive}
      onClick={() => !isActive && onNavigate?.(index)}
      style={{
        opacity: isActive ? 1 : 0.55,
        transform: isActive ? 'scale(1)' : 'scale(0.97)',
        transition: isDragging ? 'none' : 'opacity 300ms var(--ease-out), transform 300ms var(--ease-out)',
        cursor: !isActive ? 'pointer' : 'default',
      }}
    >
      {banner.showText ? (
        <div className={`bg-gradient-to-r ${theme.bg} h-56 md:h-80 flex items-center rounded-card`}>
          <div
            className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between w-full h-full animate-fade-in"
            tabIndex={isActive ? 0 : -1}
          >
            <div className="max-w-lg pt-4 pb-10 md:py-6">
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
                tabIndex={isActive ? 0 : -1}
              >
                {banner.buttonText ?? "Смотреть"}
              </Link>
            </div>

            <BannerImage
              banner={banner}
              priority={isActive}
              className="hidden md:block h-full w-auto max-w-[48%] object-contain object-bottom select-none pointer-events-none"
            />
          </div>
        </div>
      ) : (
        <Link
          to={banner.link ?? "/catalog"}
          className="block overflow-hidden rounded-card animate-fade-in aspect-[1520/1035] md:aspect-[2/1]"
          tabIndex={isActive ? 0 : -1}
          onClick={(e) => {
            if (!isActive) {
              e.preventDefault()
            }
          }}
        >
          <BannerImage
            banner={banner}
            priority={isActive}
            alt={banner.title}
            className="w-full h-full object-cover"
          />
        </Link>
      )}
    </div>
  )
}

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [dragX, setDragX] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const dragStateRef = useRef<DragState>({ startX: 0, currentX: 0, startTime: 0, isDragging: false })
  const trackRef = useRef<HTMLDivElement>(null)
  const lastDragDistanceRef = useRef(0)

  useEffect(() => {
    bannersApi
      .list({ page: 'home', position: 'main_slider' })
      .then((res) => setBanners(res.data))
      .catch(() => setBanners([]))
  }, [])

  // Measure container width and track changes with ResizeObserver
  useEffect(() => {
    const track = trackRef.current
    if (!track?.parentElement) return

    const container = track.parentElement
    setContainerWidth(container.offsetWidth)

    const resizeObserver = new ResizeObserver(() => {
      setContainerWidth(container.offsetWidth)
    })
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  // Listen to pointer events on document to catch pointerup outside element
  useEffect(() => {
    const handleDocumentPointerMove = (e: PointerEvent): void => {
      if (!dragStateRef.current.isDragging) return
      handlePointerMove(e.clientX)
    }

    const handleDocumentPointerUp = (): void => {
      if (!dragStateRef.current.isDragging) return
      handlePointerUp()
    }

    document.addEventListener('pointermove', handleDocumentPointerMove)
    document.addEventListener('pointerup', handleDocumentPointerUp)
    document.addEventListener('pointercancel', handleDocumentPointerUp)

    return () => {
      document.removeEventListener('pointermove', handleDocumentPointerMove)
      document.removeEventListener('pointerup', handleDocumentPointerUp)
      document.removeEventListener('pointercancel', handleDocumentPointerUp)
    }
  }, [current, banners.length])

  useEffect(() => {
    if (isPaused) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length)
    }, SLIDE_MS)
    return () => clearInterval(timer)
  }, [isPaused, banners.length])

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>): void {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'touch' && e.pointerType !== 'pen') return

    const track = trackRef.current
    if (!track) return

    track.setPointerCapture(e.pointerId)
    dragStateRef.current = {
      startX: e.clientX,
      currentX: e.clientX,
      startTime: Date.now(),
      isDragging: true,
    }
    setIsPaused(true)
    setIsAnimating(false)
  }

  function handlePointerMove(clientX: number): void {
    const state = dragStateRef.current
    if (!state.isDragging) return

    const track = trackRef.current
    if (!track) return

    state.currentX = clientX

    let dx = state.currentX - state.startX
    lastDragDistanceRef.current = dx

    // Rubber-banding на границах
    const isAtStart = current === 0
    const isAtEnd = current === banners.length - 1

    if ((isAtStart && dx > 0) || (isAtEnd && dx < 0)) {
      dx *= 0.35
    }

    setDragX(dx)
  }


  function handlePointerUp(): void {
    const state = dragStateRef.current
    if (!state.isDragging) return

    const track = trackRef.current
    if (!track) {
      state.isDragging = false
      return
    }

    // Захват указателя браузер снимает сам на pointerup/pointercancel.
    state.isDragging = false

    const trackWidth = track.offsetWidth
    const dx = state.currentX - state.startX
    const timeDelta = Date.now() - state.startTime
    const velocity = timeDelta > 0 ? Math.abs(dx) / timeDelta : 0

    const thresholdPx = trackWidth * DRAG_THRESHOLD
    let nextIndex = current

    if (Math.abs(dx) > thresholdPx || velocity > VELOCITY_THRESHOLD) {
      if (dx < 0) {
        // Свайп влево — следующий слайд
        nextIndex = (current + 1) % banners.length
      } else {
        // Свайп вправо — предыдущий слайд
        nextIndex = (current - 1 + banners.length) % banners.length
      }
    }

    setCurrent(nextIndex)
    setDragX(0)
    setIsAnimating(true)
    setIsPaused(false)
  }


  function handleClickCapture(e: React.MouseEvent): void {
    if (Math.abs(lastDragDistanceRef.current) > DRAG_THRESHOLD_PX) {
      e.preventDefault()
      e.stopPropagation()
      lastDragDistanceRef.current = 0
    }
  }

  function prev(): void {
    setCurrent((c) => (c - 1 + banners.length) % banners.length)
    setIsAnimating(true)
  }

  function next(): void {
    setCurrent((c) => (c + 1) % banners.length)
    setIsAnimating(true)
  }

  if (banners.length === 0) return null

  const theme = THEMES[current % THEMES.length]
  const dot = banners[current].showText ? theme.dot : THEMES[0].dot

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Peek mode calculation: active slide centered with neighbors visible at 7% (desktop) or 4% (mobile)
  const isMobile = window.innerWidth < 768
  const peekPercent = isMobile ? 9 : 7
  // Ширина слайда = 100% минус два поля выглядывания, иначе поля неравные.
  const slideWidthPercent = 100 - peekPercent * 2
  const gapPx = 16 // gap-4 in Tailwind

  // Use measured containerWidth from state, fallback to window width if not measured yet
  const effectiveContainerW = containerWidth || window.innerWidth
  const slideWidthPx = (slideWidthPercent / 100) * effectiveContainerW
  const peekPx = (peekPercent / 100) * effectiveContainerW

  // Position calculation: slide i should have its left edge at peekPx from container left
  const slidePositionPx = current * (slideWidthPx + gapPx) - peekPx + dragX

  const shouldTransition = isAnimating && !dragStateRef.current.isDragging && !prefersReducedMotion

  return (
    <section
      id="banners"
      aria-label="Акции и предложения"
      className="scroll-mt-24 relative overflow-hidden bg-white"
      onMouseEnter={() => !dragStateRef.current.isDragging && setIsPaused(true)}
      onMouseLeave={() => !dragStateRef.current.isDragging && setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex cursor-grab active:cursor-grabbing select-none gap-4"
          style={{
            touchAction: 'pan-y',
            // В пикселях, не в процентах: для первого слайда смещение отрицательное,
            // и `-${-7}%` давал невалидный `--7%` — трансформ молча отбрасывался.
            transform: `translateX(${-slidePositionPx}px)`,
            transition: shouldTransition ? 'transform 300ms var(--ease-out)' : 'none',
          }}
          onPointerDown={handlePointerDown}
          onClickCapture={handleClickCapture}
          aria-roledescription="carousel"
        >
          {banners.map((banner, index) => (
            <Slide
              key={banner.id}
              banner={banner}
              index={index}
              isActive={index === current}
              isDragging={dragStateRef.current.isDragging}
              theme={THEMES[index % THEMES.length]}
              onNavigate={(newIndex) => {
                setCurrent(newIndex)
                setIsAnimating(true)
              }}
            />
          ))}
        </div>
      </div>

      {/* Стрелки */}
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

      {/* Точки */}
      <div className="absolute bottom-0 inset-x-0 flex justify-center pointer-events-none">
        {banners.map((b, i) => (
          <button
            type="button"
            key={b.id}
            onClick={() => {
              setCurrent(i)
              setIsAnimating(true)
            }}
            className="group w-11 h-11 flex items-center justify-center pointer-events-auto"
            aria-label={`Перейти к баннеру ${i + 1}`}
            aria-current={i === current ? 'page' : undefined}
          >
            <span
              className={`block h-2 rounded-full transition-[width,background-color] ${
                i === current ? `w-6 ${dot.active}` : `w-2 ${dot.idle}`
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}
