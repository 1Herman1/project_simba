import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useDrawer } from '../../context/DrawerContext'
import { useScrolled } from '../../hooks/useScrolled'
import { CONTACTS } from '../../lib/contacts'
import HeaderSearch from './HeaderSearch'
import SearchModal from './SearchModal'

const categories = [
  {
    label: 'Кошки',
    key: 'cats',
    subcategories: [
      { label: 'Сухой корм', href: '/catalog?category=cats-food&format=dry' },
      { label: 'Влажный корм', href: '/catalog?category=cats-food&format=wet' },
      { label: 'Лечебное питание', href: '/catalog?category=cats-food&purpose=medical' },
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
      { label: 'Сухой корм', href: '/catalog?category=dogs-food&format=dry' },
      { label: 'Влажный корм', href: '/catalog?category=dogs-food&format=wet' },
      { label: 'Лечебное питание', href: '/catalog?category=dogs-food&purpose=medical' },
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
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count: cartCount } = useCart()
  const { count: favCount } = useFavorites()
  const { openCart, openFavorites, drawer } = useDrawer()
  const isScrolled = useScrolled(10)

  return (
    <header className={`sticky top-0 z-40 transition-[background-color,box-shadow] duration-200 ease-smooth ${isScrolled ? 'bg-white/95 supports-[backdrop-filter]:bg-white/80 backdrop-blur-md shadow-md' : 'bg-white shadow-sm'}`}>
      {/* Десктоп шапка */}
      <div className="hidden md:block">
        {/* Строка 1 */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Логотип */}
          <Link to="/" className="flex items-center flex-shrink-0 header-logo">
            <img src="/logo-header.png" alt="Симба" className="h-10 w-auto block relative top-[8px]" />
          </Link>

          {/* Поиск */}
          <HeaderSearch open={searchOpen} onOpen={() => setSearchOpen(true)} />

          {/* Иконки справа */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Телефон */}
            <a href={CONTACTS.phoneHref} className="btn-press flex items-center gap-1.5 text-navy-700 hover:text-primary-hover" aria-label="Позвонить">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="text-sm font-medium">{CONTACTS.phone}</span>
            </a>

            {/* Три кнопки */}
            <div className="flex items-center gap-4">
              {/* Избранное */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false)
                  openFavorites()
                }}
                aria-label="Избранное"
                aria-haspopup="dialog"
                aria-expanded={drawer === 'favorites'}
                className="btn-press header-icon-link relative w-11 h-11 inline-flex items-center justify-center rounded-full text-navy-500"
              >
                <span className="icon-swap relative block w-[22px] h-[22px]">
                  <svg className="icon-outline absolute inset-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                  <svg className="icon-filled absolute inset-0" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </span>
                {favCount > 0 && (
                  <span key={`fav-${favCount}`} className="absolute -top-0.5 -right-0.5 bg-amber-400 text-navy-900 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-badge-pop">
                    {favCount}
                  </span>
                )}
              </button>

              {/* Корзина */}
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false)
                  openCart()
                }}
                aria-label="Корзина"
                aria-haspopup="dialog"
                aria-expanded={drawer === 'cart'}
                className="btn-press header-icon-link relative w-11 h-11 inline-flex items-center justify-center rounded-full text-navy-500"
              >
                <span className="icon-swap relative block w-[22px] h-[22px]">
                  <svg className="icon-outline absolute inset-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
                  </svg>
                  {/* Заливка — отдельная замкнутая геометрия, не тот же path что в outline:
                      контур выше не имеет Z (замыкающей команды), и при fill браузер сам
                      дорисовывает прямую от последней точки к первой прямо через ручку —
                      получался кривой треугольный обрубок вместо ручки (проверено рендером). */}
                  <svg className="icon-filled absolute inset-0" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                    <path d="M3 3h2l.4 2H21a1 1 0 0 1 .98 1.2l-1.6 8A2 2 0 0 1 18.42 16H8.58a2 2 0 0 1-1.96-1.6L4.6 5H3a1 1 0 1 1 0-2Z"/>
                    <circle cx="9" cy="20" r="1.6"/>
                    <circle cx="18" cy="20" r="1.6"/>
                  </svg>
                </span>
                {cartCount > 0 && (
                  <span key={`cart-${cartCount}`} className="absolute -top-0.5 -right-0.5 bg-amber-400 text-navy-900 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-badge-pop">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Профиль */}
              <Link to="/profile" aria-label="Профиль" className="btn-press header-icon-link relative w-11 h-11 inline-flex items-center justify-center rounded-full text-navy-500">
                <span className="icon-swap relative block w-[22px] h-[22px]">
                  <svg className="icon-outline absolute inset-0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <svg className="icon-filled absolute inset-0" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden>
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Строка 2 — навигация с мегаменю */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-smooth ${isScrolled ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100'} border-t border-line relative`}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <div className="overflow-hidden">
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
                      className="block px-4 py-3 text-sm font-medium text-navy-700 hover:text-primary-hover hover:bg-blue-50 transition-colors duration-100 ease-smooth"
                    >
                      {cat.label}
                    </Link>
                  ) : (
                    <span className="block px-4 py-3 text-sm font-medium text-navy-700 hover:text-primary-hover hover:bg-blue-50 transition-colors duration-100 ease-smooth cursor-default">
                      {cat.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          </div>
        </div>

        {/* Мегаменю */}
        {activeCategory && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-line animate-slide-down z-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="grid grid-cols-4 gap-4">
                {categories
                  .find((c) => c.key === activeCategory)
                  ?.subcategories?.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.href}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-navy-700 hover:bg-blue-50 hover:text-primary-hover transition-colors duration-100 ease-smooth text-sm"
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

      {/* Мобильная шапка */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Бургер */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-press text-navy-700 -ml-2 w-11 h-11 flex items-center justify-center"
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            type="button"
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
            <img src="/logo-header.png" alt="Симба" className="h-8 w-auto" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-amber-400">
              <path d="M7 5C7 3.9 7.9 3 9 3s2 .9 2 2-.9 2-2 2S7 6.1 7 5zm8 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM4 9c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2S4 10.1 4 9zm12 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-4 2c-3.3 0-6 2.7-6 6v1h12v-1c0-3.3-2.7-6-6-6z" fill="currentColor"/>
            </svg>
          </Link>

          {/* Правые иконки */}
          <div className="flex items-center gap-1">
            <button aria-label="Поиск" className="btn-press text-navy-500 w-11 h-11 flex items-center justify-center" type="button" onClick={() => setSearchOpen(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
            <button
              type="button"
              onClick={() => openCart()}
              aria-label="Корзина"
              aria-haspopup="dialog"
              aria-expanded={drawer === 'cart'}
              className="btn-press relative text-navy-500 w-11 h-11 flex items-center justify-center"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span key={`cart-mobile-${cartCount}`} className="absolute -top-0.5 -right-0.5 bg-amber-400 text-navy-900 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-badge-pop">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Мобильное меню-drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-line bg-white animate-slide-down">
            <nav className="px-4 py-3 flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.href ?? `/catalog?category=${cat.key}`}
                  className="py-2.5 px-3 rounded-lg text-navy-700 hover:bg-blue-50 hover:text-primary-hover font-medium transition-colors duration-100 ease-smooth"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Модалка поиска */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
