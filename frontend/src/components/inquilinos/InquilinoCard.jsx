import { Button } from '../ui/Button'
import { avatarColor } from '../../utils/avatar'

const cardHover = {
  onMouseEnter: (e) => {
    e.currentTarget.style.transform = 'translateY(-3px)'
    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)'
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
  },
}

const IconEye = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
)

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
  </svg>
)

export function Avatar({ nombre, apellido, size = 'md' }) {
  const { bg, text } = avatarColor(`${apellido ?? ''}${nombre ?? ''}`)
  const letters = `${apellido?.[0] ?? ''}${nombre?.[0] ?? ''}`.toUpperCase()
  const cls = size === 'lg'
    ? 'w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0'
    : 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'
  return (
    <div className={cls} style={{ backgroundColor: bg, color: text }}>{letters}</div>
  )
}

export function InquilinoCard({ i, onEdit, onView }) {
  return (
    <div
      className="rounded overflow-hidden flex flex-col cursor-default bg-surface-1 border border-border"
      style={{ transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div className="px-5 pt-5 pb-4 bg-surface-2">
        <div className="flex items-center gap-3">
          <Avatar nombre={i.nombre} apellido={i.apellido} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base leading-snug text-fg">{i.apellido}, {i.nombre}</p>
            <p className="text-xs truncate mt-0.5 text-stone-text">{i.email}</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="px-4 py-4 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded px-3 py-2.5 bg-surface-2">
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1 text-stone-text">Documento</p>
            <p className="text-sm font-bold text-fg">{i.documento}</p>
          </div>
          <div className="rounded px-3 py-2.5 bg-surface-2">
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1 text-stone-text">Teléfono</p>
            <p className="text-sm font-semibold text-stone-dark">{i.telefono || '—'}</p>
          </div>
          <div className="col-span-2 rounded px-3 py-2.5 bg-surface-2">
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1 text-stone-text">Fecha de ingreso</p>
            <p className="text-sm font-semibold text-stone-dark">{i.fecha_ingreso}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2">
        <Button variant="ghost" onClick={() => onView(i)} className="flex-1">
          <IconEye /> Ver más
        </Button>
        <Button onClick={() => onEdit(i)} className="flex-1">
          <IconEdit /> Editar
        </Button>
      </div>
    </div>
  )
}
