import { Button } from '../ui/Button'
import { Avatar } from './InquilinoCard'

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
          { label: 'Fecha ingreso', value: i.fecha_ingreso },
          { label: 'C. emergencia', value: i.contacto_emergencia || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded px-3 py-2.5 bg-surface-2">
            <p className="text-xs font-medium mb-0.5 text-stone-text">{label}</p>
            <p className="font-semibold text-fg">{value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <Button onClick={onEdit} className="flex-1">Editar</Button>
        <Button variant="danger" onClick={onDelete} className="flex-1">Eliminar</Button>
      </div>
    </div>
  )
}
