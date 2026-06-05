import { formatGs, formatDate } from '../../utils/format'
import { estadoConfig } from '../../lib/constants/contratos'
import { InfoCard, DetailActions } from '../ui/ModalParts'

export function ContratoDetail({ c, onEdit, onDelete }) {
  const cfg = estadoConfig[c.estado] ?? estadoConfig.finalizado
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoCard label="Inquilino" colSpan={2}>
          <p className="font-bold text-fg">{c.inquilino.apellido}, {c.inquilino.nombre}</p>
        </InfoCard>
        {[
          { label: 'Habitación',   value: c.habitacion.numero },
          { label: 'Fecha inicio', value: formatDate(c.fecha_inicio) },
          { label: 'Fecha fin',    value: c.fecha_fin ? formatDate(c.fecha_fin) : '—' },
          { label: 'Mensual',      value: formatGs(c.monto_mensual) },
          { label: 'Depósito',     value: formatGs(c.deposito ?? 0) },
        ].map(({ label, value }) => (
          <InfoCard key={label} label={label} value={value} />
        ))}
        <InfoCard
          label="Estado"
          style={{ backgroundColor: cfg.bg }}
          labelStyle={{ color: cfg.text, opacity: 0.7 }}
        >
          <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </InfoCard>
      </div>

      {c.observacion && (
        <InfoCard label="Observación">
          <p className="text-stone-dark">{c.observacion}</p>
        </InfoCard>
      )}

      <DetailActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
