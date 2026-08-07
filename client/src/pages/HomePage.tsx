import { type ReactNode } from 'react'
import BannerCarousel from '../components/home/BannerCarousel'
import QuestionnaireTeaser from '../components/home/QuestionnaireTeaser'
import CategoryAccordion from '../components/home/CategoryAccordion'
import AdvantagesSection from '../components/home/AdvantagesSection'
import FeaturedProducts from '../components/home/FeaturedProducts'
import BrandsSection from '../components/home/BrandsSection'
import AboutSection from '../components/home/AboutSection'
import FaqSection from '../components/home/FaqSection'
import TrustSection from '../components/home/TrustSection'
import BlogSection from '../components/home/BlogSection'
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
      <Reveal><AdvantagesSection /></Reveal>
      <Reveal><FeaturedProducts title="Популярные товары" /></Reveal>
      <Reveal><BrandsSection /></Reveal>
      <Reveal><AboutSection /></Reveal>
      <Reveal><FaqSection /></Reveal>
      <Reveal><TrustSection /></Reveal>
      {/* Без <Reveal>: у секции собственный каскад .reveal-group */}
      <BlogSection />
    </div>
  )
}
