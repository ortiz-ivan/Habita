import type { Habitacion } from '../../types/api'
import { formatGs } from '../../utils/format'
import { estadoConfig } from '../../lib/constants/habitaciones'
import { InfoCard, DetailActions } from '../ui/ModalParts'

interface HabitacionDetailProps {
  h: Habitacion
  onEdit: () => void
  onDelete: () => void
}

export function HabitacionDetail({ h, onEdit, onDelete }: HabitacionDetailProps) {
  const cfg = estadoConfig[h.estado] ?? estadoConfig.mantenimiento
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'Número',       value: h.numero },
          { label: 'Piso',         value: String(h.piso) },
          { label: 'Precio',       value: formatGs(h.precio) },
          { label: 'Capacidad',    value: `${h.capacidad} persona${h.capacidad !== 1 ? 's' : ''}` },
          { label: 'Baño privado', value: h.tiene_banio_privado ? 'Sí' : 'No' },
        ].map(({ label, value }) => (
          <InfoCard key={label} label={label} value={value} />
        ))}
        <InfoCard
          label="Estado"
          style={{ backgroundColor: cfg.bg }}
          labelStyle={{ color: cfg.text, opacity: 0.7 }}
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </InfoCard>
      </div>

      {h.descripcion && (
        <InfoCard label="Descripción">
          <p className="text-stone-dark">{h.descripcion}</p>
        </InfoCard>
      )}

      <DetailActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
