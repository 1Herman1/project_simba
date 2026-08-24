import { ReactNode, useState } from 'react'
import { TopBar } from './TopBar'
import { Header } from './Header'
import { MobileMenu } from './MobileMenu'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
  cartIcon?: ReactNode
  favoriteIcon?: ReactNode
}

export function Layout({
  children,
  cartIcon,
  favoriteIcon,
}: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <TopBar />
      <Header
        cartIcon={cartIcon}
        favoriteIcon={favoriteIcon}
        onMobileMenuOpen={() => setMobileMenuOpen(true)}
      />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
