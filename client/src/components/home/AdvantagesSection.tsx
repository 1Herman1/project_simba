const advantages = [
  {
    title: 'Спецупаковка корма',
    desc: 'Отправляем заказы в дополнительной защите — плёнка и уголки, чтобы дорогой лечебный корм не пришёл помятым.',
  },
  {
    title: 'Подбор корма',
    desc: 'Подбор под аллергию, возраст, породу и болезни вашего питомца, не занимаемся навязыванием дорогих брендов.',
  },
  {
    title: 'Экономия',
    desc: 'Не закладываем в цену комиссию Ozon и Wildberries (5–15%). Вы платите только за корм и доставку.',
  },
  {
    title: 'Автозаказ',
    desc: 'Настраиваем регулярную доставку корма, который заканчивается. Деньги списываются автоматически — вы ничего не забываете.',
  },
]

export default function AdvantagesSection() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Почему у нас</h2>
        <div className="flex flex-col gap-4">
          {advantages.map((adv) => (
            <div
              key={adv.title}
              className="bg-white border border-line rounded-card p-6 flex items-start gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary-soft flex-shrink-0 mt-1">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <div className="flex-1">
                <h3 className="font-bold text-base text-navy-900 mb-1">{adv.title}</h3>
                <p className="text-base leading-relaxed text-navy-500">{adv.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
