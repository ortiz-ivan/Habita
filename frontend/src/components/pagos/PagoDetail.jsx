import { formatGs, formatDate } from '../../utils/format'
import { PaymentStatusBadge } from '../ui/PaymentStatusBadge'
import { metodoStyle } from '../../lib/constants/pagos'
import { InfoCard, DetailActions } from '../ui/ModalParts'

export function PagoDetail({ p, onEdit, onDelete }) {
  const met = metodoStyle[p.metodo_pago] ?? metodoStyle.efectivo
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoCard label="Inquilino" colSpan={2}>
          <p className="font-bold text-fg">{p.contrato.inquilino_nombre}</p>
        </InfoCard>
        <InfoCard label="Habitación" value={p.contrato.habitacion_numero} />
        <InfoCard label="Estado">
          <PaymentStatusBadge status={p.estado} />
        </InfoCard>
        <InfoCard label="Monto">
          <p className="font-bold text-fg">{formatGs(p.monto)}</p>
        </InfoCard>
        <InfoCard label="Fecha" value={formatDate(p.fecha_pago)} />
        <InfoCard label="Método" colSpan={2}>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize" style={{ backgroundColor: met.bg, color: met.text }}>
            {p.metodo_pago}
          </span>
        </InfoCard>
      </div>

      {p.observacion && (
        <InfoCard label="Observación">
          <p className="text-stone-dark">{p.observacion}</p>
        </InfoCard>
      )}

      <DetailActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
