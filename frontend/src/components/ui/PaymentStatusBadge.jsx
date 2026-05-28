const config = {
  pagado:       { label: 'Pagado',       bg: '#0a1f00', text: '#7dc947', dot: '#7dc947' },
  pendiente:    { label: 'Pendiente',    bg: '#2a1400', text: '#FAC775', dot: '#FAC775' },
  por_vencer:   { label: 'Por vencer',   bg: '#2a1400', text: '#FAC775', dot: '#FAC775' },
  vencido:      { label: 'Vencido',      bg: '#1f0000', text: '#f87171', dot: '#f87171' },
  sin_contrato: { label: 'Sin contrato', bg: '#1a1a1a', text: '#888884', dot: '#888884' },
  parcial:      { label: 'Parcial',      bg: '#2a1400', text: '#FAC775', dot: '#FAC775' },
}

export function PaymentStatusBadge({ status }) {
  const { label, bg, text, dot } = config[status] ?? { label: status, bg: '#1a1a1a', text: '#888884', dot: '#888884' }

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
