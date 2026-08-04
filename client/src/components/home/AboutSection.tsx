import { Link } from 'react-router-dom'
import { LEGAL } from '../../lib/contacts'

function ImageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

export default function AboutSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-navy-500">О компании</p>
        <h2 className="mt-1 text-2xl font-bold text-navy-900">Кто мы</h2>

        <div className="mt-8 grid md:grid-cols-2 gap-8 md:items-center">
          {/* Текст слева */}
          <div>
            <p className="text-navy-500 max-w-prose leading-relaxed">
              Симба начался с простой собственной проблемы: найти импортный корм для своей собаки — гарантированно оригинальный, со свежими сроками и по честной цене.
            </p>
            <p className="mt-4 text-navy-500 max-w-prose leading-relaxed">
              Мы осознанно продаём узкий ассортимент: Farmina, Monge и ещё несколько брендов, за которые готовы отвечать. Каждую партию проверяем на приёмке.
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-[32px] leading-none font-black text-navy-900 tabular-nums whitespace-nowrap">24 000+</span>
              <p className="text-navy-500">заказов и 5 200 отзывов на трёх площадках</p>
            </div>

            <div className="mt-6">
              <Link
                to="/questionnaire"
                className="inline-flex items-center justify-center min-h-11 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-hover transition-colors duration-100 ease"
              >
                Подобрать за минуту
              </Link>
            </div>
          </div>

          {/* Плейсхолдер под фото справа */}
          <div className="bg-white border border-line rounded-card aspect-[4/3] flex flex-col items-center justify-center p-4">
            <div className="text-primary-soft mb-3">
              <ImageIcon />
            </div>
            <p className="text-sm text-navy-500 text-center">Здесь будет фото: витрина, склад или сборка заказа</p>
          </div>
        </div>

        {/* Тонкая юридическая строка */}
        <p className="mt-8 pt-6 border-t border-line text-sm text-navy-500">
          {LEGAL.entity} · {LEGAL.inn} · {LEGAL.ogrnip} · {LEGAL.address}
        </p>
      </div>
    </section>
  )
}
