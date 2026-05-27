const config = {
  pagado:       { label: 'Pagado',       bg: '#EAF3DE', text: '#3B6D11', dot: '#3B6D11' },
  pendiente:    { label: 'Pendiente',    bg: '#FAEEDA', text: '#633806', dot: '#FAC775' },
  por_vencer:   { label: 'Por vencer',   bg: '#FAEEDA', text: '#633806', dot: '#FAC775' },
  vencido:      { label: 'Vencido',      bg: '#FCEBEB', text: '#A32D2D', dot: '#A32D2D' },
  sin_contrato: { label: 'Sin contrato', bg: '#F5F0E8', text: '#5F5E5A', dot: '#5F5E5A' },
  parcial:      { label: 'Parcial',      bg: '#FAEEDA', text: '#633806', dot: '#FAC775' },
}

export function PaymentStatusBadge({ status }) {
  const { label, bg, text, dot } = config[status] ?? { label: status, bg: '#F5F0E8', text: '#5F5E5A', dot: '#5F5E5A' }

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
