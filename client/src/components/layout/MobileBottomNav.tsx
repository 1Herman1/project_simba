import { NavLink } from 'react-router-dom'

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

const navItems = [
  { Icon: HomeIcon, label: 'Главная', path: '/', badge: null },
  { Icon: HeartIcon, label: 'Избранное', path: '/favorites', badge: null },
  { Icon: CartIcon, label: 'Корзина', path: '/cart', badge: 3 },
  { Icon: UserIcon, label: 'Профиль', path: '/profile', badge: null },
]

export default function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 z-50">
      <div className="flex">
        {navItems.map(({ Icon, label, path, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 pb-3 transition-all ${
                isActive ? 'text-blue-300' : 'text-navy-300'
              }`
            }
          >
            <div className="relative">
              <Icon />
              {badge !== null && (
                <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-[10px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-0.5">
                  {badge}
                </span>
              )}
            </div>
            <span className="text-xs mt-0.5 font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
