import { type ReactNode } from 'react'
import BannerCarousel from '../components/home/BannerCarousel'
import QuestionnaireTeaser from '../components/home/QuestionnaireTeaser'
import CategoryAccordion from '../components/home/CategoryAccordion'
import TrustSection from '../components/home/TrustSection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import AdvantagesSection from '../components/home/AdvantagesSection'
import BrandsSection from '../components/home/BrandsSection'
import AboutSection from '../components/home/AboutSection'
import FaqSection from '../components/home/FaqSection'
import ReviewsSection from '../components/home/ReviewsSection'
import { useReveal } from '../hooks/useReveal'

/** Оборачивает секцию в scroll-reveal (fade + подъём 16px). Баннер не оборачиваем — он над сгибом. */
function Reveal({ children }: { children: ReactNode }) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  )
}

export default function HomePage() {
  return (
    <div>
      <BannerCarousel />
      <Reveal><QuestionnaireTeaser /></Reveal>
      <Reveal><CategoryAccordion /></Reveal>
      <Reveal><TrustSection /></Reveal>
      <Reveal><FeaturedProducts title="Популярные товары" /></Reveal>
      <Reveal><AdvantagesSection /></Reveal>
      <Reveal><BrandsSection /></Reveal>
      <Reveal><AboutSection /></Reveal>
      <Reveal><FaqSection /></Reveal>
      <Reveal><ReviewsSection /></Reveal>
    </div>
  )
}
