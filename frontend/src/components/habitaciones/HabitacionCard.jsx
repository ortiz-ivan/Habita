import { formatGs } from '../../utils/format'
import { Button } from '../ui/Button'
import { estadoConfig } from '../../lib/constants/habitaciones'

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

export function HabitacionCard({ h, onEdit, onView }) {
  const cfg = estadoConfig[h.estado] ?? estadoConfig.mantenimiento

  return (
    <div
      className="rounded overflow-hidden flex flex-col cursor-default bg-surface-1 border border-border"
      style={{ transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div style={{ height: '3px', backgroundColor: cfg.dot }} />

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide mb-1 text-stone-text">Piso {h.piso}</p>
            <p className="text-2xl font-bold leading-none text-fg">#{h.numero}</p>
          </div>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="mx-5 h-px bg-border" />

      <div className="px-4 py-4 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded px-3 py-2.5 bg-surface-2">
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1 text-stone-text">Precio</p>
            <p className="text-sm font-bold text-fg">{formatGs(h.precio)}</p>
          </div>
          <div className="rounded px-3 py-2.5 bg-surface-2">
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1 text-stone-text">Capacidad</p>
            <p className="text-sm font-semibold text-stone-dark">{h.capacidad} pers.</p>
          </div>
          {h.tiene_banio_privado && (
            <div className="col-span-2 rounded px-3 py-2.5 flex items-center gap-2 bg-green-bg">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-green-text">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium text-green-text">Baño privado incluido</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2">
        <Button variant="ghost" onClick={() => onView(h)} className="flex-1">
          <IconEye /> Ver más
        </Button>
        <Button onClick={() => onEdit(h)} className="flex-1">
          <IconEdit /> Editar
        </Button>
      </div>
    </div>
  )
}
