'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'

const categories = [
  {
    id: 'cats-food',
    label: 'Корм для кошек',
    subtitle: 'Лечебное и холистик питание',
    href: '/catalog?category=cats-food',
    bg: '#A4D4FC',
    textColor: '#1A3A5C',
    emoji: '🐱',
  },
  {
    id: 'dogs-food',
    label: 'Корм для собак',
    subtitle: 'Породные и лечебные рационы',
    href: '/catalog?category=dogs-food',
    bg: '#B8E6C8',
    textColor: '#1A3A2C',
    emoji: '🐶',
  },
  {
    id: 'treats',
    label: 'Лакомства',
    subtitle: 'Вкусно и полезно',
    href: '/catalog?category=treats',
    bg: '#FFD9B0',
    textColor: '#3A1A00',
    emoji: '🍖',
  },
  {
    id: 'accessories',
    label: 'Аксессуары',
    subtitle: 'Миски, переноски, игрушки',
    href: '/catalog?category=accessories',
    bg: '#C8C8E6',
    textColor: '#1A1A3A',
    emoji: '🎾',
  },
  {
    id: 'pharmacy',
    label: 'Ветаптека',
    subtitle: 'Витамины и препараты',
    href: '/catalog?category=pharmacy',
    bg: '#F5E6C8',
    textColor: '#3A2A00',
    emoji: '💊',
  },
]

function ActivePanel({ cat }: { cat: typeof categories[0] }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-8 flex flex-col justify-between min-h-[420px]"
      style={{ backgroundColor: cat.bg }}
    >
      <div>
        <p className="text-sm opacity-70 mb-2" style={{ color: cat.textColor }}>{cat.subtitle}</p>
        <h2 className="text-3xl font-bold mb-6" style={{ color: cat.textColor }}>{cat.label}</h2>
        <Link to={cat.href} onClick={e => e.stopPropagation()}>
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ backgroundColor: cat.textColor }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </Link>
      </div>
      <div className="absolute bottom-0 right-0 text-[120px] opacity-20 select-none leading-none">
        {cat.emoji}
      </div>
    </div>
  )
}

function InactivePanel({ cat, onClick }: { cat: typeof categories[0]; onClick: () => void }) {
  return (
    <div
      className="cursor-pointer rounded-3xl flex items-end justify-center pb-8 min-h-[420px]"
      style={{ backgroundColor: cat.bg }}
      onClick={onClick}
    >
      <span
        className="text-sm font-semibold tracking-widest"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: cat.textColor }}
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
      <h2 className="text-2xl font-bold mb-6" style={{ color: '#1A3A5C' }}>Категории</h2>

      {/* Desktop: горизонтальный аккордеон */}
      <div className="hidden md:flex gap-3 h-[420px]">
        {categories.map(cat => (
          <div
            key={cat.id}
            className={`transition-all duration-500 ease-in-out rounded-3xl overflow-hidden cursor-pointer ${active === cat.id ? 'flex-[3]' : 'flex-[1]'}`}
            style={{ backgroundColor: cat.bg }}
            onClick={() => setActive(cat.id)}
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
            className="rounded-2xl p-6 flex items-center justify-between"
            style={{ backgroundColor: cat.bg }}
          >
            <div>
              <p className="text-xs opacity-60" style={{ color: cat.textColor }}>{cat.subtitle}</p>
              <h3 className="text-lg font-bold" style={{ color: cat.textColor }}>{cat.label}</h3>
            </div>
            <span className="text-4xl">{cat.emoji}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
