import { NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useFavorites } from '../../context/FavoritesContext'
import { useDrawer } from '../../context/DrawerContext'
import { HomeIcon, HeartIcon, CartIcon, UserIcon } from '../icons'

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
            <HomeIcon className="w-6 h-6" />
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
            <HeartIcon className="w-6 h-6" />
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
            <CartIcon className="w-6 h-6" />
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
            <UserIcon className="w-6 h-6" />
          </div>
          <span className="text-xs mt-0.5 font-medium">Профиль</span>
        </NavLink>
      </div>
    </nav>
  )
}
