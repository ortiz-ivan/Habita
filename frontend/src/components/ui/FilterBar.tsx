interface Filter {
  id: string
  label: string
}

interface FilterBarProps {
  filters: Filter[]
  active: string
  onChange: (id: string) => void
}

export function FilterBar({ filters, active, onChange }: FilterBarProps) {
  return (
    <div
      className="inline-flex gap-1 p-1 rounded-lg"
      style={{
        backgroundColor: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
      }}
    >
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className="text-[13px] px-3.5 py-1.5 rounded-md cursor-pointer transition-all"
          style={
            active === f.id
              ? {
                  backgroundColor: 'var(--color-surface-3)',
                  color: 'var(--color-fg)',
                  fontWeight: 600,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                }
              : {
                  color: 'var(--color-stone-text)',
                  fontWeight: 400,
                  backgroundColor: 'transparent',
                }
          }
          onMouseEnter={(e) => {
            if (active !== f.id) {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'
              e.currentTarget.style.color = 'var(--color-stone-dark)'
            }
          }}
          onMouseLeave={(e) => {
            if (active !== f.id) {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-stone-text)'
            }
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
