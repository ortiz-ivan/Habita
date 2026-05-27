const config = {
  pagado:       { label: 'Pagado',       cls: 'bg-green-100 text-green-800' },
  pendiente:    { label: 'Pendiente',    cls: 'bg-amber-100 text-amber-900' },
  por_vencer:   { label: 'Por vencer',   cls: 'bg-amber-100 text-amber-900' },
  vencido:      { label: 'Vencido',      cls: 'bg-red-100 text-red-700' },
  sin_contrato: { label: 'Sin contrato', cls: 'bg-stone-100 text-stone-500' },
  parcial:      { label: 'Parcial',      cls: 'bg-blue-100 text-blue-700' },
}

export function PaymentStatusBadge({ status }) {
  const { label, cls } = config[status] ?? { label: status, cls: 'bg-stone-100 text-stone-500' }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg ${cls}`}>
      {label}
    </span>
  )
}
