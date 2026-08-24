export function WhyHeberFarma() {
  return (
    <section className="bg-dark text-dark-foreground py-20 md:py-32">
      <div className="container-app">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
          {/* LEFT: Text + Stats */}
          <div>
            <h2 className="text-h2 font-heading font-bold mb-6 md:mb-8">
              Почему Heber Farma
            </h2>

            <p className="text-body leading-body text-dark-foreground opacity-90 mb-6 md:mb-10">
              Heber Farma — испанский фармацевтический концерн с более чем
              30-летней историей разработки и производства космецевтики.
            </p>

            <p className="text-body leading-body text-dark-foreground opacity-80 mb-10 md:mb-16">
              Продукция сертифицирована и используется в косметологических
              кабинетах 40+ стран мира. Мы — официальный дистрибьютор с 2017
              года.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-8 md:gap-12">
              {/* Stat 1: 30+ years */}
              <div>
                <div className="text-display font-heading font-bold text-accent mb-2">
                  30+
                </div>
                <p className="text-body-sm text-dark-foreground opacity-80">
                  Лет фармацевтических исследований
                </p>
              </div>

              {/* Stat 2: 40+ countries */}
              <div>
                <div className="text-display font-heading font-bold text-accent mb-2">
                  40+
                </div>
                <p className="text-body-sm text-dark-foreground opacity-80">
                  Стран-партнёров
                </p>
              </div>

              {/* Stat 3: 2017 */}
              <div>
                <div className="text-display font-heading font-bold text-accent mb-2">
                  2017
                </div>
                <p className="text-body-sm text-dark-foreground opacity-80">
                  Начало дистрибуции в России
                </p>
              </div>

              {/* Stat 4: Certified */}
              <div>
                <div className="text-display font-heading font-bold text-accent mb-2">
                  100%
                </div>
                <p className="text-body-sm text-dark-foreground opacity-80">
                  Продукция сертифицирована
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Image (cosmetologist, b&w) */}
          <div className="relative h-96 md:h-full md:min-h-96">
            <img
              src="/photos/5462985731371375337.jpg"
              alt="Косметолог с кистью"
              width={600}
              height={600}
              loading="lazy"
              className="w-full h-full object-cover rounded-block"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
