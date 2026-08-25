import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { IconCart, IconHeart } from '@/components/icons'
import { DrawerProvider } from '@/context/DrawerContext'
import { CartProvider } from '@/context/CartContext'
import { AuthProvider } from '@/context/AuthContext'

const HomePage = lazy(() => import('@/components/pages/HomePage').then((m) => ({ default: m.HomePage })))
const CatalogPage = lazy(() => import('@/components/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const ProductPage = lazy(() => import('@/components/pages/ProductPage').then((m) => ({ default: m.ProductPage })))
const AuthPage = lazy(() => import('@/components/pages/AuthPage').then((m) => ({ default: m.AuthPage })))
const CheckoutPage = lazy(() => import('@/components/pages/CheckoutPage').then((m) => ({ default: m.CheckoutPage })))
const OrdersPage = lazy(() => import('@/components/pages/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderPage = lazy(() => import('@/components/pages/OrderPage').then((m) => ({ default: m.OrderPage })))
const NotFoundPage = lazy(() => import('@/components/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DrawerProvider>
          <CartProvider>
            <Layout cartIcon={<IconCart />} favoriteIcon={<IconHeart />}>
              <Suspense fallback={<div className="container-app py-24 text-muted-foreground">Загрузка…</div>}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<CatalogPage />} />
                  <Route path="/catalog/:slug" element={<CatalogPage />} />
                  <Route path="/product/:slug" element={<ProductPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:number" element={<OrderPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </Layout>
          </CartProvider>
        </DrawerProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
