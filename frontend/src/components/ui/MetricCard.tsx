import type { ReactNode } from 'react'
import { Sparkline } from './Sparkline'
import { IconTrendUp } from './icons'
import { useCountUp } from '../../hooks/ui/useCountUp'

function DonutRing({ value, color }: { value: number; color: string }) {
  const r = 13
  const cx = 18
  const cy = 18
  const circumference = 2 * Math.PI * r
  const dash = (value / 100) * circumference

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0, overflow: 'visible' }}>
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth="3.5" stroke="var(--color-border)" />
        <circle
          cx={cx} cy={cy} r={r}
          fill="none" strokeWidth="3.5"
          stroke={color}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeDashoffset={circumference / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease', transformOrigin: 'center' }}
        />
      </svg>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-stone-text)' }}>
        <span style={{ color }}>{value}%</span> ocupado
      </span>
    </div>
  )
}

type MetricCardColor = 'default' | 'brand' | 'warning' | 'danger' | 'success'

const config: Record<MetricCardColor, {
  iconGradient: string
  iconBorder: string
  iconClr: string
  valClr: string
  barClr: string
  glowColor: string
  hoverBorder: string
}> = {
  default: {
    iconGradient: 'linear-gradient(135deg, #2a2a2a 0%, #1e1e1e 100%)',
    iconBorder:   'rgba(255,255,255,0.06)',
    iconClr:      'var(--color-stone-text)',
    valClr:       'var(--color-fg)',
    barClr:       'var(--color-stone-text)',
    glowColor:    'rgba(0,0,0,0)',
    hoverBorder:  'var(--color-border-strong)',
  },
  brand: {
    iconGradient: 'linear-gradient(135deg, rgba(224,97,58,0.22) 0%, rgba(201,82,46,0.12) 100%)',
    iconBorder:   'rgba(224,97,58,0.20)',
    iconClr:      'var(--color-brand)',
    valClr:       'var(--color-brand)',
    barClr:       'var(--color-brand)',
    glowColor:    'rgba(224,97,58,0.07)',
    hoverBorder:  'rgba(224,97,58,0.35)',
  },
  warning: {
    iconGradient: 'linear-gradient(135deg, rgba(250,199,117,0.22) 0%, rgba(250,199,117,0.10) 100%)',
    iconBorder:   'rgba(250,199,117,0.20)',
    iconClr:      'var(--color-brand-amber)',
    valClr:       'var(--color-brand-amber)',
    barClr:       'var(--color-brand-amber)',
    glowColor:    'rgba(250,199,117,0.06)',
    hoverBorder:  'rgba(250,199,117,0.30)',
  },
  danger: {
    iconGradient: 'linear-gradient(135deg, rgba(248,113,113,0.22) 0%, rgba(248,113,113,0.10) 100%)',
    iconBorder:   'rgba(248,113,113,0.20)',
    iconClr:      'var(--color-red-text)',
    valClr:       'var(--color-red-text)',
    barClr:       'var(--color-red-text)',
    glowColor:    'rgba(248,113,113,0.06)',
    hoverBorder:  'rgba(248,113,113,0.30)',
  },
  success: {
    iconGradient: 'linear-gradient(135deg, rgba(125,201,71,0.22) 0%, rgba(125,201,71,0.10) 100%)',
    iconBorder:   'rgba(125,201,71,0.20)',
    iconClr:      'var(--color-green-text)',
    valClr:       'var(--color-green-text)',
    barClr:       'var(--color-green-text)',
    glowColor:    'rgba(125,201,71,0.06)',
    hoverBorder:  'rgba(125,201,71,0.30)',
  },
}

interface Delta {
  value: string
  up?: boolean
  neutral?: boolean
}

interface MetricCardProps {
  label: string
  value?: string | number
  color?: MetricCardColor
  icon?: ReactNode
  progress?: number
  spark?: number[]
  delta?: Delta | null
  animated?: boolean
}

export function MetricCard({ label, value, color = 'default', icon, progress, spark, delta, animated = false }: MetricCardProps) {
  const { iconGradient, iconBorder, iconClr, valClr, barClr, glowColor, hoverBorder } = config[color] ?? config.default
  const hasProgress = typeof progress === 'number'
  const hasSpark = Array.isArray(spark) && spark.length > 1
  const isNumber = typeof value === 'number'
  const counted = useCountUp(isNumber ? value : 0, { enabled: animated && isNumber })
  const displayValue = animated && isNumber ? counted : value

  return (
    <div
      className="rounded-xl px-5 py-5 cursor-default bg-surface-1 border border-border flex flex-col"
      style={{
        minHeight: '160px',
        transition: 'all 220ms ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.45), 0 0 24px ${glowColor}`
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = hoverBorder
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: glowColor,
        filter: 'blur(30px)',
        pointerEvents: 'none',
      }} />

      <div className="flex items-start justify-between mb-4">
        {icon ? (
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: iconGradient,
              color: iconClr,
              border: `1px solid ${iconBorder}`,
            }}
          >
            {icon}
          </div>
        ) : <span />}

        {delta && (
          <span
            className="inline-flex items-center gap-[3px] text-[12px] font-semibold px-2 py-1 rounded-full"
            style={delta.neutral
              ? { background: 'var(--color-surface-2)', color: 'var(--color-stone-text)', border: '1px solid var(--color-border)' }
              : { background: delta.up ? 'var(--color-green-soft)' : 'var(--color-red-soft)', color: delta.up ? 'var(--color-green-text)' : 'var(--color-red-text)' }
            }
          >
            {!delta.neutral && (
              <span style={{ display: 'inline-flex', transform: delta.up ? 'none' : 'scaleY(-1)' }}>
                <IconTrendUp />
              </span>
            )}
            {delta.value}
          </span>
        )}
      </div>

      <p
        className="text-[11px] font-semibold uppercase tracking-[0.07em] mb-2"
        style={{ color: 'var(--color-stone-text)' }}
      >
        {label}
      </p>
      <p
        className="leading-none tracking-tight"
        style={{ fontSize: '32px', fontWeight: 800, color: valClr, letterSpacing: '-0.03em' }}
      >
        {displayValue ?? '—'}
      </p>

      <div className="mt-auto pt-4" style={{ height: '36px' }}>
        {hasSpark ? (
          <Sparkline data={spark} color={barClr} />
        ) : hasProgress ? (
          <DonutRing value={Math.min(100, Math.max(0, progress))} color={barClr} />
        ) : null}
      </div>
    </div>
  )
}
