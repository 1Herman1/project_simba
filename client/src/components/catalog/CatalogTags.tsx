const tags = [
  { id: 'kidney', label: 'При болезнях почек', emoji: '🫘' },
  { id: 'allergy', label: 'Без аллергенов', emoji: '🌿' },
  { id: 'kitten', label: 'Для котят', emoji: '🐱' },
  { id: 'puppy', label: 'Для щенков', emoji: '🐶' },
  { id: 'weight', label: 'Контроль веса', emoji: '⚖️' },
  { id: 'urinary', label: 'Мочекаменная', emoji: '💧' },
  { id: 'digestion', label: 'Пищеварение', emoji: '🌾' },
  { id: 'senior', label: 'Пожилые питомцы', emoji: '🐾' },
  { id: 'grain-free', label: 'Без зерна', emoji: '🚫' },
  { id: 'holistic', label: 'Холистик', emoji: '✨' },
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
          <span>{tag.emoji}</span>
          <span>{tag.label}</span>
        </button>
      ))}
    </div>
  )
}
