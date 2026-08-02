import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import CartPage from './pages/CartPage'
import FavoritesPage from './pages/FavoritesPage'
import ProfilePage from './pages/ProfilePage'
import ProductPage from './pages/ProductPage'
import AuthPage from './pages/AuthPage'
import CheckoutPage from './pages/CheckoutPage'
import BonusesPage from './pages/BonusesPage'
import DeliveryPage from './pages/DeliveryPage'
import ReturnsPage from './pages/ReturnsPage'
import FaqPage from './pages/FaqPage'
import QuestionnairePage from './pages/QuestionnairePage'
import AboutPage from './pages/AboutPage'
import TrustPage from './pages/TrustPage'
import CertificatesPage from './pages/CertificatesPage'
import ReviewsPage from './pages/ReviewsPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/bonuses" element={<BonusesPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/questionnaire" element={<QuestionnairePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/trust" element={<TrustPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
