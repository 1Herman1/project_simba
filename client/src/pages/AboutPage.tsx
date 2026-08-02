import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS, LEGAL } from '../lib/contacts'

function ImageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-10">Кто мы</h1>

      {/* Two-column layout: text on left, image placeholder on right */}
      <div className="md:grid md:grid-cols-[1fr_320px] md:gap-10">
        {/* Left column: text */}
        <div>
          <p className="text-navy-500 leading-relaxed mt-4">
            Симба начался с простой собственной проблемы: найти импортный корм для своей собаки — гарантированно оригинальный, со свежими сроками и по честной цене, — и это оказалось сложнее, чем должно быть. Мне удалось найти корм для себя, и мы решили помочь людям со схожей проблемой.
          </p>

          <p className="text-navy-500 leading-relaxed mt-4">
            Благодарность людей за жизненно важный корм для своих любимцев подтолкнула меня к развитию ассортимента и открытию первого магазина.
          </p>

          <p className="text-navy-500 leading-relaxed mt-4">
            На сегодняшний день у Симбы более 24 000 заказов и 5 200 отзывов на площадках.
          </p>

          <p className="text-navy-500 leading-relaxed mt-4">
            Мы осознанно продаём узкий ассортимент: Farmina, Monge и ещё несколько брендов, за которые готовы отвечать. Все поставки — напрямую от официальных дистрибьюторов. Каждую партию мы проверяем на приёмке: сроки годности, целостность упаковки, документы. Храним корма в сухом помещении с контролем температуры — так, как требует производитель, а не так, как получится.
          </p>

          <p className="text-navy-500 leading-relaxed mt-4">
            Я обожаю животных и подбираю для магазина только те корма, которые готова дать своим питомцам. Если вы не уверены в выборе — напишите, разберёмся вместе.
          </p>
        </div>

        {/* Right column: image placeholder */}
        <div className="hidden md:block mt-10 md:mt-0">
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
      </div>

      {/* Legal info section */}
      <div className="border-t border-line pt-6 mt-10">
        <p className="text-sm text-navy-500">
          {LEGAL.entity} · {LEGAL.inn} · {LEGAL.ogrnip} · {LEGAL.address}
        </p>
      </div>

      {/* CTA section */}
      <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
        <p className="text-navy-500">
          Не знаете, какой корм подойдёт вашему питомцу —{' '}
        </p>
        <Link
          to="/questionnaire"
          className="flex items-center justify-center bg-primary text-white rounded-xl px-6 py-3 font-bold hover:bg-primary-hover transition-colors duration-200 ease-out w-full sm:w-auto"
        >
          Подобрать за минуту
        </Link>
      </div>
    </div>
  )
}
