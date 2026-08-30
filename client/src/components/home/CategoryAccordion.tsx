'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRightIcon } from '../icons'

const categories = [
  {
    id: 'cats-food',
    label: 'Корм для кошек',
    subtitle: 'Лечебное и холистик питание',
    href: '/catalog?category=cats-food',
    bgClass: 'bg-blue-100',
    image: '/pets/cat.png',
    imgClass: 'h-[86%] max-w-[52%]',
  },
  {
    id: 'dogs-food',
    label: 'Корм для собак',
    subtitle: 'Породные и лечебные рационы',
    href: '/catalog?category=dogs-food',
    bgClass: 'bg-amber-100',
    image: '/pets/smiledog.png',
    imgClass: 'h-[90%] max-w-[50%]',
  },
  {
    id: 'treats',
    label: 'Лакомства',
    subtitle: 'Вкусно и полезно',
    href: '/catalog?category=treats',
    bgClass: 'bg-amber-50',
    image: '/pets/dogwithcat.png',
    imgClass: 'h-[95%] max-w-[46%]',
  },
  {
    id: 'accessories',
    label: 'Аксессуары',
    subtitle: 'Миски, переноски, игрушки',
    href: '/catalog?category=accessories',
    bgClass: 'bg-blue-200',
    image: '/pets/dogwithball.png',
    imgClass: 'h-[64%] max-w-[54%]',
  },
  {
    id: 'care',
    label: 'Ветаптека и уход',
    subtitle: 'Шампуни, лосьоны, пасты',
    href: '/catalog?category=care',
    bgClass: 'bg-white border border-line',
    image: '/pets/dogdoctor.png',
    imgClass: 'h-[90%] max-w-[50%]',
  },
]

function ActivePanel({ cat }: { cat: typeof categories[0] }) {
  return (
    <div
      className={`relative overflow-hidden rounded-card p-8 flex flex-col justify-between min-h-[420px] ${cat.bgClass}`}
    >
      {/* Питомец у правого нижнего края раскрытой панели.
          Если файла ещё нет — тихо прячем, чтобы не было битой иконки. */}
      {cat.image && (
        <img
          src={cat.image}
          alt=""
          aria-hidden="true"
          onError={(e) => { e.currentTarget.style.display = 'none' }}
          className={`pointer-events-none select-none absolute bottom-0 right-0 w-auto object-contain object-bottom animate-fade-in ${cat.imgClass ?? 'h-[88%] max-w-[52%]'}`}
        />
      )}
      <div className="relative z-10">
        <p className="text-base text-navy-500 mb-2">{cat.subtitle}</p>
        <h2 className="text-4xl font-bold mb-6 text-navy-900">{cat.label}</h2>
        <Link to={cat.href} onClick={e => e.stopPropagation()}>
          <button
            className="w-12 h-12 rounded-full flex items-center justify-center bg-navy-900"
          >
            <ArrowRightIcon className="ico-nudge w-5 h-5 text-white" />
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
        className="text-base font-semibold tracking-widest text-navy-900"
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
    <section id="categories" className="scroll-mt-24 py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4">
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
              <p className="text-sm text-navy-500">{cat.subtitle}</p>
              <h3 className="text-xl font-bold text-navy-900">{cat.label}</h3>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </section>
  )
}
