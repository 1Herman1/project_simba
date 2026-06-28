import BannerCarousel from '../components/home/BannerCarousel'
import BrandsSection from '../components/home/BrandsSection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import PromoStrip from '../components/home/PromoStrip'
import QuestionnaireTeaser from '../components/home/QuestionnaireTeaser'

export default function HomePage() {
  return (
    <div>
      <BannerCarousel />
      <PromoStrip />
      <BrandsSection />
      <FeaturedProducts title="Популярные товары" />
      <QuestionnaireTeaser />
      <FeaturedProducts title="Новинки" />
    </div>
  )
}
