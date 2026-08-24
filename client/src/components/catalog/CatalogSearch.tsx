import { CloseIcon } from '../icons'

interface Props {
  value: string
  onChange: (v: string) => void
  onClear: () => void
}

/** Кольцо фокуса — primary-soft, а не blue-100: у прежнего контраст к белому
    был 1.23:1, то есть индикатора фокуса фактически не существовало. */
export default function CatalogSearch({ value, onChange, onClear }: Props) {
  return (
    <div role="search" className="relative mb-3">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Найти корм, бренд или товар..."
        aria-label="Поиск по каталогу"
        className="w-full pl-12 pr-12 py-3 rounded-2xl border border-blue-100 bg-blue-50 focus:bg-white focus:outline-none focus:border-primary-soft focus:ring-2 focus:ring-primary-soft transition-[border-color,box-shadow,background-color] text-navy-900 placeholder-navy-300 text-base"
      />

      {/* Крестик — 44px, а не 20px: это полноценная кнопка, а не иконка. */}
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Очистить поиск"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 inline-flex items-center justify-center text-navy-300 hover:text-navy-500 transition-colors">
          <CloseIcon className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
