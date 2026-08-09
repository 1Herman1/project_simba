import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'

// Brand colors are proprietary brand identities, not system design tokens
// eslint-disable-next-line design-lint/no-hex-colors
const brands = [
  { name: "Hill's", slug: 'hills', color: '#E8003D' },
  { name: 'Farmina', slug: 'farmina', color: '#2E7D32' },
  { name: 'Monge', slug: 'monge', color: '#1565C0' },
  { name: 'Royal Canin', slug: 'royal-canin', color: '#C62828' },
  { name: 'Purina Pro Plan', slug: 'purina', color: '#E65100' },
  { name: 'Brit', slug: 'brit', color: '#1B5E20' },
  { name: 'Acana', slug: 'acana', color: '#6A1B9A' },
  { name: 'Orijen', slug: 'orijen', color: '#37474F' },
]

/** Логотип бренда — файл кладётся в public/brands/<slug>.png (см. README там же).
    Пока файла нет — показываем текстовое название, без «битой» картинки. */
function BrandMark({ brand }: { brand: (typeof brands)[number] }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="font-bold text-sm text-center px-2 leading-tight" style={{ color: brand.color }}>
        {brand.name}
      </span>
    )
  }

  return (
    <img
      src={`/brands/${brand.slug}.png`}
      alt={brand.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="max-h-12 max-w-[88%] w-auto object-contain"
    />
  )
}

/** Заголовок едет первым (0мс), карточки — каскадом по 60мс.
    Потолок на 4-й: дальше карточки всё равно за краем вьюпорта. */
const revealDelay = (i: number) => `${60 + Math.min(i, 3) * 60}ms`

export default function BrandsSection() {
  const groupRef = useReveal<HTMLDivElement>()

  return (
    <section id="brands" className="scroll-mt-24 py-12 md:py-16">
    <div ref={groupRef} className="reveal-group max-w-7xl mx-auto px-4">
      <h2 className="reveal-item text-xl font-bold text-navy-900 mb-3">Бренды, которым мы доверяем</h2>
      {/* pt-2/pb-3 — место под подъём карточки и тень: overflow-x-auto
          включает overflow-y: auto и без паддинга обрезает hover сверху. */}
      <div className="flex gap-4 overflow-x-auto pt-2 pb-3 scrollbar-hide">
        {brands.map((brand, i) => (
          <div
            key={brand.slug}
            className="reveal-item flex-shrink-0"
            style={{ '--reveal-delay': revealDelay(i) } as CSSProperties}
          >
            <Link
              to={`/catalog?brand=${brand.slug}`}
              className="flex w-36 h-24 items-center justify-center bg-white rounded-card shadow-card border border-line p-3 transition-[transform,border-color] duration-100 ease-out hover:-translate-y-0.5 hover:border-primary-soft"
            >
              <BrandMark brand={brand} />
            </Link>
          </div>
        ))}
      </div>
    </div>
    </section>
  )
}
