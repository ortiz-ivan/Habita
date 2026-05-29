import { formatGs } from '../../utils/format'
import { Button } from '../ui/Button'
import { estadoConfig } from '../../lib/constants/contratos'

export function ContratoDetail({ c, onEdit, onDelete }) {
  const cfg = estadoConfig[c.estado] ?? estadoConfig.finalizado
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded px-3 py-2.5 col-span-2 bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Inquilino</p>
          <p className="font-bold text-fg">{c.inquilino.apellido}, {c.inquilino.nombre}</p>
        </div>
        {[
          { label: 'Habitación',  value: c.habitacion.numero },
          { label: 'Fecha inicio', value: c.fecha_inicio },
          { label: 'Fecha fin',   value: c.fecha_fin || '—' },
          { label: 'Mensual',     value: formatGs(c.monto_mensual) },
          { label: 'Depósito',    value: formatGs(c.deposito ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded px-3 py-2.5 bg-surface-2">
            <p className="text-xs font-medium mb-0.5 text-stone-text">{label}</p>
            <p className="font-semibold text-fg">{value}</p>
          </div>
        ))}
        <div className="rounded px-3 py-2.5" style={{ backgroundColor: cfg.bg }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: cfg.text, opacity: 0.7 }}>Estado</p>
          <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      {c.observacion && (
        <div className="rounded px-3 py-2.5 text-sm bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Observación</p>
          <p className="text-stone-dark">{c.observacion}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button onClick={onEdit} className="flex-1">Editar</Button>
        <Button variant="danger" onClick={onDelete} className="flex-1">Eliminar</Button>
      </div>
    </div>
  )
}
