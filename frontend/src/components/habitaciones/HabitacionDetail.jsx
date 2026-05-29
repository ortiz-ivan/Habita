import { formatGs } from '../../utils/format'
import { Button } from '../ui/Button'
import { estadoConfig } from '../../lib/constants/habitaciones'

export function HabitacionDetail({ h, onEdit, onDelete }) {
  const cfg = estadoConfig[h.estado] ?? estadoConfig.mantenimiento
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'Número',       value: h.numero },
          { label: 'Piso',         value: h.piso },
          { label: 'Precio',       value: formatGs(h.precio) },
          { label: 'Capacidad',    value: `${h.capacidad} persona${h.capacidad !== 1 ? 's' : ''}` },
          { label: 'Baño privado', value: h.tiene_banio_privado ? 'Sí' : 'No' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded px-3 py-2.5 bg-surface-2">
            <p className="text-xs font-medium mb-0.5 text-stone-text">{label}</p>
            <p className="font-semibold text-fg">{value}</p>
          </div>
        ))}
        <div className="rounded px-3 py-2.5" style={{ backgroundColor: cfg.bg }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: cfg.text, opacity: 0.7 }}>Estado</p>
          <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      {h.descripcion && (
        <div className="rounded px-3 py-2.5 text-sm bg-surface-2">
          <p className="text-xs font-medium mb-0.5 text-stone-text">Descripción</p>
          <p className="text-stone-dark">{h.descripcion}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button onClick={onEdit} className="flex-1">Editar</Button>
        <Button variant="danger" onClick={onDelete} className="flex-1">Eliminar</Button>
      </div>
    </div>
  )
}
