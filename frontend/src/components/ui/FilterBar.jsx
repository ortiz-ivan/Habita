// filters: [{ id, label }]
export function FilterBar({ filters, active, onChange }) {
  return (
    <div className="flex gap-2 px-1 py-1">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className="text-[13px] px-3.5 py-1.5 rounded-full transition-colors cursor-pointer"
          style={
            active === f.id
              ? { backgroundColor: 'var(--color-brand)', color: '#FFFFFF', fontWeight: 600, border: '1px solid var(--color-brand)' }
              : { color: 'var(--color-stone-text)', backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border-strong)' }
          }
          onMouseEnter={(e) => {
            if (active !== f.id) {
              e.currentTarget.style.backgroundColor = '#222222'
              e.currentTarget.style.color = 'var(--color-stone-dark)'
              e.currentTarget.style.borderColor = '#3a3a3a'
            }
          }}
          onMouseLeave={(e) => {
            if (active !== f.id) {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'
              e.currentTarget.style.color = 'var(--color-stone-text)'
              e.currentTarget.style.borderColor = 'var(--color-border-strong)'
            }
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
