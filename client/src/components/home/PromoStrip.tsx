const items = [
  { icon: '🚚', title: 'Доставка по всей России', subtitle: 'СДЭК, Яндекс, Почта' },
  { icon: '⭐', title: 'Только оригиналы', subtitle: 'Прямые поставки от брендов' },
  { icon: '💊', title: 'Ветеринарный подбор', subtitle: 'AI-помощник бесплатно' },
  { icon: '🎁', title: 'Бонусная программа', subtitle: 'До 5% от каждой покупки' },
]

export default function PromoStrip() {
  return (
    <div className="bg-white shadow-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            <div>
              <p className="text-xs font-bold text-navy-900 leading-tight">{item.title}</p>
              <p className="text-xs text-navy-300 leading-tight">{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
