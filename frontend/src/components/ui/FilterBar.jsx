// filters: [{ id, label }]
export function FilterBar({ filters, active, onChange }) {
  return (
    <div className="flex gap-1 px-4 py-2.5" style={{ borderBottom: '1px solid #F0EDE7' }}>
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className="text-[12px] px-[10px] py-1 rounded-lg transition-colors cursor-pointer"
          style={
            active === f.id
              ? { backgroundColor: '#FAEEDA', color: '#633806', fontWeight: 500 }
              : { color: '#5F5E5A', backgroundColor: 'transparent' }
          }
          onMouseEnter={(e) => {
            if (active !== f.id) e.currentTarget.style.backgroundColor = '#EDE8DE'
          }}
          onMouseLeave={(e) => {
            if (active !== f.id) e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
