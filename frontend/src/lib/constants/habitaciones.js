export const estadoConfig = {
  disponible:    { label: 'Disponible',    dot: 'var(--color-green-text)',   bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  ocupada:       { label: 'Ocupada',       dot: 'var(--color-blue-text)',    bg: 'var(--color-blue-bg)',           text: 'var(--color-blue-text)' },
  reservada:     { label: 'Reservada',     dot: 'var(--color-brand-amber)',  bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  mantenimiento: { label: 'Mantenimiento', dot: 'var(--color-yellow-text)',  bg: 'var(--color-yellow-bg)',         text: 'var(--color-yellow-text)' },
}

export const estadoPills = [
  { id: '', label: 'Todos' },
  ...Object.entries(estadoConfig).map(([id, cfg]) => ({ id, ...cfg })),
]
