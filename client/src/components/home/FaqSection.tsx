'use client'

import { useState, useId } from 'react'
import { Link } from 'react-router-dom'

const faqs = [
  {
    q: 'Как выбрать корм при почечной недостаточности?',
    a: "При хронической болезни почек (ХБП) необходим корм с пониженным содержанием фосфора и белка. Рекомендуем Royal Canin Renal, Hill's k/d, Purina Pro Plan NF. Перед переводом на лечебный корм проконсультируйтесь с ветеринаром.",
  },
  {
    q: 'Чем отличается холистик от обычного корма?',
    a: 'Холистик-корм производится из ингредиентов, пригодных для питания человека. В составе — цельное мясо, овощи, фрукты, без искусственных красителей и консервантов. Подходит для здоровых животных без хронических заболеваний.',
  },
  {
    q: 'Как работает автозаказ?',
    a: 'Вы выбираете товар, указываете интервал (например, каждые 30 дней) и привязываете карту. В выбранный день мы автоматически формируем и отправляем заказ. Отменить или изменить можно в любой момент в личном кабинете.',
  },
  {
    q: 'Как долго идёт доставка?',
    a: 'По Москве и МО — 1-2 дня. В регионы через СДЭК — 2-7 дней в зависимости от города. Яндекс.Доставка по Москве — в тот же день при заказе до 14:00.',
  },
  {
    q: 'Можно ли вернуть корм если не подошёл?',
    a: 'Да, принимаем возврат в течение 14 дней при условии, что упаковка не вскрыта. Если корм не подошёл питомцу — поможем подобрать альтернативу и учтём стоимость при следующей покупке.',
  },
  {
    q: 'Есть ли скидки для постоянных покупателей?',
    a: 'Да! Действует программа лояльности Scoins. С каждой покупки начисляется 5% от суммы заказа scoins (1 scoin = 1 рубль). Накопленными scoins можно оплатить заказ — хоть целиком, если их хватает. У программы три уровня по накоплению: Новичок (0–999), Активный (1000–4999) и Премиум (5000+) — чем выше уровень, тем больше привилегий: приоритетная поддержка и эксклюзивные акции.',
  },
]

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="border border-line rounded-card overflow-hidden">
      <button
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-blue-50 transition-colors"
      >
        <span className="font-semibold pr-4 text-navy-900">{faq.q}</span>
        <svg
          aria-hidden="true"
          className={`w-5 h-5 flex-shrink-0 text-primary-hover transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        id={id}
        role="region"
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 leading-relaxed text-navy-500 opacity-0 -translate-y-1 transition-[opacity,transform] duration-200 ease-out" style={{
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0)' : 'translateY(-4px)',
          }}>
            {faq.a}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function FaqSection() {
  return (
    <section className="py-12 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-8 text-navy-900">Частые вопросы</h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <FaqItem key={i} faq={faq} />
        ))}
      </div>
      <div className="mt-8">
        <Link to="/faq" className="text-primary-hover hover:text-primary transition-colors">
          Все вопросы и ответы →
        </Link>
      </div>
    </section>
  )
}
