const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

// label: text to display, dot: colored dot (for status chips), color: text/dot color,
// isSearch: shows search icon, onRemove: callback to clear this filter
export function Chip({ label, dot, color, isSearch, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-[5px] rounded-full text-xs font-medium bg-surface-2 border border-border-strong"
      style={{ color: color ?? 'var(--color-stone-dark)' }}
    >
      {isSearch && <SearchIcon />}
      {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
      {label}
      <button
        onClick={onRemove}
        className="ml-0.5 cursor-pointer flex items-center opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: 'inherit' }}
      >
        <XIcon />
      </button>
    </span>
  )
}
