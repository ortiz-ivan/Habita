import { Sparkline } from './Sparkline'
import { IconTrendUp } from './icons'

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

export function MetricCard({ label, value, color = 'default', icon, progress, spark, delta }) {
  const { iconBg, iconClr, valClr, barClr } = config[color] ?? config.default
  const hasProgress = typeof progress === 'number'
  const hasSpark = Array.isArray(spark) && spark.length > 1

  return (
    <div
      className="rounded-2xl px-4 py-4 cursor-default transition-shadow duration-200 bg-surface-1 border border-border"
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)' }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Fila superior: icono + delta */}
      <div className="flex items-center justify-between">
        {icon ? (
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: iconBg, color: iconClr }}
          >
            {icon}
          </div>
        ) : <span />}

        {delta && (
          <span
            className="inline-flex items-center gap-[3px] text-[11px] font-semibold"
            style={{ color: delta.up ? 'var(--color-green-text)' : 'var(--color-red-text)' }}
          >
            <span style={{ display: 'inline-flex', transform: delta.up ? 'none' : 'scaleY(-1)' }}>
              <IconTrendUp />
            </span>
            {delta.value}
          </span>
        )}
      </div>

      <p className="text-[12px] mt-3 mb-1 text-stone-text">{label}</p>
      <p className="text-[26px] font-bold leading-none tracking-tight" style={{ color: valClr }}>
        {value ?? '—'}
      </p>

      {/* Sparkline gana al progress si viene */}
      <div className="mt-3 h-[30px]">
        {hasSpark ? (
          <Sparkline data={spark} color={barClr} />
        ) : hasProgress ? (
          <div className="w-full rounded-full overflow-hidden bg-surface-2" style={{ height: '3px' }}>
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: barClr,
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
