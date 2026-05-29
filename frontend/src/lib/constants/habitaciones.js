export const estadoConfig = {
  disponible:    { label: 'Disponible',    dot: 'var(--color-green-text)',  bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  ocupada:       { label: 'Ocupada',       dot: 'var(--color-red-text)',    bg: 'var(--color-red-bg)',            text: 'var(--color-red-text)' },
  reservada:     { label: 'Reservada',     dot: 'var(--color-brand-amber)', bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  mantenimiento: { label: 'Mantenimiento', dot: 'var(--color-stone-text)',  bg: 'var(--color-surface-2)',         text: 'var(--color-stone-text)' },
}

export const estadoPills = [
  { id: '', label: 'Todos' },
  ...Object.entries(estadoConfig).map(([id, cfg]) => ({ id, ...cfg })),
]
