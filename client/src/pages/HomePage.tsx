import BannerCarousel from '../components/home/BannerCarousel'
import AdvantagesSection from '../components/home/AdvantagesSection'
import CategoryAccordion from '../components/home/CategoryAccordion'
import BrandsSection from '../components/home/BrandsSection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import BlogSection from '../components/home/BlogSection'
import FaqSection from '../components/home/FaqSection'
import QuestionnaireTeaser from '../components/home/QuestionnaireTeaser'

export default function HomePage() {
  return (
    <div>
      <BannerCarousel />
      <AdvantagesSection />
      <CategoryAccordion />
      <BrandsSection />
      <FeaturedProducts title="Популярные товары" />
      <QuestionnaireTeaser />
      <BlogSection />
      <FaqSection />
    </div>
  )
}
