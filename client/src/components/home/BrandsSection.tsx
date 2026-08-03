import { Link } from 'react-router-dom'

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

export default function BrandsSection() {
  return (
    <section className="bg-blue-50 py-12 md:py-16">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-xl font-bold text-navy-900 mb-5">Бренды, которым мы доверяем</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            to={`/catalog?brand=${brand.slug}`}
            className="flex-shrink-0 w-32 h-20 bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-[transform,box-shadow] duration-200 flex items-center justify-center cursor-pointer border border-blue-100"
          >
            <span className="font-bold text-sm text-center px-2 leading-tight" style={{ color: brand.color }}>
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
    </section>
  )
}
