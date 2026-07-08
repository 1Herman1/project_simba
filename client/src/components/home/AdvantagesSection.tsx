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
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {advantages.map((adv, i) => (
            <div
              key={i}
              className="group bg-blue-50 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-default"
            >
              <h3 className="font-bold mb-2 text-sm" style={{ color: '#1A3A5C' }}>{adv.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#4A6A8C' }}>{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
