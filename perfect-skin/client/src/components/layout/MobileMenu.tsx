import { Link } from 'react-router-dom'
import { IconClose } from '@/components/icons'
import { useEffect } from 'react'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { label: 'Каталог', href: '/catalog' },
  { label: 'Бренды', href: '/brands' },
  { label: 'О компании', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-sm bg-card shadow-lg z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted rounded-full transition-colors duration-200 focus-visible:outline-ring"
            aria-label="Закрыть меню"
          >
            <IconClose />
          </button>

          <nav className="flex flex-col gap-4 mt-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-body font-sans text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-ring py-2"
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border mt-8 pt-8">
            <p className="text-label font-sans font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Контакты
            </p>
            <a
              href="tel:+74951832848"
              className="text-body-sm font-sans text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-ring block"
            >
              +7 (495) 183-28-48
            </a>
            <a
              href="mailto:mail@perfect-skin.shop"
              className="text-body-sm font-sans text-foreground hover:text-primary transition-colors duration-200 focus-visible:outline-ring block mt-2"
            >
              mail@perfect-skin.shop
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
