type Props = {
  open: boolean
  onOpen: () => void
}

export default function HeaderSearch({ open, onOpen }: Props) {
  return (
    <div className="flex-1 max-w-xl mx-4">
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Открыть поиск по каталогу"
        className="btn-press press-wide w-full h-11 pl-4 pr-3 rounded-full border border-line bg-white
                   flex items-center gap-2 text-left
                   hover:border-primary-soft"
      >
        <svg
          className="w-5 h-5 text-navy-400 flex-shrink-0"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className="text-sm text-navy-500 truncate">Найти корм, лакомства, игрушки…</span>
      </button>
    </div>
  )
}
