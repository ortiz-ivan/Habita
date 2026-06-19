import type { Inquilino, ContratoInquilino, EstadoContrato } from '../../types/api'
import { formatDate, formatGs } from '../../utils/format'
import { avatarColor } from '../../utils/avatar'
import { estadoConfig } from '../../lib/constants/contratos'

const cardHover = {
  onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = 'translateY(-3px)'
    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)'
  },
  onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
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

interface AvatarProps {
  nombre?: string
  apellido?: string
  size?: 'md' | 'lg'
}

export function Avatar({ nombre, apellido, size = 'md' }: AvatarProps) {
  const { bg, text } = avatarColor(`${apellido ?? ''}${nombre ?? ''}`)
  const letters = `${apellido?.[0] ?? ''}${nombre?.[0] ?? ''}`.toUpperCase()
  const cls = size === 'lg'
    ? 'w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0'
    : 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'
  return (
    <div className={cls} style={{ backgroundColor: bg, color: text }}>{letters}</div>
  )
}

function ContratoActivo({ c }: { c: ContratoInquilino }) {
  const cfg = estadoConfig[c.estado as EstadoContrato] ?? estadoConfig.activo
  return (
    <div className="rounded px-3 py-2.5 flex flex-col gap-1.5" style={{ backgroundColor: 'var(--color-surface-2)' }}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: 'var(--color-stone-text)' }}>Contrato activo</p>
        <div className="flex items-center gap-1.5">
          {c.garantia_info && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={c.garantia_info.cancelada
                ? { backgroundColor: '#D1FAE5', color: '#065F46' }
                : { backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              {c.garantia_info.cancelada ? '✓ Garantía' : `Garantía ${c.garantia_info.pagadas}/${c.garantia_info.total}`}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: cfg.bg, color: cfg.text }}>
            <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-fg">Hab. {c.habitacion}</p>
        <p className="text-[13px] font-semibold text-fg">{formatGs(c.monto_mensual)}<span className="text-[11px] font-normal ml-0.5" style={{ color: 'var(--color-stone-text)' }}>/mes</span></p>
      </div>
      {c.fecha_fin && (
        <p className="text-[11px]" style={{ color: 'var(--color-stone-text)' }}>Vence {formatDate(c.fecha_fin)}</p>
      )}
    </div>
  )
}

interface InquilinoCardProps {
  i: Inquilino
  onEdit: (i: Inquilino) => void
  onView: (i: Inquilino) => void
}

export function InquilinoCard({ i, onEdit, onView }: InquilinoCardProps) {
  return (
    <div
      className="rounded overflow-hidden flex flex-col cursor-default bg-surface-1 border border-border"
      style={{ transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <Avatar nombre={i.nombre} apellido={i.apellido} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base leading-snug text-fg">{i.apellido}, {i.nombre}</p>
            <p className="text-[12px] truncate mt-1" style={{ color: 'var(--color-stone-text)' }}>{i.email}</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-border" />

      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-stone-text)' }}>Documento</p>
          <p className="text-[14px] font-bold text-fg mt-0.5">{i.documento}</p>
        </div>

        <div className="flex gap-6">
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-stone-text)' }}>Teléfono</p>
            <p className="text-[13px] mt-0.5 text-stone-dark">{i.telefono || '—'}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-stone-text)' }}>Ingreso</p>
            <p className="text-[13px] mt-0.5 text-stone-dark">{formatDate(i.fecha_ingreso)}</p>
          </div>
        </div>

        {i.contrato_activo && <ContratoActivo c={i.contrato_activo} />}
      </div>

      <div className="px-4 py-2 flex items-center gap-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button onClick={() => onView(i)} className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded cursor-pointer transition-colors" style={{ color: 'var(--color-stone-text)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-fg)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}>
          <IconEye /> Ver
        </button>
        <div className="w-px h-3.5 mx-0.5 shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />
        <button onClick={() => onEdit(i)} className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded cursor-pointer transition-colors" style={{ color: 'var(--color-stone-text)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-brand)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}>
          <IconEdit /> Editar
        </button>
      </div>
    </div>
  )
}
