import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { IconCart, IconHeart } from '@/components/icons'
import { DrawerProvider } from '@/context/DrawerContext'
import { CartProvider } from '@/context/CartContext'

const HomePage = lazy(() => import('@/components/pages/HomePage').then((m) => ({ default: m.HomePage })))
const CatalogPage = lazy(() => import('@/components/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })))
const ProductPage = lazy(() => import('@/components/pages/ProductPage').then((m) => ({ default: m.ProductPage })))
const NotFoundPage = lazy(() => import('@/components/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })))

function App() {
  return (
    <BrowserRouter>
      <DrawerProvider>
        <CartProvider>
          <Layout cartIcon={<IconCart />} favoriteIcon={<IconHeart />}>
            <Suspense fallback={<div className="container-app py-24 text-muted-foreground">Загрузка…</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/catalog/:slug" element={<CatalogPage />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </CartProvider>
      </DrawerProvider>
    </BrowserRouter>
  )
}

export default App
