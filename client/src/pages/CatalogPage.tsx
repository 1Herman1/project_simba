import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import CatalogSearch from '../components/catalog/CatalogSearch'
import CatalogTags from '../components/catalog/CatalogTags'
import CatalogGrid from '../components/catalog/CatalogGrid'
import QuestionnaireTeaser from '../components/home/QuestionnaireTeaser'

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '')
  const [category] = useState(searchParams.get('category') || '')

  useEffect(() => {
    const params: Record<string, string> = {}
    if (search) params.q = search
    if (activeTag) params.tag = activeTag
    if (category) params.category = category
    setSearchParams(params, { replace: true })
  }, [search, activeTag, category])

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
        <CatalogHeader search={search} activeTag={activeTag} category={category} />
        <CatalogGrid search={search} activeTag={activeTag} category={category} />
      </div>

      <QuestionnaireTeaser />
    </div>
  )
}

function CatalogHeader({ search, activeTag, category }: { search: string; activeTag: string; category: string }) {
  const title = search
    ? `Результаты поиска: "${search}"`
    : activeTag
    ? activeTag
    : category
    ? category
    : 'Все товары'

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-bold text-navy-900">{title}</h1>
      <SortSelect />
    </div>
  )
}

function SortSelect() {
  const [sort, setSort] = useState('popular')
  return (
    <select
      value={sort}
      onChange={e => setSort(e.target.value)}
      className="text-sm border border-line rounded-xl px-3 py-2 bg-white text-navy-700 focus:outline-none focus:border-line cursor-pointer">
      <option value="popular">По популярности</option>
      <option value="price_asc">Сначала дешевле</option>
      <option value="price_desc">Сначала дороже</option>
      <option value="newest">Новинки</option>
    </select>
  )
}
