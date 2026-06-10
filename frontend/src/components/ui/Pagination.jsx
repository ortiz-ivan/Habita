const IconLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)

const IconRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

function buildPages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = [1]
  const left = Math.max(2, page - 1)
  const right = Math.min(totalPages - 1, page + 1)
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push('...')
  pages.push(totalPages)
  return pages
}

export function Pagination({ count, page, pageSize = 20, onChange }) {
  const totalPages = Math.ceil(count / pageSize)
  if (totalPages <= 1) return null

  const pages = buildPages(page, totalPages)

  const navBtn = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
    fontWeight: 500,
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid var(--color-border-strong)',
    background: 'var(--color-surface-2)',
    color: active ? 'var(--color-fg)' : 'var(--color-stone-text)',
    cursor: active ? 'pointer' : 'not-allowed',
    opacity: active ? 1 : 0.38,
    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
  })

  return (
    <div
      className="flex items-center justify-between mt-8 px-4 py-2.5 rounded-xl"
      style={{
        background: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
      }}
    >
      {/* Anterior */}
      <button
        onClick={() => page > 1 && onChange(page - 1)}
        disabled={page === 1}
        style={navBtn(page > 1)}
        onMouseEnter={(e) => {
          if (page > 1) {
            e.currentTarget.style.background = 'var(--color-surface-3)'
            e.currentTarget.style.borderColor = 'var(--color-border-strong)'
            e.currentTarget.style.color = 'var(--color-fg)'
          }
        }}
        onMouseLeave={(e) => {
          if (page > 1) {
            e.currentTarget.style.background = 'var(--color-surface-2)'
            e.currentTarget.style.borderColor = 'var(--color-border-strong)'
            e.currentTarget.style.color = 'var(--color-stone-text)'
          }
        }}
      >
        <IconLeft /> Anterior
      </button>

      {/* Números */}
      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              style={{ padding: '0 6px', fontSize: '13px', color: 'var(--color-stone-text)' }}
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              style={
                p === page
                  ? {
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
                      color: '#fff',
                      boxShadow: '0 2px 10px rgba(224,97,58,0.40)',
                      transition: 'all 0.15s',
                    }
                  : {
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-stone-text)',
                      transition: 'all 0.15s',
                    }
              }
              onMouseEnter={(e) => {
                if (p !== page) {
                  e.currentTarget.style.background = 'var(--color-surface-2)'
                  e.currentTarget.style.color = 'var(--color-fg)'
                }
              }}
              onMouseLeave={(e) => {
                if (p !== page) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-stone-text)'
                }
              }}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Siguiente */}
      <button
        onClick={() => page < totalPages && onChange(page + 1)}
        disabled={page === totalPages}
        style={navBtn(page < totalPages)}
        onMouseEnter={(e) => {
          if (page < totalPages) {
            e.currentTarget.style.background = 'var(--color-surface-3)'
            e.currentTarget.style.borderColor = 'var(--color-border-strong)'
            e.currentTarget.style.color = 'var(--color-fg)'
          }
        }}
        onMouseLeave={(e) => {
          if (page < totalPages) {
            e.currentTarget.style.background = 'var(--color-surface-2)'
            e.currentTarget.style.borderColor = 'var(--color-border-strong)'
            e.currentTarget.style.color = 'var(--color-stone-text)'
          }
        }}
      >
        Siguiente <IconRight />
      </button>
    </div>
  )
}
