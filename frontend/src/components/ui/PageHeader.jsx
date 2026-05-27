const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

export function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex items-start justify-between mb-10">
      <div>
        <h1 className="text-3xl font-bold leading-tight" style={{ color: '#1C1917' }}>{title}</h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: '#5F5E5A' }}>{subtitle}</p>
        )}
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 shrink-0 ml-4 mt-1 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
        >
          <IconPlus />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
