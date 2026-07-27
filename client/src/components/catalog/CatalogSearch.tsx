interface Props {
  value: string
  onChange: (v: string) => void
  onClear: () => void
}

export default function CatalogSearch({ value, onChange, onClear }: Props) {
  return (
    <div className="relative mb-3">
      <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>

      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Найти корм, бренд или товар..."
        className="w-full pl-12 pr-12 py-3 rounded-2xl border border-blue-100 bg-blue-50 focus:bg-white focus:outline-none focus:border-blue-200 focus:ring-2 focus:ring-blue-100 transition-[border-color,box-shadow,background-color] text-navy-900 placeholder-navy-300 text-base"
      />

      {value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-300 hover:text-navy-500 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}
    </div>
  )
}
