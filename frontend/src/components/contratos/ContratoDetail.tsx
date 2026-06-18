import type { ContratoRead } from '../../types/api'
import { formatGs, formatDate } from '../../utils/format'
import { estadoConfig } from '../../lib/constants/contratos'
import { InfoCard } from '../ui/ModalParts'
import { Button } from '../ui/Button'

const ESTADOS_ACTIVOS = new Set(['activo', 'moroso'])

interface ContratoDetailProps {
  c: ContratoRead
  onEdit: () => void
  onDelete: () => void
  onTerminar?: (c: ContratoRead) => void
}

export function ContratoDetail({ c, onEdit, onDelete, onTerminar }: ContratoDetailProps) {
  const cfg = estadoConfig[c.estado] ?? estadoConfig.finalizado
  const puedeTerminar = onTerminar && ESTADOS_ACTIVOS.has(c.estado)
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoCard label="Inquilino" colSpan={2}>
          <p className="font-bold text-fg">{c.inquilino.apellido}, {c.inquilino.nombre}</p>
        </InfoCard>
        {[
          { label: 'Habitación',   value: c.habitacion.numero },
          { label: 'Fecha inicio', value: formatDate(c.fecha_inicio) },
          { label: 'Fecha fin',    value: c.fecha_fin ? formatDate(c.fecha_fin) : '—' },
          { label: 'Mensual',      value: formatGs(c.monto_mensual) },
          { label: 'Garantía',     value: formatGs(c.deposito ?? 0) },
        ].map(({ label, value }) => (
          <InfoCard key={label} label={label} value={value} />
        ))}
        <InfoCard
          label="Estado"
          style={{ backgroundColor: cfg.bg }}
          labelStyle={{ color: cfg.text, opacity: 0.7 }}
        >
          <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </InfoCard>
        {c.garantia_info && (
          <InfoCard
            label="Garantía"
            style={c.garantia_info.cancelada ? { backgroundColor: '#D1FAE5' } : { backgroundColor: '#FEF3C7' }}
            labelStyle={{ color: c.garantia_info.cancelada ? '#065F46' : '#92400E', opacity: 0.8 }}
          >
            <span className="font-bold text-sm" style={{ color: c.garantia_info.cancelada ? '#065F46' : '#92400E' }}>
              {c.garantia_info.cancelada
                ? `Cancelada (${c.garantia_info.total} ${c.garantia_info.total === 1 ? 'pago' : 'pagos'})`
                : `${c.garantia_info.pagadas} de ${c.garantia_info.total} ${c.garantia_info.total === 1 ? 'pago' : 'pagos'}`}
            </span>
          </InfoCard>
        )}
      </div>

      {c.observacion && (
        <InfoCard label="Observación">
          <p className="text-stone-dark">{c.observacion}</p>
        </InfoCard>
      )}

      <div className="flex flex-col gap-2 pt-1">
        {puedeTerminar && (
          <button
            onClick={() => onTerminar(c)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-[13px] font-semibold cursor-pointer transition-all"
            style={{ border: '1.5px solid var(--color-brand-amber)', color: 'var(--color-brand-amber)', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand-amber-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Salida anticipada
          </button>
        )}
        <div className="flex gap-2">
          <Button onClick={onEdit} className="flex-1">Editar</Button>
          <Button variant="danger" onClick={onDelete} className="flex-1">Eliminar</Button>
        </div>
      </div>
    </div>
  )
}
