import { Link } from 'react-router-dom'
import { type CSSProperties } from 'react'
import { useMetaTags } from '../hooks/useMetaTags'
import { CONTACTS } from '../lib/contacts'
import { useOnScreen } from '../hooks/useOnScreen'

import TelegramIcon from '../components/icons/TelegramIcon'

function ClockIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

/** Геометрия — Tabler Icons (MIT), icons/outline/building-store.svg.
    Пункт выдачи как физическая точка с маркизой, а не абстрактный ящик.
    Двигается только маркиза (.delivery-pickup) — корпус и дверь стоят. */
function PickupPointIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21l18 0" />
      <g className="delivery-pickup">
        <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" />
      </g>
      <path d="M5 21l0 -10.15" />
      <path d="M19 21l0 -10.15" />
      <path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" />
    </svg>
  )
}

/** Геометрия: прямоугольный кузов-фургон (слева) + трапециевидная кабина (справа),
    колёса контуром. Анимация: бегущая подсветка пробегает по верхнему контуру
    машины один раз за цикл (вдоль крыши кузова, скоса лобового стекла, верха окна
    кабины). Чёрточка скорости справа-сверху сдвигается вправо вместе с подсветкой.
    Техника: второй path со stroke-dasharray/stroke-dashoffset поверх статичного контура. */
function CourierIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {/* Кузов фургона: прямоугольник скруглённые углы слева */}
      <path d="M3 15 L3 6 C3 5 3.5 5 4 5 L11 5 L11 15" />
      {/* Иконка посылки внутри кузова */}
      <g transform="translate(5, 8)">
        <rect x="1" y="0" width="3" height="3" fill="none" stroke="currentColor" strokeWidth="0.7" />
        <path d="M2.5 0 L3 1 L2 1 Z" fill="none" stroke="currentColor" strokeWidth="0.7" />
      </g>
      {/* Кабина: трапеция (верх кузова продолжается прямо, потом скос вниз-вправо) */}
      <path d="M11 5 L17 5 L19 8 L19 15" />
      {/* Верхняя линия кузова до кабины (база для подсветки) */}
      <path d="M3 5 L11 5" />
      {/* Окно кабины: маленький прямоугольник */}
      <rect x="12" y="7" width="4.5" height="2.5" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
      {/* Фара: точка внизу спереди кабины */}
      <circle cx="19" cy="14" r="0.6" fill="none" stroke="currentColor" strokeWidth="0.7" />
      {/* Левое колесо: контур */}
      <circle cx="6" cy="15" r="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      {/* Правое колесо: контур */}
      <circle cx="16" cy="15" r="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
      {/* Дно кузова и кабины */}
      <path d="M3 15 L19 15" />

      {/* Бегущая подсветка: второй path вдоль верхнего контура (крыша кузова + скос + верх окна)
          pathLength="100" позволяет считать dasharray/offset в процентах, независимо от реальной длины */}
      <path
        d="M3 5 L11 5 L17 5 L19 8 L19 10"
        className="delivery-sweep"
        fill="none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="100"
      />

      {/* Чёрточки скорости справа-сверху: сдвигаются вправо вместе с подсветкой */}
      <g className="delivery-trail">
        <path d="M20 4 l2.5 0" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M20 6 l2 0" strokeWidth="1.2" strokeLinecap="round" />
      </g>
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
    icon: <PickupPointIcon />,
    name: 'Яндекс Доставка',
    description: 'до пункта выдачи',
    price: 0,
    free: true,
  },
  {
    icon: <PickupPointIcon />,
    name: 'Ozon',
    description: 'до пункта выдачи',
    price: 0,
    free: true,
  },
  {
    icon: <PickupPointIcon />,
    name: 'СДЭК',
    description: 'до пункта выдачи',
    price: 9900,
  },
  {
    icon: <CourierIcon />,
    name: 'Курьер по Москве',
    description: 'до двери',
    price: 70000,
  },
]

/** 4 иконки в ряду: шаг = цикл / число иконок = 5600/4 = 1400мс, в движении
    всегда ровно одна. 600мс форы, чтобы жест не наложился на reveal секции. */
const iconDelay = (i: number) => ({ '--idle-delay': `${600 + i * 1400}ms` }) as CSSProperties

export default function DeliveryPage() {
  const iconsRef = useOnScreen<HTMLDivElement>()

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
      <div ref={iconsRef} className="delivery-icons grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
            <div style={iconDelay(idx)} className="text-primary-soft mb-3">{method.icon}</div>
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
      <div className="bg-blue-100 rounded-card p-5 mt-10">
        <div className="flex items-start gap-3">
          <ClockIcon size={24} className="text-primary-soft flex-shrink-0 mt-1" />
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
