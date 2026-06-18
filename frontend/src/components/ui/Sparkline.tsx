import { useId } from 'react'

interface SparklineProps {
  data?: number[]
  color?: string
  w?: number
  h?: number
}

export function Sparkline({ data = [], color = 'var(--color-brand)', w = 150, h = 30 }: SparklineProps) {
  const gid = useId()
  if (!Array.isArray(data) || data.length < 2) return <div style={{ height: h }} />

  const max = Math.max(...data)
  const min = Math.min(...data)
  const rng = max - min || 1
  const pts = data.map((v, i) => [
    (w * i) / (data.length - 1),
    h - 3 - ((v - min) / rng) * (h - 6),
  ])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0]},${p[1]}`).join(' ')
  const area = `${line} L ${w},${h} L 0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sp${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sp${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.at(-1)![0]} cy={pts.at(-1)![1]} r="2.5" fill={color} />
    </svg>
  )
}
