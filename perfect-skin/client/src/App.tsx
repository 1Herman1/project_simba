import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/components/pages/HomePage'
import { CatalogPage } from '@/components/pages/CatalogPage'
import { ProductPage } from '@/components/pages/ProductPage'
import { NotFoundPage } from '@/components/pages/NotFoundPage'
import { IconCart, IconHeart } from '@/components/icons'

function App() {
  return (
    <BrowserRouter>
      <Layout cartIcon={<IconCart />} favoriteIcon={<IconHeart />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/catalog/:slug" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
