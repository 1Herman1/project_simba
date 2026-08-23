import { useEffect, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'
import { brandsApi, type Brand } from '../../lib/api'

/** Слаги, для которых логотип реально лежит в public/brands/.
    Без этого списка компонент запрашивал /brands/<slug>.png для всех брендов
    подряд: 8 из 12 гарантированно отдавали 404, и плитка сначала висела пустой,
    а потом «падала» в название — ровно то мигание, из-за которого секция
    выглядела недоделанной. Теперь текстовая плитка рендерится сразу.
    Источник истины — brand.logo из API; этот список нужен, пока поле пустое. */
const LOGO_FILES = new Set(['farmina', 'monge', 'hill-s', 'royal-canin'])

function logoSrc(brand: Brand): string | null {
  if (brand.logo) return brand.logo
  return LOGO_FILES.has(brand.slug) ? `/brands/${brand.slug}.png` : null
}

/** Плитка бренда — ссылка в каталог этого бренда.
    Логотип и название живут в одной полосе по высоте (40px, на lg — 48px):
    оптический вес выравнивается геометрией, поэтому смешанный ряд
    «часть с логотипами, часть с названиями» читается цельно, а не сломанно. */
function BrandTileLink({ brand }: { brand: Brand }) {
  const [failed, setFailed] = useState(false)
  const src = logoSrc(brand)
  const showLogo = src !== null && !failed

  return (
    <Link
      to={`/catalog?brand=${brand.slug}`}
      aria-label={`${brand.name} — товары бренда`}
      className="brand-card flex h-20 w-full items-center justify-center overflow-hidden rounded-card border border-line bg-white p-3 sm:h-24 lg:h-28 lg:p-4"
    >
      {showLogo ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="max-h-10 w-auto max-w-full object-contain lg:max-h-12"
        />
      ) : (
        <span className="text-balance break-words text-center text-base font-extrabold leading-tight tracking-tight text-navy-800 lg:text-lg">
          {brand.name}
        </span>
      )}
    </Link>
  )
}

/** Каскад по 45мс с потолком на 6-й плитке: в сетке 6 колонок это ровно первый
    ряд, второй въезжает целиком следом. */
const revealDelay = (i: number) => `${60 + Math.min(i, 5) * 45}ms`

export default function BrandsSection() {
  const groupRef = useReveal<HTMLDivElement>()
  const [brands, setBrands] = useState<Brand[]>([])

  useEffect(() => {
    brandsApi
      .list()
      .then((res) =>
        setBrands(res.data.slice().sort((a, b) => b.productCount - a.productCount)),
      )
      .catch(() => setBrands([]))
  }, [])

  if (brands.length === 0) return null

  return (
    <section id="brands" className="scroll-mt-24 py-12 md:py-16">
      <div ref={groupRef} className="reveal-group max-w-7xl mx-auto px-4">
        <h2 className="reveal-item text-2xl font-bold text-navy-900">Бренды, которым мы доверяем</h2>
        <p className="reveal-item mt-2 max-w-prose leading-relaxed text-navy-500">
          Все бренды, что есть в наличии. Нажмите на любой — откроется его каталог.
        </p>
        {/* Сетка, а не горизонтальный скролл: 12 брендов делятся на 3, 4 и 6 без
            остатка, поэтому последний ряд всегда полный и ряд центрирован сам
            собой. Скролл прижимал витрину влево и прятал 8 брендов за краем. */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
          {brands.map((brand, i) => (
            <div
              key={brand.slug}
              className="reveal-item"
              style={{ '--reveal-delay': revealDelay(i) } as CSSProperties}
            >
              <BrandTileLink brand={brand} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
