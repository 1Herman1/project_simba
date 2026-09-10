import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useDrawer } from '../../context/DrawerContext'
import { CONTACTS } from '../../lib/contacts'
import { HeartIcon, CartIcon, UserIcon, TelegramIcon, SearchIcon } from '../icons'
import SearchModal from './SearchModal'

const categories = [
  {
    label: 'Собаки',
    key: 'dogs',
    href: '/catalog?species=dog',
    subcategories: [
      { label: 'Сухой корм', href: '/catalog?category=dogs-food&format=dry' },
      { label: 'Влажный корм', href: '/catalog?category=dogs-food&format=wet' },
      { label: 'Лечебное питание', href: '/catalog?category=dogs-food&purpose=medical' },
      { label: 'Лакомства', href: '/catalog?category=treats' },
    ],
  },
  {
    label: 'Коты и кошки',
    key: 'cats',
    href: '/catalog?species=cat',
    subcategories: [
      { label: 'Сухой корм', href: '/catalog?category=cats-food&format=dry' },
      { label: 'Влажный корм', href: '/catalog?category=cats-food&format=wet' },
      { label: 'Лечебное питание', href: '/catalog?category=cats-food&purpose=medical' },
    ],
  },
  {
    label: 'Ветаптека',
    key: null,
    href: '/catalog?category=care',
  },
]

export default function Header() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { count: cartCount } = useCart()
  const { count: favCount } = useFavorites()
  const { openCart, openFavorites, drawer } = useDrawer()

  return (
    <header className="fixed top-[10px] left-0 right-0 z-50">
      {/* Десктоп шапка — пилюля */}
      <div className="hidden md:block px-4" onMouseLeave={() => setActiveCategory(null)}>
        {/* Пилюля */}
        <div className="max-w-7xl mx-auto rounded-full px-8 h-16 flex items-center justify-between bg-[rgb(119_119_119_/_0.5)] supports-[backdrop-filter]:backdrop-blur-[8px] shadow-md drop-shadow-sm">
          {/* Слева — навигация */}
          <nav className="flex items-center gap-6">
            {categories.map((cat) => (
              <div
                key={cat.label}
                onMouseEnter={() => cat.key ? setActiveCategory(cat.key) : setActiveCategory(null)}
                className="relative"
              >
                <Link
                  to={cat.href}
                  className="text-white font-medium text-sm transition-opacity duration-100 hover:opacity-75 drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.35)]"
                >
                  {cat.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* По центру — логотип */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center flex-shrink-0 header-logo">
            <img src="/logo-header.png" alt="Симба" className="w-40 h-auto" />
          </Link>

          {/* Справа — иконки */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Telegram */}
            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Написать в Telegram"
              className="btn-press header-pill-icon w-11 h-11 inline-flex items-center justify-center rounded-xl text-[#0088cc]"
            >
              <TelegramIcon className="w-[22px] h-[22px]" />
            </a>

            {/* Поиск */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Поиск"
              className="btn-press header-pill-icon w-11 h-11 inline-flex items-center justify-center rounded-xl text-white"
            >
              <SearchIcon className="w-[22px] h-[22px]" />
            </button>

            {/* Профиль */}
            <Link to="/profile" aria-label="Профиль" className="btn-press header-pill-icon w-11 h-11 inline-flex items-center justify-center rounded-xl text-white">
              <UserIcon className="w-[22px] h-[22px]" />
            </Link>

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
              className="btn-press header-pill-icon relative w-11 h-11 inline-flex items-center justify-center rounded-xl text-white"
            >
              <HeartIcon className="w-[22px] h-[22px]" />
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
              className="btn-press header-pill-icon relative w-11 h-11 inline-flex items-center justify-center rounded-xl text-white"
            >
              <CartIcon className="w-[22px] h-[22px]" />
              {cartCount > 0 && (
                <span key={`cart-${cartCount}`} className="absolute -top-0.5 -right-0.5 bg-amber-400 text-navy-900 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-badge-pop">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Мегаменю — под пилюлей */}
        {activeCategory && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[calc(2.5rem+20px)] mt-4 bg-white rounded-card shadow-md overflow-hidden animate-slide-down z-50 max-w-sm">
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-x-3 gap-y-2">
                {categories
                  .find((c) => c.key === activeCategory)
                  ?.subcategories?.map((sub) => (
                    <Link
                      key={sub.label}
                      to={sub.href}
                      className="block px-3 py-2 rounded-lg text-navy-700 text-sm font-medium hover:bg-blue-50 transition-colors duration-100"
                      onClick={() => setActiveCategory(null)}
                    >
                      {sub.label}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Мобильная шапка */}
      <div className="md:hidden px-4 pt-2">
        {/* Пилюля мобильная */}
        <div className="flex items-center justify-between h-14 bg-[rgb(119_119_119_/_0.5)] supports-[backdrop-filter]:backdrop-blur-[8px] rounded-full px-4 drop-shadow-sm">
          {/* Бургер */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn-press text-white w-10 h-10 flex items-center justify-center -ml-2"
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileMenuOpen}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                 className={`ico-burger ${mobileMenuOpen ? 'is-open' : ''}`} aria-hidden="true">
              <g className="ico-burger__lines">
                <path d="M3 5h18M3 12h18M3 19h18" />
              </g>
              <g className="ico-burger__close">
                <path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" />
              </g>
            </svg>
          </button>

          {/* Логотип по центру */}
          <Link to="/" className="flex items-center flex-shrink-0 absolute left-1/2 -translate-x-1/2">
            <img src="/logo-header.png" alt="Симба" className="w-24 h-auto" />
          </Link>

          {/* Корзина справа */}
          <button
            type="button"
            onClick={() => openCart()}
            aria-label="Корзина"
            aria-haspopup="dialog"
            aria-expanded={drawer === 'cart'}
            className="btn-press relative text-white w-10 h-10 flex items-center justify-center -mr-2"
          >
            <CartIcon className="w-[22px] h-[22px]" />
            {cartCount > 0 && (
              <span key={`cart-mobile-${cartCount}`} className="absolute -top-0.5 -right-0.5 bg-amber-400 text-navy-900 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-badge-pop">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="mt-2 bg-white rounded-card shadow-md overflow-hidden animate-slide-down">
            <nav className="px-4 py-3 flex flex-col gap-1">
              {categories.map((cat) => (
                <Link
                  key={cat.label}
                  to={cat.href}
                  className="py-3 px-3 rounded-lg font-medium text-navy-900 hover:bg-blue-50 transition-colors duration-100"
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
