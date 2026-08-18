import { NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useDrawer } from '../../context/DrawerContext'

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  )
}

function CartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
    </svg>
  )
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

export default function MobileBottomNav() {
  const { count: cartCount } = useCart()
  const { count: favCount } = useFavorites()
  const { openCart, openFavorites, drawer } = useDrawer()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-line z-50">
      <div className="flex pb-[env(safe-area-inset-bottom)]">
        {/* Главная */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 pb-3 transition-colors duration-100 ease ${
              isActive ? 'text-primary-hover' : 'text-navy-500'
            }`
          }
        >
          <div className="relative">
            <HomeIcon />
          </div>
          <span className="text-xs mt-0.5 font-medium">Главная</span>
        </NavLink>

        {/* Избранное */}
        <button
          type="button"
          onClick={() => openFavorites()}
          className={`flex-1 flex flex-col items-center py-2 pb-3 transition-colors duration-100 ease ${
            drawer === 'favorites' ? 'text-primary-hover' : 'text-navy-500'
          }`}
        >
          <div className="relative">
            <HeartIcon />
            {favCount > 0 && (
              <span key={`fav-nav-${favCount}`} className="absolute -top-1 -right-1 bg-primary text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-0.5 animate-badge-pop">
                {favCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-0.5 font-medium">Избранное</span>
        </button>

        {/* Корзина */}
        <button
          type="button"
          onClick={() => openCart()}
          className={`flex-1 flex flex-col items-center py-2 pb-3 transition-colors duration-100 ease ${
            drawer === 'cart' ? 'text-primary-hover' : 'text-navy-500'
          }`}
        >
          <div className="relative">
            <CartIcon />
            {cartCount > 0 && (
              <span key={`cart-nav-${cartCount}`} className="absolute -top-1 -right-1 bg-primary text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-0.5 animate-badge-pop">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs mt-0.5 font-medium">Корзина</span>
        </button>

        {/* Профиль */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 pb-3 transition-colors duration-100 ease ${
              isActive ? 'text-primary-hover' : 'text-navy-500'
            }`
          }
        >
          <div className="relative">
            <UserIcon />
          </div>
          <span className="text-xs mt-0.5 font-medium">Профиль</span>
        </NavLink>
      </div>
    </nav>
  )
}
