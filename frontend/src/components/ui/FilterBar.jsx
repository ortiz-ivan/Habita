export function FilterBar({ filters, active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`shrink-0 px-3 py-1.5 rounded-lg text-sm transition-colors ${
            active === f
              ? 'bg-amber-100 text-amber-900 font-medium'
              : 'text-stone-500 hover:bg-stone-100'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
