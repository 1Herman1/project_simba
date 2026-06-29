import { useMemo } from 'react'
import ProductCard from './ProductCard'

const mockProducts = [
  {
    id: '1', name: 'Royal Canin Renal для кошек', slug: 'royal-canin-renal',
    brand: 'Royal Canin', tags: ['kidney'],
    variants: [
      { id: 'v1', weight: 0.5, price: 89900, oldPrice: 99900, stock: 45 },
      { id: 'v2', weight: 2, price: 249900, oldPrice: 279900, stock: 23 },
      { id: 'v3', weight: 4, price: 419900, oldPrice: null, stock: 12 },
    ],
    isGrainFree: false, isHypoallergenic: false, isWeightControl: false,
  },
  {
    id: '2', name: "Hill's k/d Kidney Care для кошек", slug: 'hills-kd-cats',
    brand: "Hill's", tags: ['kidney'],
    variants: [
      { id: 'v4', weight: 0.4, price: 79900, oldPrice: null, stock: 30 },
      { id: 'v5', weight: 1.5, price: 219900, oldPrice: 249900, stock: 15 },
    ],
    isGrainFree: false, isHypoallergenic: false, isWeightControl: false,
  },
  {
    id: '3', name: 'Monge Monoprotein Agnello для кошек', slug: 'monge-mono-lamb',
    brand: 'Monge', tags: ['allergy', 'grain-free'],
    variants: [
      { id: 'v6', weight: 1.5, price: 189900, oldPrice: 199900, stock: 20 },
      { id: 'v7', weight: 3, price: 329900, oldPrice: null, stock: 8 },
    ],
    isGrainFree: true, isHypoallergenic: true, isWeightControl: false,
  },
  {
    id: '4', name: 'Royal Canin Kitten для котят', slug: 'royal-canin-kitten',
    brand: 'Royal Canin', tags: ['kitten'],
    variants: [
      { id: 'v8', weight: 0.4, price: 59900, oldPrice: null, stock: 60 },
      { id: 'v9', weight: 2, price: 199900, oldPrice: 229900, stock: 40 },
      { id: 'v10', weight: 4, price: 349900, oldPrice: null, stock: 25 },
    ],
    isGrainFree: false, isHypoallergenic: false, isWeightControl: false,
  },
  {
    id: '5', name: "Hill's Metabolic контроль веса", slug: 'hills-metabolic',
    brand: "Hill's", tags: ['weight'],
    variants: [
      { id: 'v11', weight: 1.5, price: 229900, oldPrice: 259900, stock: 18 },
      { id: 'v12', weight: 3, price: 389900, oldPrice: null, stock: 10 },
    ],
    isGrainFree: false, isHypoallergenic: false, isWeightControl: true,
  },
  {
    id: '6', name: 'Farmina N&D Grain Free Puppy', slug: 'farmina-nd-puppy',
    brand: 'Farmina', tags: ['puppy', 'grain-free'],
    variants: [
      { id: 'v13', weight: 0.8, price: 149900, oldPrice: null, stock: 35 },
      { id: 'v14', weight: 2.5, price: 389900, oldPrice: 419900, stock: 12 },
    ],
    isGrainFree: true, isHypoallergenic: false, isWeightControl: false,
  },
  {
    id: '7', name: 'Purina Pro Plan Urinary для кошек', slug: 'purina-urinary',
    brand: 'Purina Pro Plan', tags: ['urinary'],
    variants: [
      { id: 'v15', weight: 1.5, price: 169900, oldPrice: 189900, stock: 28 },
      { id: 'v16', weight: 3, price: 289900, oldPrice: null, stock: 14 },
    ],
    isGrainFree: false, isHypoallergenic: false, isWeightControl: false,
  },
  {
    id: '8', name: 'Royal Canin Gastro Intestinal', slug: 'royal-canin-gi',
    brand: 'Royal Canin', tags: ['digestion'],
    variants: [
      { id: 'v17', weight: 0.4, price: 69900, oldPrice: null, stock: 50 },
      { id: 'v18', weight: 2, price: 219900, oldPrice: 239900, stock: 22 },
    ],
    isGrainFree: false, isHypoallergenic: false, isWeightControl: false,
  },
]

interface Props {
  search: string
  activeTag: string
  category: string
}

export default function CatalogGrid({ search, activeTag, category }: Props) {
  const filtered = useMemo(() => {
    return mockProducts.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
      const matchTag = !activeTag || p.tags.includes(activeTag)
      return matchSearch && matchTag
    })
  }, [search, activeTag, category])

  if (filtered.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-navy-500 text-lg mb-2">Ничего не найдено</p>
        <p className="text-navy-300 text-sm">Попробуйте другой запрос или выберите другую категорию</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-navy-300 mb-4">{filtered.length} товаров</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </>
  )
}
