import type { EstadoPago, MetodoPago } from '../../types/api'

interface StyleEntry {
  bg: string
  text: string
}

interface EstadoEntry extends StyleEntry {
  label: string
  dot: string
}

export const estadoConfig: Record<EstadoPago, EstadoEntry> = {
  pagado:     { label: 'Pagado',     dot: 'var(--color-green-text)',  bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  pendiente:  { label: 'Pendiente',  dot: 'var(--color-brand-amber)', bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  vencido:    { label: 'Vencido',    dot: 'var(--color-red-text)',    bg: 'var(--color-red-bg)',            text: 'var(--color-red-text)' },
  parcial:    { label: 'Parcial',    dot: 'var(--color-brand-amber)', bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  por_vencer: { label: 'Por vencer', dot: 'var(--color-brand-amber)', bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
}

export const metodoStyle: Record<MetodoPago, StyleEntry> = {
  efectivo:      { bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' },
  transferencia: { bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' },
  tarjeta:       { bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  qr:            { bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' },
}

export const metodoLabel: Record<MetodoPago, string> = {
  efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta', qr: 'QR',
}

export type PillEntry = { id: string; label: string; dot?: string; bg?: string; text?: string }

export const estadoPills: PillEntry[] = [
  { id: '', label: 'Todos' },
  ...Object.entries(estadoConfig).map(([id, cfg]) => ({ id, ...cfg })),
]

export const periodoPills: { id: string; label: string }[] = [
  { id: '',              label: 'Todo el tiempo' },
  { id: 'este_mes',     label: 'Este mes'        },
  { id: 'mes_anterior', label: 'Mes anterior'    },
  { id: 'este_anio',    label: 'Este año'        },
]

export const periodoLabel: Record<string, string> = {
  este_mes: 'Este mes', mes_anterior: 'Mes anterior', este_anio: 'Este año',
}

export interface PeriodoFechasResult {
  fecha_desde?: string
  fecha_hasta?: string
}

export function getPeriodoFechas(periodo: string, diaInicio = 1): PeriodoFechasResult {
  const now = new Date()
  const y   = now.getFullYear()
  const m   = now.getMonth()
  const d   = now.getDate()
  const dia = Math.min(Math.max(diaInicio, 1), 28)
  const fmt = (date: Date) => date.toISOString().split('T')[0]

  if (periodo === 'este_anio') return { fecha_desde: `${y}-01-01`, fecha_hasta: `${y}-12-31` }

  const cycleOffset = d >= dia ? 0 : -1

  if (periodo === 'este_mes') {
    return {
      fecha_desde: fmt(new Date(y, m + cycleOffset, dia)),
      fecha_hasta: fmt(new Date(y, m + cycleOffset + 1, dia - 1)),
    }
  }
  if (periodo === 'mes_anterior') {
    return {
      fecha_desde: fmt(new Date(y, m + cycleOffset - 1, dia)),
      fecha_hasta: fmt(new Date(y, m + cycleOffset, dia - 1)),
    }
  }
  return {}
}
