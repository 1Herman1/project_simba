import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { brandsApi, categoriesApi } from '../lib/api'
import CatalogSearch from '../components/catalog/CatalogSearch'
import CatalogTags, { catalogTagLabel } from '../components/catalog/CatalogTags'
import CatalogGrid from '../components/catalog/CatalogGrid'
import QuestionnaireTeaser from '../components/home/QuestionnaireTeaser'

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '')
  // Категорию и бренд читаем из URL напрямую, а не через useState: состояние
  // инициализируется один раз, поэтому клик по другому бренду с уже открытого
  // каталога менял адрес, но не выдачу.
  const category = searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const format = searchParams.get('format') || ''
  const purpose = searchParams.get('purpose') || ''
  const species = searchParams.get('species') || ''
  // Сортировка живёт в URL, как остальные фильтры: раньше она сидела в локальном
  // useState внутри SortSelect и никуда оттуда не попадала — контрол переключался,
  // а выдача не менялась.
  const sort = searchParams.get('sort') || 'popular'

  useEffect(() => {
    const params: Record<string, string> = {}
    if (search) params.q = search
    if (activeTag) params.tag = activeTag
    if (category) params.category = category
    if (brand) params.brand = brand
    if (format) params.format = format
    if (purpose) params.purpose = purpose
    if (species) params.species = species
    if (sort && sort !== 'popular') params.sort = sort
    setSearchParams(params, { replace: true })
  }, [search, activeTag, category, brand, format, purpose, species, sort])

  const handleSortChange = (next: string) => {
    const params = new URLSearchParams(searchParams)
    if (next === 'popular') params.delete('sort')
    else params.set('sort', next)
    setSearchParams(params, { replace: true })
  }

  const handleTagClick = (tag: string) => {
    setActiveTag(prev => prev === tag ? '' : tag)
    setSearch('')
  }

  return (
    <div className="min-h-[100dvh] bg-blue-50">
      <div className="bg-white border-b border-blue-100 sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <CatalogSearch value={search} onChange={setSearch} onClear={() => setSearch('')} />
          <CatalogTags activeTag={activeTag} onTagClick={handleTagClick} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <CatalogHeader
          search={search}
          activeTag={activeTag}
          category={category}
          brand={brand}
          species={species}
          sort={sort}
          onSortChange={handleSortChange}
        />
        <CatalogGrid search={search} activeTag={activeTag} category={category} brand={brand} format={format} purpose={purpose} species={species} sort={sort} />
      </div>

      <QuestionnaireTeaser />
    </div>
  )
}

function CatalogHeader({
  search, activeTag, category, brand, species, sort, onSortChange,
}: {
  search: string
  activeTag: string
  category: string
  brand: string
  species: string
  sort: string
  onSortChange: (value: string) => void
}) {
  const [brandName, setBrandName] = useState('')
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    if (!category) {
      setCategoryName('')
      return
    }
    // Иначе в заголовке висел служебный слаг вроде «pharmacy».
    categoriesApi
      .tree()
      .then((res) => setCategoryName(res.data.find((c) => c.slug === category)?.name || ''))
      .catch(() => setCategoryName(''))
  }, [category])

  useEffect(() => {
    if (!brand) {
      setBrandName('')
      return
    }
    // Без названия бренда заголовок остался бы «Все товары», и покупатель не
    // понимал бы, что выдача уже отфильтрована.
    brandsApi
      .list()
      .then((res) => setBrandName(res.data.find((b) => b.slug === brand)?.name || ''))
      .catch(() => setBrandName(''))
  }, [brand])

  const title = search
    ? `Результаты поиска: "${search}"`
    : activeTag
    ? catalogTagLabel(activeTag)
    : brand
    ? brandName || 'Товары бренда'
    : category
    ? categoryName || 'Каталог'
    : species === 'cat'
    ? 'Всё для кошек'
    : species === 'dog'
    ? 'Всё для собак'
    : 'Все товары'

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-navy-900">{title}</h1>
      <SortSelect value={sort} onChange={onSortChange} />
    </div>
  )
}

/** Без focus:outline-none/focus:border-line: они гасили кольцо фокуса и
    подменяли его цветом рамки покоя — с клавиатуры было не видно, где ты.
    Глобальное *:focus-visible в index.css справляется само. */
function SortSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label="Сортировка товаров"
      className="text-sm border border-line rounded-xl px-3 py-2 bg-white text-navy-700 cursor-pointer">
      <option value="popular">По популярности</option>
      <option value="price_asc">Сначала дешевле</option>
      <option value="price_desc">Сначала дороже</option>
      <option value="newest">Новинки</option>
    </select>
  )
}
