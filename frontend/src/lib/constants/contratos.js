export const estadoConfig = {
  activo:     { label: 'Activo',     dot: 'var(--color-green-text)', bg: 'var(--color-green-bg)',   text: 'var(--color-green-text)' },
  finalizado: { label: 'Finalizado', dot: 'var(--color-stone-text)', bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' },
  cancelado:  { label: 'Cancelado',  dot: 'var(--color-red-text)',   bg: 'var(--color-red-bg)',     text: 'var(--color-red-text)' },
  moroso:     { label: 'Moroso',     dot: 'var(--color-red-text)',   bg: 'var(--color-red-bg)',     text: 'var(--color-red-text)' },
}

export const estadoPills = [
  { id: '', label: 'Todos' },
  ...Object.entries(estadoConfig).map(([id, cfg]) => ({ id, ...cfg })),
]
