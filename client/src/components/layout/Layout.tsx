import { Outlet } from 'react-router-dom'
import Header from './Header'
import MobileBottomNav from './MobileBottomNav'
import Footer from './Footer'

export default function Layout() {
  return (
    <div className="min-h-screen bg-blue-50 flex flex-col">
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
