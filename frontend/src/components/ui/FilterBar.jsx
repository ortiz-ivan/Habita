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
              ? { backgroundColor: '#D85A30', color: '#FFFFFF', fontWeight: 600, border: '1px solid #D85A30' }
              : { color: '#888884', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }
          }
          onMouseEnter={(e) => {
            if (active !== f.id) {
              e.currentTarget.style.backgroundColor = '#222222'
              e.currentTarget.style.color = '#e5e5e5'
              e.currentTarget.style.borderColor = '#3a3a3a'
            }
          }}
          onMouseLeave={(e) => {
            if (active !== f.id) {
              e.currentTarget.style.backgroundColor = '#1a1a1a'
              e.currentTarget.style.color = '#888884'
              e.currentTarget.style.borderColor = '#2a2a2a'
            }
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
