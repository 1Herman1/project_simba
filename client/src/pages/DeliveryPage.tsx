import { Link } from 'react-router-dom'
import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS } from '../lib/contacts'

import TelegramIcon from '../components/icons/TelegramIcon'

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

type DeliveryMethod = {
  icon: React.ReactNode
  name: string
  description: string
  price: number
  free?: boolean
}

const deliveryMethods: DeliveryMethod[] = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9h18v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2" />
        <path d="M7 13v3M12 13v3M17 13v3" />
      </svg>
    ),
    name: 'Яндекс Доставка',
    description: 'до пункта выдачи',
    price: 0,
    free: true,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9h18v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2" />
        <path d="M7 13v3M12 13v3M17 13v3" />
      </svg>
    ),
    name: 'Ozon',
    description: 'до пункта выдачи',
    price: 0,
    free: true,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9h18v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M3 9V7a2 2 0 012-2h14a2 2 0 012 2v2" />
        <path d="M7 13v3M12 13v3M17 13v3" />
      </svg>
    ),
    name: 'СДЭК',
    description: 'до пункта выдачи',
    price: 9900,
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6-2c1.66 0 3 1.34 3 3v2h-6V6c0-1.66 1.34-3 3-3z" />
        <path d="M8 11h8M8 15h8" />
      </svg>
    ),
    name: 'Курьер по Москве',
    description: 'до двери',
    price: 70000,
  },
]

export default function DeliveryPage() {
  useMetaTags({
    title: 'Доставка и оплата — Зоомагазин Симба, Москва',
    description:
      'Сроки и стоимость доставки кормов и товаров для животных по Москве и России. Оплата картой, СБП или наличными курьеру.',
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 md:py-14">
      <h1 className="text-[32px] md:text-[40px] leading-tight font-bold text-navy-900 mb-3">Доставка и оплата</h1>
      <div className="flex items-center gap-2 text-navy-500 mb-10">
        <ClockIcon />
        <p>Отправляем в день заказа — любым способом</p>
      </div>

      {/* Delivery methods grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {deliveryMethods.map((method, idx) => (
          <div
            key={method.name}
            className={`relative bg-white rounded-card p-5 flex flex-col ${
              method.free ? 'border-2 border-primary-soft' : 'border border-line'
            }`}
          >
            {method.free && (
              <span className="absolute -top-2 left-4 bg-primary text-white text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
                Бесплатно
              </span>
            )}
            <div className="text-primary-soft mb-3">{method.icon}</div>
            <h3 className="font-bold text-navy-900 mb-1">{method.name}</h3>
            <p className="text-sm text-navy-500 mb-3 flex-grow">{method.description}</p>
            <p className="text-2xl font-bold text-navy-900 tabular-nums">{`${(method.price / 100).toLocaleString('ru-RU')} ₽`}</p>
          </div>
        ))}
      </div>

      {/* Content sections */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Как получить заказ</h2>
        <p className="text-navy-500 leading-relaxed max-w-prose">
          До пункта выдачи Яндекс Доставки или Ozon — бесплатно. СДЭК до пункта выдачи — 99 ₽. Курьером по Москве до двери
          — 700 ₽. Способ выбираете при оформлении заказа.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Когда отправим</h2>
        <p className="text-navy-500 leading-relaxed max-w-prose">
          Отправляем в день заказа — и в пункты выдачи, и курьером. Срок получения зависит от выбранного способа: точную дату
          вы увидите при оформлении.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Как оплатить</h2>
        <p className="text-navy-500 leading-relaxed max-w-prose">
          Картой или через СБП при оформлении на сайте. Наличными — курьеру при получении. Чек приходит сразу после оплаты.
        </p>
      </section>

      {/* Info block */}
      <div className="bg-primary-tint rounded-card p-5 mt-10">
        <div className="flex items-start gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-soft flex-shrink-0 mt-1">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div>
            <h3 className="font-bold text-navy-900 mb-2">Проверяем перед отправкой</h3>
            <p className="text-navy-500 leading-relaxed">
              Каждый заказ мы собираем и проверяем перед отправкой: сроки годности, целостность упаковки, комплектность. При
              получении вы можете сверить маркировку — если что-то не так, заменим или вернём деньги, подробнее на странице{' '}
              <Link to="/returns" className="font-medium text-navy-700 hover:text-primary-hover transition-colors duration-100 ease">
                Обмен и возврат
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Footer section */}
      <div className="mt-10 pt-6 border-t border-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-navy-500">
          Остались вопросы по доставке — напишите нам в Telegram, ответим за несколько минут.
        </p>
        <a
          href={CONTACTS.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary rounded-xl px-6 py-3 font-bold w-full sm:w-auto gap-2 whitespace-nowrap"
        >
          <TelegramIcon />
          Написать в Telegram
        </a>
      </div>
    </div>
  )
}
