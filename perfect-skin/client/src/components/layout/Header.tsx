import { IconMenu } from '@/components/icons'
import { Link } from 'react-router-dom'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useDrawer } from '@/context/DrawerContext'
import { useCart } from '@/context/CartContext'

interface HeaderProps {
  cartIcon?: React.ReactNode
  favoriteIcon?: React.ReactNode
  onMobileMenuOpen?: () => void
}

const navItems = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Бренды', href: '/brands' },
  { label: 'О компании', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
]

export function Header({
  cartIcon,
  favoriteIcon,
  onMobileMenuOpen,
}: HeaderProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { openCart } = useDrawer()
  const { count } = useCart()

  return (
    <header className="border-b border-border bg-background">
      <div className="container-app py-6 md:py-8">
        <div className="flex items-center justify-between gap-2">
          {/* Logo + Tagline */}
          <div className="shrink-0">
            <Link to="/" className="focus-visible:outline-ring block">
              <img
                src="/logo/logo-wordmark.webp"
                alt="Perfect Skin"
                width={120}
                height={20}
                className="h-5 md:h-6 w-auto"
              />
            </Link>
            <p className="hidden md:block text-xs font-sans text-muted-foreground text-center whitespace-nowrap">
              Назначают врачи. Любит ваша кожа
            </p>
          </div>

          {/* Desktop Navigation */}
          {isDesktop && (
            <nav className="flex items-center gap-2 text-body font-sans">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Phone */}
            {isDesktop && (
              <a
                href="tel:+74951832848"
                className="text-body-sm font-sans text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-ring whitespace-nowrap"
              >
                +7 (495) 183-28-48
              </a>
            )}

            {/* Icons */}
            <div className="flex items-center gap-1">
              {cartIcon && (
                <div className="relative">
                  <button
                    onClick={openCart}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded-pill transition-colors duration-200 focus-visible:outline-ring"
                    aria-label={count > 0 ? `Корзина, ${count} товаров` : 'Корзина'}
                  >
                    {cartIcon}
                  </button>
                  {count > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold tabular-nums">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
              )}
              {favoriteIcon && (
                <button
                  className="w-12 h-12 flex items-center justify-center hover:bg-muted rounded-pill transition-colors duration-200 focus-visible:outline-ring"
                  aria-label="Избранное"
                >
                  {favoriteIcon}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            {!isDesktop && (
              <button
                onClick={onMobileMenuOpen}
                className="w-12 h-12 flex items-center justify-center focus-visible:outline-ring"
                aria-label="Меню"
                >
                  <IconMenu />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
