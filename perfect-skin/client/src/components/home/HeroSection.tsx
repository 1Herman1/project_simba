import { Link } from 'react-router-dom'

export function HeroSection() {
  const handleQuizScroll = () => {
    const el = document.getElementById('quiz-teaser')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="bg-background pt-12 md:pt-24 pb-20 md:pb-32">
      <div className="container-app">
        {/* Grid: left (text) + right (card with accent bg) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-start">
          {/* LEFT: Text, buttons, tags */}
          <div>
            {/* Badge */}
            <div className="inline-block bg-accent text-foreground px-4 py-2 rounded-pill text-label font-bold uppercase tracking-wide mb-8 md:mb-12">
              ИСПАНИЯ · HEBER FARMA · С 2017 ГОДА
            </div>

            {/* Main heading */}
            <h1 className="text-display font-heading font-bold mb-8 md:mb-10 leading-tight">
              ПРО-КОСМЕТИКА
              <br className="hidden sm:block" />
              ИЗ ИСПАНИИ
            </h1>

            {/* Subtitle */}
            <p className="text-body leading-body text-muted-foreground mb-10 md:mb-12 max-w-prose">
              Два бренда фармацевтического производства — для домашнего ухода и
              для работы в кабинете косметолога.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 md:mb-16">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center bg-foreground text-card font-heading font-bold px-8 py-4 rounded-pill transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-h-12"
              >
                Смотреть каталог
              </Link>
              <button
                onClick={handleQuizScroll}
                className="inline-flex items-center justify-center bg-accent text-foreground font-heading font-bold px-8 py-4 rounded-pill border-2 border-accent transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-h-12"
              >
                Подобрать уход
              </button>
            </div>

            {/* Benefit tags */}
            <div className="flex flex-col gap-3">
              <div className="text-body-sm font-bold text-foreground">
                40+ ПОЗИЦИЙ
              </div>
              <div className="text-body-sm font-bold text-foreground">
                ОФИЦИАЛЬНЫЙ ДИСТРИБЬЮТОР
              </div>
              <div className="text-body-sm font-bold text-foreground">
                ВСЯ ПРОДУКЦИЯ СЕРТИФИЦИРОВАНА
              </div>
            </div>
          </div>

          {/* RIGHT: Accent background with product card */}
          <div className="relative min-h-96 md:min-h-full">
            {/* Accent bg block (golden) */}
            <div className="absolute inset-0 bg-accent rounded-block md:rounded-2xl -z-10 hidden md:block" />

            {/* Product card (white) */}
            <div className="bg-card rounded-block p-8 md:p-10 relative">
              {/* Badge */}
              <div className="text-label font-bold text-accent mb-2">
                ХИТ ПРОДАЖ · ISSEIMI BASE
              </div>

              {/* Product title */}
              <h2 className="text-h3 md:text-h2 font-heading font-bold mb-4">
                Beevenom Cream
              </h2>

              {/* Product description */}
              <p className="text-body leading-body text-muted-foreground mb-8">
                Антивозрастной крем с пчелиным ядом
              </p>

              {/* Price */}
              <div className="text-display font-heading font-bold text-foreground mb-8">
                8&nbsp;077&nbsp;₽
              </div>

              {/* CTA Button */}
              <button className="w-full bg-foreground text-card font-heading font-bold py-4 rounded-pill transition-opacity duration-200 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-h-12">
                В корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
