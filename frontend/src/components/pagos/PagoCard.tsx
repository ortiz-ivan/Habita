import type { PagoRead } from '../../types/api'
import { formatGs, formatDate } from '../../utils/format'
import { estadoConfig, metodoStyle } from '../../lib/constants/pagos'

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

interface PagoCardProps {
  p: PagoRead
  onEdit: (p: PagoRead) => void
  onView: (p: PagoRead) => void
  onCobrar: (p: PagoRead) => void
}

export function PagoCard({ p, onEdit, onView, onCobrar }: PagoCardProps) {
  const cfg = estadoConfig[p.estado] ?? { label: p.estado, dot: 'var(--color-stone-text)', bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' }
  const met = metodoStyle[p.metodo_pago] ?? metodoStyle.efectivo

  return (
    <div
      className="rounded overflow-hidden flex flex-col cursor-default bg-surface-1 border border-border"
      style={{ transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div style={{ height: '3px', backgroundColor: cfg.dot }} />

      <div className="px-5 pt-5 pb-4">
        <p className="text-base font-bold leading-snug text-fg mb-1">{p.contrato?.inquilino_nombre}</p>
        <p className="text-[12px]" style={{ color: 'var(--color-stone-text)' }}>Hab. {p.contrato?.habitacion_numero}</p>
      </div>

      <div className="mx-5 h-px bg-border" />

      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-xl font-bold leading-tight text-fg">{formatGs(p.monto)}</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-stone-text)' }}>{formatDate(p.fecha_pago)}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize"
            style={{ backgroundColor: met.bg, color: met.text }}
          >
            {p.metodo_pago}
          </span>
        </div>
      </div>

      <div className="px-4 py-2 flex items-center gap-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button onClick={() => onView(p)} className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded cursor-pointer transition-colors" style={{ color: 'var(--color-stone-text)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-fg)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}>
          <IconEye /> Ver
        </button>
        <div className="w-px h-3.5 mx-0.5 shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />
        <button onClick={() => onEdit(p)} className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded cursor-pointer transition-colors" style={{ color: 'var(--color-stone-text)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-brand)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}>
          <IconEdit /> Editar
        </button>
        {p.estado !== 'pagado' && onCobrar && (
          <>
            <div className="w-px h-3.5 mx-0.5 shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />
            <button
              onClick={() => onCobrar(p)}
              className="flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1.5 rounded cursor-pointer transition-all"
              style={{ color: '#fff', background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)' }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              Cobrar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
