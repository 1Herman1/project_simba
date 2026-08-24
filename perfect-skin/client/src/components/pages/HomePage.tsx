import { HeroSection } from '@/components/home/HeroSection'
import { CtaTiles } from '@/components/home/CtaTiles'
import { BrandsSection } from '@/components/home/BrandsSection'
import { CategoryAccordion } from '@/components/home/CategoryAccordion'
import { BestsellerSection } from '@/components/home/BestsellerSection'
import { WhyHeberFarma } from '@/components/home/WhyHeberFarma'
import { About } from '@/components/home/About'

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <HeroSection />

      {/* CTA Tiles: Подбор и Консультация */}
      <CtaTiles />

      {/* Quiz Teaser Anchor */}
      <div id="quiz-teaser" className="bg-background py-20 md:py-32">
        <div className="container-app">
          <h2 className="text-h2 font-heading font-bold mb-6">
            Подбор косметики
          </h2>
          <p className="text-body leading-body text-muted-foreground max-w-prose">
            Скоро здесь появится интерактивный тест для подбора идеальной программы ухода под ваш тип кожи и задачу.
          </p>
        </div>
      </div>

      {/* Brands */}
      <BrandsSection />

      {/* Categories */}
      <CategoryAccordion />

      {/* Bestsellers */}
      <BestsellerSection />

      {/* Why Heber Farma */}
      <WhyHeberFarma />

      {/* About */}
      <About />
    </>
  )
}
