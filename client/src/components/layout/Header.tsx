import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useDrawer } from '../../context/DrawerContext'
import { useScrolled } from '../../hooks/useScrolled'
import { CONTACTS } from '../../lib/contacts'
import { PhoneIcon, HeartIcon, CartIcon, UserIcon, TelegramIcon, SearchIcon } from '../icons'
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
              <PhoneIcon className="w-[18px] h-[18px]" />
              <span className="text-sm font-medium">{CONTACTS.phone}</span>
            </a>

            {/* Четыре кнопки, зазор 16px на всех. Увеличивается только та, на
                которую навели: волну соседей владелец попросил убрать. */}
            <div className="header-dock flex items-center gap-4">
              {/* Telegram */}
              <a
                href={CONTACTS.telegram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Написать в Telegram"
                className="btn-press header-icon-link w-11 h-11 inline-flex items-center justify-center rounded-full text-navy-500"
              >
                <span className="icon-swap block w-[22px] h-[22px]">
                  <TelegramIcon className="w-[22px] h-[22px]" />
                </span>
              </a>

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
                <span className="icon-swap block w-[22px] h-[22px]">
                  <HeartIcon className="w-[22px] h-[22px]" />
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
                <span className="icon-swap block w-[22px] h-[22px]">
                  <CartIcon className="w-[22px] h-[22px]" />
                </span>
                {cartCount > 0 && (
                  <span key={`cart-${cartCount}`} className="absolute -top-0.5 -right-0.5 bg-amber-400 text-navy-900 text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1 animate-badge-pop">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Профиль */}
              <Link to="/profile" aria-label="Профиль" className="btn-press header-icon-link relative w-11 h-11 inline-flex items-center justify-center rounded-full text-navy-500">
                <span className="icon-swap block w-[22px] h-[22px]">
                  <UserIcon className="w-[22px] h-[22px]" />
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
              <SearchIcon className="w-[22px] h-[22px]" />
            </button>
            <button
              type="button"
              onClick={() => openCart()}
              aria-label="Корзина"
              aria-haspopup="dialog"
              aria-expanded={drawer === 'cart'}
              className="btn-press relative text-navy-500 w-11 h-11 flex items-center justify-center"
            >
              <CartIcon className="w-[22px] h-[22px]" />
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
              <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer"
                 onClick={() => setMobileMenuOpen(false)}
                 className="flex items-center gap-2 py-2.5 px-3 min-h-11 rounded-lg text-navy-900 font-semibold hover:bg-blue-50">
                <TelegramIcon />
                Написать в Telegram
              </a>
              <div className="h-px bg-line my-2" />
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
