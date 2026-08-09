import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useReveal } from '../../hooks/useReveal'

/** mark: 'plaque' — логотип на собственной цветной подложке (Farmina/Brit/Orijen).
    Карточка красится фирменным цветом плашки (bg) целиком, а сам логотип
    показывается ЦЕЛИКОМ без обрезки (object-contain) — так карточка залита
    цветом до края, но верх/низ квадратных лого (Farmina, Orijen) не съедаются
    в широком боксе, как было бы с object-cover.
    'mark' — логотип на прозрачном фоне, рендерится крупнее, чтобы не теряться
    рядом с плашками (см. design-reviewer: разброс оптического веса ×5). */
const brands = [
  { name: "Hill's", slug: 'hills', kind: 'mark' as const },
  { name: 'Farmina', slug: 'farmina', kind: 'plaque' as const, bg: '#0F70B5' },
  { name: 'Monge', slug: 'monge', kind: 'mark' as const },
  { name: 'Royal Canin', slug: 'royal-canin', kind: 'mark' as const },
  { name: 'Purina Pro Plan', slug: 'purina', kind: 'mark' as const },
  { name: 'Brit', slug: 'brit', kind: 'plaque' as const, bg: '#082459' },
  { name: 'Acana', slug: 'acana', kind: 'mark' as const },
  { name: 'Orijen', slug: 'orijen', kind: 'plaque' as const, bg: '#E2231B' },
]

/** Логотип бренда — файл кладётся в public/brands/<slug>.png (см. README там же).
    Пока файла нет — показываем текстовое название, без «битой» картинки. */
function BrandMark({ brand }: { brand: (typeof brands)[number] }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span className="font-bold text-sm text-center px-2 leading-tight text-navy-900">
        {brand.name}
      </span>
    )
  }

  if (brand.kind === 'plaque') {
    return (
      <img
        src={`/brands/${brand.slug}.png`}
        alt={brand.name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="max-h-[4.75rem] max-w-[92%] w-auto object-contain"
      />
    )
  }

  return (
    <img
      src={`/brands/${brand.slug}.png`}
      alt={brand.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="max-h-16 max-w-full w-auto object-contain"
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
      <h2 className="reveal-item text-2xl font-bold text-navy-900 mb-4">Бренды, которым мы доверяем</h2>
      {/* pt-2/pb-3 — место под подъём карточки и тень: overflow-x-auto
          включает overflow-y: auto и без паддинга обрезает hover сверху.
          На lg+ ряд переходит в grid-cols-8 — все 8 карточек помещаются без
          обрезки и без горизонтального скролла (см. design-reviewer: 8 карточек
          при gap-4 не влезали в 1248px на 3px). */}
      <div className="flex gap-4 overflow-x-auto pt-2 pb-3 scrollbar-hide lg:grid lg:grid-cols-8 lg:gap-3 lg:overflow-visible">
        {brands.map((brand, i) => (
          <div
            key={brand.slug}
            className="reveal-item flex-shrink-0 lg:flex-shrink lg:w-full"
            style={{ '--reveal-delay': revealDelay(i) } as CSSProperties}
          >
            <Link
              to={`/catalog?brand=${brand.slug}`}
              className={`brand-card flex w-36 h-24 lg:w-full items-center justify-center rounded-card border border-line overflow-hidden ${brand.kind === 'plaque' ? 'p-2' : 'bg-white p-3'}`}
              style={brand.kind === 'plaque' ? { backgroundColor: brand.bg } : undefined}
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
