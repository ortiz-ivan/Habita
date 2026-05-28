const config = {
  default: {
    iconBg:  '#1a1a1a',
    iconClr: '#888884',
    valClr:  '#f0f0f0',
    barClr:  '#888884',
  },
  brand: {
    iconBg:  '#2a1200',
    iconClr: '#D85A30',
    valClr:  '#D85A30',
    barClr:  '#D85A30',
  },
  warning: {
    iconBg:  '#2a1400',
    iconClr: '#FAC775',
    valClr:  '#FAC775',
    barClr:  '#FAC775',
  },
  danger: {
    iconBg:  '#1f0000',
    iconClr: '#f87171',
    valClr:  '#f87171',
    barClr:  '#f87171',
  },
  success: {
    iconBg:  '#0a1f00',
    iconClr: '#7dc947',
    valClr:  '#7dc947',
    barClr:  '#7dc947',
  },
}

export function MetricCard({ label, value, color = 'default', icon, progress }) {
  const { iconBg, iconClr, valClr, barClr } = config[color] ?? config.default
  const hasProgress = typeof progress === 'number'

  return (
    <div
      className="rounded-xl px-4 py-3.5 cursor-default transition-shadow duration-200"
      style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f' }}
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

      <p className="text-[12px] mb-1" style={{ color: '#888884' }}>{label}</p>
      <p className="text-[22px] font-semibold leading-none" style={{ color: valClr }}>
        {value ?? '—'}
      </p>

      {hasProgress && (
        <div className="mt-3">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '3px', backgroundColor: '#1a1a1a' }}
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
