import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'
import CountUp from '../components/CountUp'
import { CONTACTS, LEGAL } from '../lib/contacts'

function ImageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  )
}

export default function AboutPage() {
  useMetaTags({
    title: 'О магазине Симба — корма Farmina и Monge',
    description:
      'Кто мы: узкий ассортимент премиальных кормов, прямые поставки от официальных дистрибьюторов, проверка каждой партии на приёмке.',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-3">Кто мы</h1>
      <p className="text-navy-500 max-w-prose mb-10 leading-relaxed">
        Симба начался с простой собственной проблемы: найти импортный корм для своей собаки — гарантированно оригинальный, со свежими сроками и по честной цене, — и это оказалось сложнее, чем должно быть.
      </p>

      {/* Ключевой факт */}
      <div className="mb-10 flex items-baseline gap-4">
        <CountUp value={24000} suffix="+" className="text-[40px] font-black text-navy-900" />
        <p className="text-navy-500">заказов и 2 500 отзывов</p>
      </div>

      {/* Image placeholder on all screens */}
      <div className="mb-10">
        <div className="bg-primary-tint rounded-card aspect-[4/3] flex flex-col items-center justify-center p-4">
          <div className="text-primary-soft mb-3">
            <ImageIcon />
          </div>
          <p className="text-sm text-navy-500 text-center">
            Здесь будет фото: витрина, склад или сборка заказа
          </p>
        </div>
        {/* TODO: Replace placeholder with actual image: <img src="..." alt="..." className="rounded-card object-cover aspect-[4/3]" /> */}
      </div>

      {/* Section 1: Ассортимент */}
      <h2 className="text-2xl font-bold text-navy-900 mb-4">Как мы выбираем ассортимент</h2>
      <p className="text-navy-500 max-w-prose leading-relaxed mb-4">
        Мне удалось найти корм для себя, и мы решили помочь людям со схожей проблемой. Благодарность людей за жизненно важный корм для своих любимцев подтолкнула меня к развитию ассортимента и открытию первого магазина.
      </p>
      <p className="text-navy-500 max-w-prose leading-relaxed mb-10">
        Мы осознанно продаём узкий ассортимент: Farmina, Monge и ещё несколько брендов, за которые готовы отвечать. Я обожаю животных и подбираю для магазина только те корма, которые готова дать своим питомцам.
      </p>

      {/* Section 2: Проверка партий */}
      <h2 className="text-2xl font-bold text-navy-900 mb-4">Как проверяем партии</h2>
      <p className="text-navy-500 max-w-prose leading-relaxed mb-10">
        Все поставки — напрямую от официальных дистрибьюторов. Каждую партию мы проверяем на приёмке: сроки годности, целостность упаковки, документы. Храним корма в сухом помещении с контролем температуры — так, как требует производитель, а не так, как получится. Если вы не уверены в выборе — напишите, разберёмся вместе.
      </p>

      {/* Legal info section */}
      <div className="border-t border-line pt-6 mb-10">
        <p className="text-sm text-navy-500">
          {LEGAL.entity} · {LEGAL.inn} · {LEGAL.ogrnip} · {LEGAL.address}
        </p>
      </div>

      {/* CTA section */}
      <div className="mt-10 pt-6 border-t border-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-navy-500">
          Не знаете, какой корм подойдёт вашему питомцу
        </p>
        <Link
          to="/questionnaire"
          className="btn-primary rounded-xl font-bold px-6"
        >
          Подобрать за минуту
        </Link>
      </div>
    </div>
  )
}
