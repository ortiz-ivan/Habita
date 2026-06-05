import { formatDate } from '../../utils/format'
import { Avatar } from './InquilinoCard'
import { InfoCard, DetailActions } from '../ui/ModalParts'

export function InquilinoDetail({ i, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <Avatar nombre={i.nombre} apellido={i.apellido} size="lg" />
        <div>
          <p className="font-bold text-fg">{i.apellido}, {i.nombre}</p>
          <p className="text-sm text-stone-text">{i.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'Documento',     value: i.documento },
          { label: 'Teléfono',      value: i.telefono || '—' },
          { label: 'Fecha ingreso', value: formatDate(i.fecha_ingreso) },
          { label: 'C. emergencia', value: i.contacto_emergencia || '—' },
        ].map(({ label, value }) => (
          <InfoCard key={label} label={label} value={value} />
        ))}
      </div>

      <DetailActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}
