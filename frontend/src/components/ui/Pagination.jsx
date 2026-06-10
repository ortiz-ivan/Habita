export function Pagination({ count, page, pageSize = 20, onChange }) {
  const totalPages = Math.ceil(count / pageSize)
  if (totalPages <= 1) return null

  const btnBase = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #2a2a2a',
    background: '#111111',
    color: '#e5e5e5',
    cursor: 'pointer',
    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
  }

  const btnDisabled = {
    ...btnBase,
    opacity: 0.35,
    cursor: 'not-allowed',
  }

  return (
    <div
      className="flex items-center justify-between mt-8 px-4 py-3 rounded-xl"
      style={{ background: '#111111', border: '1px solid #1f1f1f' }}
    >
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        style={page === 1 ? btnDisabled : btnBase}
        onMouseEnter={(e) => {
          if (page > 1) {
            e.currentTarget.style.background = '#1a1a1a'
            e.currentTarget.style.borderColor = '#374151'
            e.currentTarget.style.color = '#f0f0f0'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#111111'
          e.currentTarget.style.borderColor = '#2a2a2a'
          e.currentTarget.style.color = '#e5e5e5'
        }}
      >
        ← Anterior
      </button>

      <span
        className="text-sm font-medium px-4 py-1.5 rounded-lg"
        style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#e5e5e5' }}
      >
        Página <span style={{ color: 'var(--color-brand)' }}>{page}</span> de {totalPages}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        style={page === totalPages ? btnDisabled : btnBase}
        onMouseEnter={(e) => {
          if (page < totalPages) {
            e.currentTarget.style.background = '#1a1a1a'
            e.currentTarget.style.borderColor = '#374151'
            e.currentTarget.style.color = '#f0f0f0'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#111111'
          e.currentTarget.style.borderColor = '#2a2a2a'
          e.currentTarget.style.color = '#e5e5e5'
        }}
      >
        Siguiente →
      </button>
    </div>
  )
}
