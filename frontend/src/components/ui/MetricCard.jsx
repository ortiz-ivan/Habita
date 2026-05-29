const config = {
  default: {
    iconBg:  'var(--color-surface-2)',
    iconClr: 'var(--color-stone-text)',
    valClr:  'var(--color-fg)',
    barClr:  'var(--color-stone-text)',
  },
  brand: {
    iconBg:  '#2a1200',
    iconClr: 'var(--color-brand)',
    valClr:  'var(--color-brand)',
    barClr:  'var(--color-brand)',
  },
  warning: {
    iconBg:  'var(--color-brand-amber-light)',
    iconClr: 'var(--color-brand-amber)',
    valClr:  'var(--color-brand-amber)',
    barClr:  'var(--color-brand-amber)',
  },
  danger: {
    iconBg:  'var(--color-red-bg)',
    iconClr: 'var(--color-red-text)',
    valClr:  'var(--color-red-text)',
    barClr:  'var(--color-red-text)',
  },
  success: {
    iconBg:  'var(--color-green-bg)',
    iconClr: 'var(--color-green-text)',
    valClr:  'var(--color-green-text)',
    barClr:  'var(--color-green-text)',
  },
}

export function MetricCard({ label, value, color = 'default', icon, progress }) {
  const { iconBg, iconClr, valClr, barClr } = config[color] ?? config.default
  const hasProgress = typeof progress === 'number'

  return (
    <div
      className="rounded-xl px-4 py-3.5 cursor-default transition-shadow duration-200 bg-surface-1 border border-border"
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
    >
      {icon && (
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mb-3"
          style={{ backgroundColor: iconBg, color: iconClr }}
        >
          {icon}
        </div>
      )}

      <p className="text-[12px] mb-1 text-stone-text">{label}</p>
      <p className="text-[22px] font-semibold leading-none" style={{ color: valClr }}>
        {value ?? '—'}
      </p>

      {hasProgress && (
        <div className="mt-3">
          <div
            className="w-full rounded-full overflow-hidden bg-surface-2"
            style={{ height: '3px' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: barClr,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
