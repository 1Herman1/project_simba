import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { useDrawer } from '../../context/DrawerContext'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'
import Footer from './Footer'
import PopularProducts from '../PopularProducts'
import CartDrawer from './CartDrawer'
import FavoritesDrawer from './FavoritesDrawer'
import QuizModal from '../quiz/QuizModal'

export default function Layout() {
  const location = useLocation()
  const { drawer, close } = useDrawer()

  // Закрываем шторку при смене страницы — но не когда сама смена пути и есть
  // редирект DrawerRoute (/cart, /favorites -> /catalog): он сам только что
  // открыл шторку, и без этой проверки следующая же смена пути закрыла бы её
  // немедленно (см. DrawerRoute.tsx).
  useEffect(() => {
    const state = location.state as { skipDrawerClose?: boolean } | null
    if (state?.skipDrawerClose) return
    close()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, close])

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
      <CartDrawer open={drawer === 'cart'} onClose={close} />
      <FavoritesDrawer open={drawer === 'favorites'} onClose={close} />
      <QuizModal open={drawer === 'quiz'} onClose={close} />
    </div>
  )
}
