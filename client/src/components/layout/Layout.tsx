import { useLocation, Outlet } from 'react-router-dom'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'
import Footer from './Footer'
import PopularProducts from '../PopularProducts'

export default function Layout() {
  const location = useLocation()
  // Главная исключена по просьбе владельца: там своя вёрстка секций, и блок
  // внизу дублировал бы то, что уже показано выше. Юридические страницы —
  // не место для витрины.
  const hiddenRoutes = ['/', '/privacy', '/offer']
  const showPopularProducts = !hiddenRoutes.includes(location.pathname)

  return (
    <div className="min-h-[100dvh] bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {showPopularProducts && <PopularProducts />}
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
