import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const categories = [
  {
    label: 'Кошки',
    key: 'cats',
    subcategories: [
      { label: 'Сухой корм', href: '/catalog?category=cats-dry' },
      { label: 'Влажный корм', href: '/catalog?category=cats-wet' },
      { label: 'Лечебное питание', href: '/catalog?category=cats-medical' },
      { label: 'Наполнители', href: '/catalog?category=cats-litter' },
      { label: 'Игрушки', href: '/catalog?category=cats-toys' },
      { label: 'Когтеточки', href: '/catalog?category=cats-scratching' },
      { label: 'Переноски', href: '/catalog?category=cats-carriers' },
      { label: 'Аксессуары', href: '/catalog?category=cats-accessories' },
    ],
  },
  {
    label: 'Собаки',
    key: 'dogs',
    subcategories: [
      { label: 'Сухой корм', href: '/catalog?category=dogs-dry' },
      { label: 'Влажный корм', href: '/catalog?category=dogs-wet' },
      { label: 'Лечебное питание', href: '/catalog?category=dogs-medical' },
      { label: 'Лакомства', href: '/catalog?category=dogs-treats' },
      { label: 'Игрушки', href: '/catalog?category=dogs-toys' },
      { label: 'Поводки и ошейники', href: '/catalog?category=dogs-leashes' },
      { label: 'Одежда', href: '/catalog?category=dogs-clothes' },
      { label: 'Аксессуары', href: '/catalog?category=dogs-accessories' },
    ],
  },
  { label: 'Лакомства', key: null, href: '/catalog?category=treats' },
  { label: 'Бренды', key: null, href: '/catalog?type=brands' },
  { label: 'Акции', key: null, href: '/catalog?type=sale' },
  { label: 'Блог', key: null, href: '/blog' },
]

export default function Header() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount] = useState(3)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Десктоп шапка */}
      <div className="hidden md:block">
        {/* Строка 1 */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Логотип */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/logo.svg" alt="Симба" className="h-10 w-auto" />
          </Link>

          {/* Поиск */}
          <div className="relative flex-1 max-w-xl mx-4">
            <input
              type="text"
              placeholder="Поиск корма, товаров..."
              className="w-full pl-4 pr-12 py-2.5 rounded-full border border-blue-100 bg-white focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-all text-navy-900 placeholder-navy-300"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-500 hover:text-blue-300 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          </div>

          {/* Иконки справа */}
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* Телефон */}
            <a href="tel:+79365050014" className="flex items-center gap-1.5 text-navy-700 hover:text-blue-300 transition-all hover:scale-110 group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.81 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7 8.91a16 16 0 006.07 6.07l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              <span className="text-sm font-medium">+7 936 505-00-14</span>
            </a>

            {/* Избранное */}
            <Link to="/favorites" className="text-navy-500 hover:text-amber-400 transition-all hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
            </Link>

            {/* Корзина */}
            <Link to="/cart" className="relative text-navy-500 hover:text-blue-300 transition-all hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white text-xs w-4.5 h-4.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold text-[10px] px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Профиль */}
            <Link to="/profile" className="text-navy-500 hover:text-blue-300 transition-all hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Строка 2 — навигация с мегаменю */}
        <div
          className="border-t border-blue-100 relative"
          onMouseLeave={() => setActiveCategory(null)}
        >
          <nav className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-0">
              {categories.map((cat) => (
                <li
                  key={cat.label}
                  onMouseEnter={() => cat.key ? setActiveCategory(cat.key) : setActiveCategory(null)}
                  className="relative"
                >
                  {cat.href ? (
                    <Link
                      to={cat.href}
                      className="block px-4 py-3 text-sm font-medium text-navy-700 hover:text-blue-300 hover:bg-blue-50 transition-all"
                    >
                      {cat.label}
                    </Link>
                  ) : (
                    <span className="block px-4 py-3 text-sm font-medium text-navy-700 hover:text-blue-300 hover:bg-blue-50 transition-all cursor-default">
                      {cat.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Мегаменю */}
          {activeCategory && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-blue-100 animate-slide-down z-50">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-4 gap-4">
                  {categories
                    .find((c) => c.key === activeCategory)
                    ?.subcategories?.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.href}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-navy-700 hover:bg-blue-50 hover:text-blue-300 transition-all text-sm"
                        onClick={() => setActiveCategory(null)}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-200 flex-shrink-0" />
                        {sub.label}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Мобильная шапка */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Бургер */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-navy-700 p-1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>

          {/* Логотип */}
          <Link to="/" className="flex items-center gap-1.5">
            <img src="/logo.svg" alt="Симба" className="h-8 w-auto" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-400">
              <path d="M7 5C7 3.9 7.9 3 9 3s2 .9 2 2-.9 2-2 2S7 6.1 7 5zm8 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM4 9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2S4 10.1 4 9zm12 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-4 2c-3.3 0-6 2.7-6 6v1h12v-1c0-3.3-2.7-6-6-6z" fill="currentColor"/>
            </svg>
          </Link>

          {/* Правые иконки */}
          <div className="flex items-center gap-3">
            <button className="text-navy-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <Link to="/cart" className="relative text-navy-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Мобильное меню-drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-blue-100 bg-white animate-slide-down">
            <nav className="px-4 py-3 flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.href ?? `/catalog?category=${cat.key}`}
                  className="py-2.5 px-3 rounded-lg text-navy-700 hover:bg-blue-50 hover:text-blue-300 font-medium transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
