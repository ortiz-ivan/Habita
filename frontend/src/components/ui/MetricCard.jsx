const config = {
  default: {
    iconBg:  '#F5F0E8',
    iconClr: '#5F5E5A',
    valClr:  '#1C1917',
    barClr:  '#5F5E5A',
  },
  brand: {
    iconBg:  '#FAECE7',
    iconClr: '#D85A30',
    valClr:  '#D85A30',
    barClr:  '#D85A30',
  },
  warning: {
    iconBg:  '#FAEEDA',
    iconClr: '#633806',
    valClr:  '#633806',
    barClr:  '#FAC775',
  },
  danger: {
    iconBg:  '#FCEBEB',
    iconClr: '#A32D2D',
    valClr:  '#A32D2D',
    barClr:  '#A32D2D',
  },
  success: {
    iconBg:  '#EAF3DE',
    iconClr: '#3B6D11',
    valClr:  '#3B6D11',
    barClr:  '#639922',
  },
}

export function MetricCard({ label, value, color = 'default', icon, progress }) {
  const { iconBg, iconClr, valClr, barClr } = config[color] ?? config.default
  const hasProgress = typeof progress === 'number'

  return (
    <div
      className="bg-white rounded-xl px-4 py-3.5 cursor-default transition-shadow duration-200"
      style={{ border: '1px solid #E8E4DC' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)' }}
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

      <p className="text-[12px] mb-1" style={{ color: '#5F5E5A' }}>{label}</p>
      <p className="text-[22px] font-semibold leading-none" style={{ color: valClr }}>
        {value ?? '—'}
      </p>

      {hasProgress && (
        <div className="mt-3">
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: '3px', backgroundColor: '#F0EDE7' }}
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
