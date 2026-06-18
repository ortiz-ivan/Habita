import type { EstadoContrato } from '../../types/api'

interface EstadoEntry {
  label: string
  dot: string
  bg: string
  text: string
}

export const estadoConfig: Record<EstadoContrato, EstadoEntry> = {
  activo:     { label: 'Activo',     dot: 'var(--color-green-text)', bg: 'var(--color-green-bg)',   text: 'var(--color-green-text)' },
  finalizado: { label: 'Finalizado', dot: 'var(--color-stone-text)', bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' },
  cancelado:  { label: 'Cancelado',  dot: 'var(--color-red-text)',   bg: 'var(--color-red-bg)',     text: 'var(--color-red-text)' },
  moroso:     { label: 'Moroso',     dot: 'var(--color-red-text)',   bg: 'var(--color-red-bg)',     text: 'var(--color-red-text)' },
}

export type PillEntry = { id: string; label: string; dot?: string; bg?: string; text?: string }

export const estadoPills: PillEntry[] = [
  { id: '', label: 'Todos' },
  ...Object.entries(estadoConfig).map(([id, cfg]) => ({ id, ...cfg })),
]
