import { formatGs } from '../../utils/format'
import { Button } from '../ui/Button'
import { PaymentStatusBadge } from '../ui/PaymentStatusBadge'
import { metodoStyle } from '../../lib/constants/pagos'

export function PagoDetail({ p, onEdit, onDelete }) {
  const met = metodoStyle[p.metodo_pago] ?? metodoStyle.efectivo
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded px-3 py-2.5 col-span-2 bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Inquilino</p>
          <p className="font-bold text-fg">{p.contrato.inquilino_nombre}</p>
        </div>
        <div className="rounded px-3 py-2.5 bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Habitación</p>
          <p className="font-semibold text-fg">{p.contrato.habitacion_numero}</p>
        </div>
        <div className="rounded px-3 py-2.5 bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Estado</p>
          <PaymentStatusBadge status={p.estado} />
        </div>
        <div className="rounded px-3 py-2.5 bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Monto</p>
          <p className="font-bold text-fg">{formatGs(p.monto)}</p>
        </div>
        <div className="rounded px-3 py-2.5 bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Fecha</p>
          <p className="font-semibold text-fg">{p.fecha_pago}</p>
        </div>
        <div className="rounded px-3 py-2.5 col-span-2 bg-surface-2">
          <p className="text-xs font-medium mb-1 text-stone-text">Método</p>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize" style={{ backgroundColor: met.bg, color: met.text }}>
            {p.metodo_pago}
          </span>
        </div>
      </div>

      {p.observacion && (
        <div className="rounded px-3 py-2.5 text-sm bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Observación</p>
          <p className="text-stone-dark">{p.observacion}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button onClick={onEdit} className="flex-1">Editar</Button>
        <Button variant="danger" onClick={onDelete} className="flex-1">Eliminar</Button>
      </div>
    </div>
  )
}
