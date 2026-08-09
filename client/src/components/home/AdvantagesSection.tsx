import { useEffect, useRef, type CSSProperties } from 'react'

function PackageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g className="adv-rock">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      </g>
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="4" y1="3" x2="4" y2="21" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="20" y1="3" x2="20" y2="21" />
      <rect x="1.5" y="12" width="5" height="4" rx="2" fill="currentColor" stroke="none" />
      <rect x="17.5" y="14" width="5" height="4" rx="2" fill="currentColor" stroke="none" />
      <g className="adv-pull">
        <rect x="9.5" y="6" width="5" height="4" rx="2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  )
}

function TagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <g className="adv-swing">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </g>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <g className="adv-sweep">
        <polyline points="12 6 12 12 16 14" />
      </g>
    </svg>
  )
}

/** Два тона на четыре карточки: синий — про товар и сервис, янтарный — про выгоду
    и удобство. Пара вместо четырёх одинаковых плиток. */
const TONE = {
  primary: 'bg-primary-tint text-primary-soft',
  amber: 'bg-amber-50 text-amber-600',
} as const

const advantages = [
  {
    title: 'Спецупаковка корма',
    desc: 'Отправляем заказы в дополнительной защите — плёнка и уголки, чтобы дорогой лечебный корм не пришёл помятым.',
    icon: <PackageIcon />,
    tone: 'primary' as const,
  },
  {
    title: 'Подбор корма',
    desc: 'Подбор под аллергию, возраст, породу и болезни вашего питомца, не занимаемся навязыванием дорогих брендов.',
    icon: <SlidersIcon />,
    tone: 'primary' as const,
  },
  {
    title: 'Экономия',
    desc: 'Не закладываем в цену комиссию Ozon и Wildberries (5–15%). Вы платите только за корм и доставку.',
    icon: <TagIcon />,
    tone: 'amber' as const,
  },
  {
    title: 'Автозаказ',
    desc: 'Настраиваем регулярную доставку корма, который заканчивается. Деньги списываются автоматически — вы ничего не забываете.',
    icon: <ClockIcon />,
    tone: 'amber' as const,
  },
]

/** Фазовый сдвиг: активная фаза жеста = 1400мс, шаг стаггера тоже 1400мс —
    в движении всегда ровно одна иконка. 600мс форы, чтобы жест не наложился
    на scroll-reveal самой секции (420мс). */
const iconDelay = (i: number) => ({ '--adv-delay': `${600 + i * 1400}ms` }) as CSSProperties

/** Петля бесконечная, поэтому её гасим вне вьюпорта: наблюдатель не
    отписывается (в отличие от useReveal) — он и включает, и выключает. */
function useOnScreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => el.classList.toggle('is-onscreen', entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}

export default function AdvantagesSection() {
  const listRef = useOnScreen<HTMLUListElement>()

  return (
    <section id="advantages" aria-labelledby="advantages-title" className="scroll-mt-24 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 id="advantages-title" className="text-2xl font-bold text-navy-900">
          Почему у нас
        </h2>
        <p className="mt-2 text-navy-500 max-w-prose leading-relaxed">
          Что мы делаем иначе, чем маркетплейс
        </p>

        <ul ref={listRef} role="list" className="adv-icons mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {advantages.map((adv, i) => (
            <li key={adv.title} className="bg-white border border-line rounded-card p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <span
                  style={iconDelay(i)}
                  className={`w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center ${TONE[adv.tone]}`}
                >
                  {adv.icon}
                </span>
                <h3 className="font-bold text-lg text-navy-900">{adv.title}</h3>
              </div>
              <p className="mt-3 text-navy-500 leading-relaxed">{adv.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
