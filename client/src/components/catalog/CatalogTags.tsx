export const CATALOG_TAGS = [
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

/** Ряд быстрых фильтров.
 *
 *  На десктопе переносится на две строки, а не скроллится: десять вкладок
 *  требуют ~1296px при доступных 1248px, и последняя («Холистик») вылезала за
 *  край. Достать её мышью было невозможно — полоса прокрутки скрыта
 *  (scrollbar-hide), а колесо мыши по горизонтали не прокручивает.
 *  Ниже lg остаётся скролл: на телефоне свайп естественен, а перенос дал бы
 *  4-5 строк в липкой шапке. Затухание у правого края подсказывает, что ряд
 *  продолжается.
 *
 *  py-1/-mx-1 px-1 — место под focus-ring: overflow-x: auto превращает и
 *  overflow-y в auto, и обводка обрезалась бы сверху.
 */
export default function CatalogTags({ activeTag, onTagClick }: Props) {
  return (
    <div
      role="group"
      aria-label="Быстрые фильтры"
      className="flex gap-2 -mx-1 px-1 py-1 overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] [-webkit-mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] lg:flex-wrap lg:gap-y-2 lg:overflow-visible lg:[mask-image:none] lg:[-webkit-mask-image:none]"
    >
      {CATALOG_TAGS.map(tag => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onTagClick(tag.id)}
          aria-pressed={activeTag === tag.id}
          // Активная вкладка заливается, а не остаётся белой с цветной рамкой:
          // у прежнего активного класса не было ширины рамки (только цвет), из-за
          // чего вкладка при клике теряла 2px и весь ряд дёргался. Плюс белый чип
          // на белой шапке читался как «рамка отвалилась», а не как «выбрано».
          className={`btn-press flex-shrink-0 inline-flex items-center min-h-11 lg:min-h-0 px-4 py-2 rounded-full text-sm font-medium ${
            activeTag === tag.id
              ? 'bg-primary border border-primary text-white hover:bg-primary-hover hover:border-primary-hover'
              : 'bg-white border border-line text-navy-700 hover:border-primary-soft hover:bg-blue-50'
          }`}>
          {tag.label}
        </button>
      ))}
    </div>
  )
}

/** Человеческое название фильтра для заголовка страницы. */
export function catalogTagLabel(id: string): string {
  return CATALOG_TAGS.find(t => t.id === id)?.label ?? id
}
