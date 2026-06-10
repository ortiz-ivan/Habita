import { formatGs, formatDate } from '../../utils/format'
import { estadoConfig } from '../../lib/constants/habitaciones'

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
      className="rounded-xl overflow-hidden flex flex-col cursor-default bg-surface-1 border border-border"
      style={{ transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.30)'
        e.currentTarget.style.borderColor = 'var(--color-border-strong)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--color-border)'
      }}
    >
      {/* Gradient status bar */}
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${cfg.dot} 0%, ${cfg.dot}88 100%)`, flexShrink: 0 }} />

      {/* Encabezado: número y piso */}
      <div className="px-5 pt-5 pb-4">
        <p className="leading-none text-fg" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '5px' }}>N°{h.numero}</p>
        <p className="text-[12px]" style={{ color: 'var(--color-stone-text)' }}>Piso {h.piso}</p>
      </div>

      <div className="mx-5 h-px bg-border" />

      {/* Cuerpo: precio, capacidad, estado, beneficio */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-3">
        <div>
          <p className="text-[15px] font-bold leading-tight text-fg">{formatGs(h.precio)}</p>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-stone-text)' }}>
            {h.capacidad} persona{h.capacidad !== 1 ? 's' : ''}
          </p>
        </div>

        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold w-fit"
          style={{ backgroundColor: cfg.bg, color: cfg.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
          {cfg.label}
        </span>

        {h.tiene_banio_privado && (
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0 text-green-text">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            <p className="text-[12px] font-medium text-green-text">Baño privado incluido</p>
          </div>
        )}
      </div>

      {/* Contrato activo */}
      <div className="mx-5 h-px bg-border" />
      <div className="px-5 py-3">
        {h.contrato_activo ? (
          <div>
            <p className="text-[12px] font-semibold leading-tight text-fg">{h.contrato_activo.inquilino_nombre}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {h.contrato_activo.fecha_fin && (
                <span className="text-[11px]" style={{ color: 'var(--color-stone-text)' }}>
                  Vence {formatDate(h.contrato_activo.fecha_fin)}
                </span>
              )}
              {h.contrato_activo.pagos_pendientes > 0 ? (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-red-bg)', color: 'var(--color-red-text)' }}>
                  {h.contrato_activo.pagos_pendientes} pendiente{h.contrato_activo.pagos_pendientes !== 1 ? 's' : ''}
                </span>
              ) : (
                <span className="text-[11px] font-medium" style={{ color: 'var(--color-green-text)' }}>Al día</span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[12px]" style={{ color: 'var(--color-stone-text)' }}>Sin contrato activo</p>
        )}
      </div>

      {/* Acciones */}
      <div className="px-4 py-2 flex items-center gap-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
        <button onClick={() => onView(h)} className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-md cursor-pointer transition-all" style={{ color: 'var(--color-stone-text)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-fg)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}>
          <IconEye /> Ver
        </button>
        <div className="w-px h-3.5 mx-0.5 shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />
        <button onClick={() => onEdit(h)} className="flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1.5 rounded-md cursor-pointer transition-all" style={{ color: 'var(--color-stone-text)' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-brand)' }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-stone-text)' }}>
          <IconEdit /> Editar
        </button>
      </div>
    </div>
  )
}
