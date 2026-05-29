const config = {
  pagado:       { label: 'Pagado',       bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)', dot: 'var(--color-green-text)' },
  pendiente:    { label: 'Pendiente',    bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)', dot: 'var(--color-brand-amber)' },
  por_vencer:   { label: 'Por vencer',   bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)', dot: 'var(--color-brand-amber)' },
  vencido:      { label: 'Vencido',      bg: 'var(--color-red-bg)',            text: 'var(--color-red-text)',    dot: 'var(--color-red-text)' },
  sin_contrato: { label: 'Sin contrato', bg: 'var(--color-surface-2)',         text: 'var(--color-stone-text)',  dot: 'var(--color-stone-text)' },
  parcial:      { label: 'Parcial',      bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)', dot: 'var(--color-brand-amber)' },
}

export function PaymentStatusBadge({ status }) {
  const { label, bg, text, dot } = config[status] ?? { label: status, bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)', dot: 'var(--color-stone-text)' }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-[3px] rounded-full shrink-0"
      style={{ backgroundColor: bg, color: text }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />
      {label}
    </span>
  )
}
