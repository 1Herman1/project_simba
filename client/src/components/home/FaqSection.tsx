'use client'

import { useState } from 'react'

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
    a: 'Да! Действует программа лояльности Сибакоины. С каждой покупки начисляется 5% от суммы заказа сибакоинами (1 сибакоин = 1 рубль скидки). У программы три уровня: Новичок (0–999 сибакоинов, оплата до 10% заказа), Активный (1000–4999, оплата до 20%) и Премиум (5000+, оплата до 50%). Чем выше уровень — тем больше бонусов вы сможете использовать при заказе.',
  },
]

function FaqItem({ faq }: { faq: { q: string; a: string } }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-blue-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-blue-50 transition-colors"
      >
        <span className="font-semibold pr-4" style={{ color: '#1A3A5C' }}>{faq.q}</span>
        <svg
          className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#A4D4FC"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96' : 'max-h-0'}`}>
        <p className="px-5 pb-5 leading-relaxed" style={{ color: '#4A6A8C' }}>{faq.a}</p>
      </div>
    </div>
  )
}

export default function FaqSection() {
  return (
    <section className="py-12 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: '#1A3A5C' }}>Частые вопросы</h2>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <FaqItem key={i} faq={faq} />
        ))}
      </div>
    </section>
  )
}
