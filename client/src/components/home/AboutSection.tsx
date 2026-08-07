import { type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { LEGAL } from '../../lib/contacts'
import { useReveal } from '../../hooks/useReveal'
import CountUp from '../CountUp'

/** Фото основательницы/склада. null — фото ещё нет, показываем брендовую панель.
    Когда появится: { src: '/about/alina.jpg', alt: 'Алина, основательница Симбы' } */
const FOUNDER_PHOTO: { src: string; alt: string } | null = null

const PULL_QUOTE = '«Беру только те корма, которые готова дать своим питомцам»'

/** Каскад секции: шаг 60мс, кап 4 ступени. Текст и визуал делят одну ступень —
    разнородная группа стартует в общем окне, иначе сцена рассыпается. */
const step = (i: number) => ({ '--reveal-delay': `${Math.min(i, 3) * 60}ms` }) as CSSProperties

function FounderVisual() {
  if (FOUNDER_PHOTO) {
    return (
      <figure className="h-full">
        <img
          src={FOUNDER_PHOTO.src}
          alt={FOUNDER_PHOTO.alt}
          loading="lazy"
          decoding="async"
          className="w-full aspect-[4/3] md:aspect-auto md:h-full md:min-h-[320px] object-cover rounded-card"
        />
        <figcaption className="mt-3 text-sm text-navy-500 leading-relaxed">
          {PULL_QUOTE} — Алина, основательница
        </figcaption>
      </figure>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-card bg-primary-tint p-6 aspect-[4/3] md:aspect-auto md:h-full md:min-h-[320px] flex items-start">
      <p className="relative z-10 max-w-[62%] text-lg leading-relaxed font-semibold text-navy-900">
        {PULL_QUOTE}
      </p>
      <img
        src="/pets/smiledog.png"
        alt=""
        aria-hidden="true"
        loading="lazy"
        onError={(e) => { e.currentTarget.style.display = 'none' }}
        className="pointer-events-none select-none absolute bottom-0 right-0 h-[72%] max-w-[46%] object-contain object-bottom"
      />
    </div>
  )
}

export default function AboutSection() {
  /** Секция подключена без обёртки <Reveal> — is-visible группе ставит свой хук. */
  const groupRef = useReveal<HTMLDivElement>()

  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-24 py-12 md:py-16">
      <div ref={groupRef} className="reveal-group max-w-7xl mx-auto px-4">
        <div className="reveal-item" style={step(0)}>
          <p className="text-sm font-semibold uppercase tracking-wide text-navy-500">О компании</p>
          <h2 id="about-title" className="mt-1 text-2xl font-bold text-navy-900">Кто мы</h2>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-8 md:items-center">
          {/* Текст слева */}
          <div>
            <p className="reveal-item text-navy-500 max-w-prose leading-relaxed" style={step(1)}>
              Симба начался с простой собственной проблемы: найти импортный корм для своей собаки — гарантированно оригинальный, со свежими сроками и по честной цене, — и это оказалось сложнее, чем должно быть. Мне удалось найти корм для себя, и мы решили помочь людям со схожей проблемой.
            </p>
            <p className="reveal-item mt-4 text-navy-500 max-w-prose leading-relaxed" style={step(1)}>
              Мы осознанно продаём узкий ассортимент: Farmina, Monge и ещё несколько брендов, за которые готовы отвечать. Все поставки — напрямую от официальных дистрибьюторов. Каждую партию мы проверяем на приёмке: сроки годности, целостность упаковки, документы.
            </p>
            <p className="reveal-item mt-4 text-navy-500 max-w-prose leading-relaxed" style={step(1)}>
              Я обожаю животных и подбираю для магазина только те корма, которые готова дать своим питомцам. Если вы не уверены в выборе — напишите, разберёмся вместе.
            </p>

            <div className="reveal-item mt-6 flex items-center gap-3" style={step(2)}>
              <span
                aria-hidden="true"
                className="w-11 h-11 flex-shrink-0 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center font-black text-lg"
              >
                А
              </span>
              <p className="font-bold text-navy-900 leading-tight">
                Алина
                <span className="block text-sm font-medium text-navy-500">основательница Симбы</span>
              </p>
            </div>

            {/* Рейтинги и отзывы по площадкам — в «Почему нам доверяют»,
                здесь цифра работает как продолжение истории. */}
            <div className="reveal-item mt-6 flex items-baseline gap-3" style={step(2)}>
              <CountUp
                value={24000}
                suffix="+"
                className="text-[32px] leading-none font-black text-navy-900 whitespace-nowrap"
              />
              <p className="text-navy-500">заказов собрано с тех пор</p>
            </div>

            <div className="reveal-item mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4" style={step(3)}>
              <p className="text-navy-500">Не знаете, какой корм подойдёт вашему питомцу —</p>
              <Link to="/questionnaire" className="btn-primary px-6 rounded-xl font-bold">
                Подобрать за минуту
              </Link>
            </div>
            <div className="reveal-item mt-4" style={step(3)}>
              <Link
                to="/about"
                className="inline-flex items-center min-h-11 font-medium text-navy-700 hover:text-primary-hover transition-colors duration-100 ease"
              >
                Подробнее о компании
              </Link>
            </div>
          </div>

          {/* Визуал справа: фото основательницы, пока его нет — брендовая панель с репликой */}
          <div className="reveal-item" style={step(1)}>
            <FounderVisual />
          </div>
        </div>

        {/* Тонкая юридическая строка */}
        <p className="reveal-item mt-8 pt-6 border-t border-line max-w-3xl text-sm leading-relaxed text-navy-500" style={step(3)}>
          {LEGAL.entity} · {LEGAL.inn} · {LEGAL.ogrnip} · {LEGAL.address}
        </p>
      </div>
    </section>
  )
}
