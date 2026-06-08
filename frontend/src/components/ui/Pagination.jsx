export function Pagination({ count, page, pageSize = 20, onChange }) {
  const totalPages = Math.ceil(count / pageSize)
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded disabled:opacity-30 transition-colors"
        style={{ color: 'var(--color-stone-text)' }}
        onMouseEnter={(e) => { if (page > 1) e.currentTarget.style.color = 'var(--color-fg)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
      >
        ← Anterior
      </button>
      <span className="text-[13px]" style={{ color: 'var(--color-stone-text)' }}>
        Página {page} de {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded disabled:opacity-30 transition-colors"
        style={{ color: 'var(--color-stone-text)' }}
        onMouseEnter={(e) => { if (page < totalPages) e.currentTarget.style.color = 'var(--color-fg)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
      >
        Siguiente →
      </button>
    </div>
  )
}
