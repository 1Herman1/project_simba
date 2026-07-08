const tags = [
  { id: 'kidney', label: 'При болезнях почек' },
  { id: 'allergy', label: 'Без аллергенов' },
  { id: 'kitten', label: 'Для котят' },
  { id: 'puppy', label: 'Для щенков' },
  { id: 'weight', label: 'Контроль веса' },
  { id: 'urinary', label: 'Мочекаменная' },
  { id: 'digestion', label: 'Пищеварение' },
  { id: 'senior', label: 'Пожилые питомцы' },
  { id: 'grain-free', label: 'Без зерна' },
  { id: 'holistic', label: 'Холистик' },
]

interface Props {
  activeTag: string
  onTagClick: (tag: string) => void
}

export default function CatalogTags({ activeTag, onTagClick }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {tags.map(tag => (
        <button
          key={tag.id}
          onClick={() => onTagClick(tag.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            activeTag === tag.id
              ? 'bg-blue-200 text-navy-900 shadow-sm scale-105'
              : 'bg-white border border-blue-100 text-navy-700 hover:border-blue-200 hover:bg-blue-50'
          }`}>
          <span>{tag.label}</span>
        </button>
      ))}
    </div>
  )
}
