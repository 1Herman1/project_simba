'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'

const categories = [
  {
    id: 'cats-food',
    label: 'Корм для кошек',
    subtitle: 'Лечебное и холистик питание',
    href: '/catalog?category=cats-food',
    bgClass: 'bg-primary-tint',
  },
  {
    id: 'dogs-food',
    label: 'Корм для собак',
    subtitle: 'Породные и лечебные рационы',
    href: '/catalog?category=dogs-food',
    bgClass: 'bg-primary-tint',
  },
  {
    id: 'treats',
    label: 'Лакомства',
    subtitle: 'Вкусно и полезно',
    href: '/catalog?category=treats',
    bgClass: 'bg-primary-tint',
  },
  {
    id: 'accessories',
    label: 'Аксессуары',
    subtitle: 'Миски, переноски, игрушки',
    href: '/catalog?category=accessories',
    bgClass: 'bg-primary-tint',
  },
  {
    id: 'pharmacy',
    label: 'Ветаптека',
    subtitle: 'Витамины и препараты',
    href: '/catalog?category=pharmacy',
    bgClass: 'bg-primary-tint',
  },
]

function ActivePanel({ cat }: { cat: typeof categories[0] }) {
  return (
    <div
      className={`relative overflow-hidden rounded-card p-8 flex flex-col justify-between min-h-[420px] ${cat.bgClass}`}
    >
      <div>
        <p className="text-sm opacity-70 mb-2 text-navy-900">{cat.subtitle}</p>
        <h2 className="text-3xl font-bold mb-6 text-navy-900">{cat.label}</h2>
        <Link to={cat.href} onClick={e => e.stopPropagation()}>
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 bg-navy-900"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  )
}

function InactivePanel({ cat, onClick }: { cat: typeof categories[0]; onClick: () => void }) {
  return (
    <div
      className={`cursor-pointer rounded-card flex items-end justify-center pb-8 min-h-[420px] ${cat.bgClass}`}
      onClick={onClick}
    >
      <span
        className="text-sm font-semibold tracking-widest text-navy-900"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
      >
        {cat.label}
      </span>
    </div>
  )
}

export default function CategoryAccordion() {
  const [active, setActive] = useState('cats-food')

  return (
    <section className="px-4 py-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-navy-900">Категории</h2>

      {/* Desktop: горизонтальный аккордеон */}
      <div className="hidden md:flex gap-3 h-[420px]">
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`transition-[flex-grow] duration-300 ease-out rounded-card overflow-hidden cursor-pointer ${active === cat.id ? 'flex-[3]' : 'flex-[1]'}`}
            onClick={() => setActive(cat.id)}
            onMouseEnter={() => setActive(cat.id)}
          >
            {active === cat.id ? <ActivePanel cat={cat} /> : <InactivePanel cat={cat} onClick={() => setActive(cat.id)} />}
          </div>
        ))}
      </div>

      {/* Mobile: вертикальный стек */}
      <div className="md:hidden flex flex-col gap-3">
        {categories.map(cat => (
          <Link
            to={cat.href}
            key={cat.id}
            className={`rounded-card p-6 flex items-center justify-between ${cat.bgClass}`}
          >
            <div>
              <p className="text-xs opacity-60 text-navy-900">{cat.subtitle}</p>
              <h3 className="text-lg font-bold text-navy-900">{cat.label}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
