import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { formatGs, formatDate, parseApiError } from '../utils/format'
import { AlertBanner } from '../components/ui/AlertBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PaymentStatusBadge } from '../components/ui/PaymentStatusBadge'
import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { Modal } from '../components/ui/Modal'
import PagoForm from '../components/pagos/PagoForm'
import {
  IconHome,
  IconChart,
  IconDoc,
  IconMoney,
  IconBuildingEmpty,
  IconUsersEmpty,
} from '../components/ui/icons'
import { useHabitacionesSummary } from '../hooks/queries/useHabitaciones'
import { useContratosActivos } from '../hooks/queries/useContratos'
import { usePagosVencidos, usePagosPendientes, usePagosDashboard, usePagosResumen, useCreatePago } from '../hooks/queries/usePagos'

// ─── Configuraciones ────────────────────────────────────────────────────────

const estadoHabConfig = {
  disponible:    { label: 'Disponible',    dot: 'var(--color-green-text)',   bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  ocupada:       { label: 'Ocupada',       dot: 'var(--color-blue-text)',    bg: 'var(--color-blue-bg)',           text: 'var(--color-blue-text)' },
  reservada:     { label: 'Reservada',     dot: 'var(--color-brand-amber)',  bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  mantenimiento: { label: 'Mantenimiento', dot: 'var(--color-yellow-text)',  bg: 'var(--color-yellow-bg)',         text: 'var(--color-yellow-text)' },
}

const avatarByStatus = {
  pagado:       { bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  pendiente:    { bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  por_vencer:   { bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  vencido:      { bg: 'var(--color-red-bg)',            text: 'var(--color-red-text)' },
  parcial:      { bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  sin_contrato: { bg: 'var(--color-surface-2)',         text: 'var(--color-stone-text)' },
}

const tenantFilters = [
  { id: 'all',       label: 'Todos'      },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'por_vencer',label: 'Por vencer' },
  { id: 'vencido',   label: 'Vencidos'   },
]

// TODO: reemplazar por histórico real (endpoint mensual)
const dispSerie = [1, 2, 1, 1, 3, 2]
const contratosSerie = [7, 8, 8, 9, 9, 9]

// ─── SectionLabel ────────────────────────────────────────────────────────────

function SectionLabel({ label }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span
        className="text-[11px] font-medium uppercase tracking-[0.08em] shrink-0"
        style={{ color: 'var(--color-stone-text)' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
    </div>
  )
}

// ─── TenantRow ───────────────────────────────────────────────────────────────

function TenantRow({ pago, onCobrar }) {
  const nombre   = pago.contrato?.inquilino_nombre ?? ''
  const words    = nombre.trim().split(' ').filter(Boolean)
  const initials = words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  const { bg, text } = avatarByStatus[pago.estado] ?? avatarByStatus.sin_contrato

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 transition-colors cursor-pointer"
      style={{ borderBottom: '1px solid var(--color-surface-2)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#161616' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0"
        style={{ backgroundColor: bg, color: text }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: 'var(--color-fg)' }}>
          {nombre || '—'}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-stone-text)' }}>
          Hab. {pago.contrato?.habitacion_numero} · {formatDate(pago.fecha_pago)}
        </p>
      </div>
      <span className="text-[13px] font-medium shrink-0" style={{ color: 'var(--color-stone-dark)' }}>
        {formatGs(pago.monto)}
      </span>
      <div className="w-[88px] flex justify-end shrink-0">
        <PaymentStatusBadge status={pago.estado} />
      </div>
      {pago.estado !== 'pagado' ? (
        <button
          onClick={(e) => { e.stopPropagation(); onCobrar?.(pago) }}
          className="text-[12px] font-semibold px-3 py-1.5 rounded cursor-pointer shrink-0 whitespace-nowrap transition-colors"
          style={{
            border: '1px solid var(--color-brand)',
            background: 'color-mix(in srgb, var(--color-brand) 13%, transparent)',
            color: 'var(--color-brand)',
          }}
        >
          Cobrar
        </button>
      ) : (
        <div className="w-[58px] shrink-0" />
      )}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [tenantFilter, setTenantFilter] = useState('all')

  // ── Modal cobrar ──────────────────────────────────────────────────────────
  const [pagoModal, setPagoModal] = useState({ open: false, defaultValues: null })
  const [pagoApiError, setPagoApiError] = useState('')

  const createPago = useCreatePago({
    onSuccess: () => { setPagoModal({ open: false, defaultValues: null }); setPagoApiError('') },
    onError:   (err) => setPagoApiError(parseApiError(err)),
  })

  const handleCobrar = (pago) => {
    setPagoApiError('')
    setPagoModal({ open: true, defaultValues: { contrato: pago.contrato?.id } })
  }

  // ── Queries para métricas ─────────────────────────────────────────────────
  const { data: habitaciones }                         = useHabitacionesSummary()
  const { data: contratos }                            = useContratosActivos()
  const { data: pagosVencidos }                        = usePagosVencidos()
  const { data: pagosPendientes }                      = usePagosPendientes()
  const { data: resumen }                              = usePagosResumen()
  const { data: tenantData, isLoading: tenantLoading } = usePagosDashboard(tenantFilter)

  // ── Métricas ──────────────────────────────────────────────────────────────
  const habs        = habitaciones?.results ?? []
  const disponibles = habs.filter((h) => h.estado === 'disponible').length
  const ocupadas    = habs.filter((h) => h.estado === 'ocupada').length
  const total       = habs.length
  const ocupacion   = total ? Math.round((ocupadas / total) * 100) : 0

  const vencidosCount   = pagosVencidos?.count  ?? 0
  const pendientesCount = pagosPendientes?.count ?? 0

  const montoVencido      = (pagosVencidos?.results ?? []).reduce((acc, p) => acc + (p.monto ?? 0), 0)
  const ingresosMes       = resumen?.ingresos_mes          ?? 0
  const ingresosMesAnt    = resumen?.ingresos_mes_anterior ?? 0
  const montoAdeudado     = resumen?.monto_adeudado        ?? 0

  const ingresosDeltas = (() => {
    if (ingresosMesAnt === 0) return null
    const pct = Math.round(((ingresosMes - ingresosMesAnt) / ingresosMesAnt) * 100)
    return { value: `${pct >= 0 ? '+' : ''}${pct}% vs mes ant.`, up: pct >= 0 }
  })()

  const tenantRows = tenantData?.results ?? []

  return (
    <div>
      {/* Saludo */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-[17px] font-semibold" style={{ color: 'var(--color-fg)' }}>
            Bienvenido, {user?.first_name || user?.username}
          </h2>
          {vencidosCount === 0 && pendientesCount === 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: 'var(--color-green-bg)', color: 'var(--color-green-text)' }}
            >
              <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                <path fillRule="evenodd" d="M10.22 2.47a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L4.25 7.44l4.97-4.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"/>
              </svg>
              Pagos al día
            </span>
          )}
        </div>
        <p className="text-[13px] capitalize" style={{ color: 'var(--color-stone-text)' }}>{user?.rol}</p>
      </div>

      {/* Separador */}
      <div className="h-px mb-6" style={{ backgroundColor: 'var(--color-border)' }} />

      {/* Alertas urgentes (solo si hay problemas) */}
      {(vencidosCount > 0 || pendientesCount > 0) && (
        <div className="mb-8">
          {vencidosCount > 0 && (
            <AlertBanner
              type="danger"
              message={`${vencidosCount} pago${vencidosCount > 1 ? 's' : ''} vencido${vencidosCount > 1 ? 's' : ''} sin cobrar — ${formatGs(montoVencido)} pendientes de acción urgente`}
              actionLabel="Ver todos"
              onAction={() => navigate('/pagos?estado=vencido')}
            />
          )}
          {pendientesCount > 0 && (
            <AlertBanner
              type="warning"
              message={`${pendientesCount} pago${pendientesCount > 1 ? 's' : ''} pendiente${pendientesCount > 1 ? 's' : ''} por cobrar este mes`}
              actionLabel="Ver todos"
              onAction={() => navigate('/pagos?estado=pendiente')}
            />
          )}
        </div>
      )}

      {/* Métricas */}
      <SectionLabel label="Resumen" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <MetricCard
          label="Ingresos del mes"
          value={formatGs(ingresosMes)}
          color="success"
          icon={<IconMoney />}
          delta={ingresosDeltas}
        />
        <MetricCard
          label="Pendiente de cobro"
          value={formatGs(montoAdeudado)}
          color={vencidosCount > 0 ? 'danger' : 'warning'}
          icon={<IconChart />}
          delta={vencidosCount > 0 ? { value: `${vencidosCount} vencido${vencidosCount > 1 ? 's' : ''}`, up: false } : undefined}
        />
        <MetricCard
          label="Ocupación"
          value={`${ocupacion}%`}
          color="brand"
          icon={<IconHome />}
          progress={ocupacion}
        />
        <MetricCard
          label="Contratos activos"
          value={contratos?.count}
          color="default"
          icon={<IconDoc />}
          spark={contratosSerie}
        />
      </div>

      {/* Fila inferior: TenantTable + Habitaciones */}
      <SectionLabel label="Actividad" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        {/* TenantTable */}
        <div className="flex flex-col gap-3">
          <FilterBar
            filters={tenantFilters}
            active={tenantFilter}
            onChange={setTenantFilter}
          />

          <div className="rounded overflow-hidden bg-surface-1 border border-border">
            {/* Header */}
            <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid var(--color-surface-2)' }}>
              <h2 className="text-[13px] font-medium" style={{ color: 'var(--color-fg)' }}>Últimos movimientos</h2>
              <button
                onClick={() => navigate('/pagos')}
                className="ml-auto text-[12px] hover:underline cursor-pointer"
                style={{ color: 'var(--color-brand)' }}
              >
                Ver todos →
              </button>
            </div>

            {/* Filas */}
            <div>
              {tenantLoading ? (
                <div className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--color-stone-text)' }}>
                  Cargando…
                </div>
              ) : tenantRows.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    icon={<IconUsersEmpty />}
                    title="Sin resultados"
                    description="No hay pagos en este estado"
                  />
                </div>
              ) : (
                tenantRows.slice(0, 5).map((p) => (
                  <TenantRow key={p.id} pago={p} onCobrar={handleCobrar} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Grid de habitaciones */}
        <div className="rounded p-4 bg-surface-1 border border-border">
          <h2 className="text-[13px] font-medium mb-3" style={{ color: 'var(--color-fg)' }}>Habitaciones</h2>

          {/* Resumen por estado */}
          {total > 0 && (
            <div className="space-y-1.5 mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {Object.entries(estadoHabConfig).map(([key, { label, dot }]) => {
                const count = habs.filter((h) => h.estado === key).length
                if (count === 0) return null
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                    <span className="text-[12px] flex-1" style={{ color: 'var(--color-stone-text)' }}>{label}</span>
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--color-fg)' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          )}


          {total === 0 ? (
            <EmptyState
              icon={<IconBuildingEmpty />}
              title="No hay habitaciones"
              description="Agregá la primera habitación"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {habs.map((h) => {
                const cfg = estadoHabConfig[h.estado] ?? { label: h.estado, dot: 'var(--color-stone-text)', bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' }
                return (
                  <div
                    key={h.id}
                    className="rounded px-3 py-2.5 cursor-default transition-transform duration-150"
                    style={{ backgroundColor: cfg.bg, borderLeft: `3px solid ${cfg.dot}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <p className="text-[13px] font-semibold leading-tight" style={{ color: cfg.text }}>
                      N°{h.numero}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: cfg.dot }}>Piso {h.piso}</p>
                    <p className="text-[11px] mt-1 capitalize font-medium" style={{ color: cfg.text }}>
                      {cfg.label}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal — Cobrar pago rápido */}
      <Modal
        isOpen={pagoModal.open}
        onClose={() => setPagoModal({ open: false, defaultValues: null })}
        title="Registrar pago"
        size="lg"
      >
        <PagoForm
          defaultValues={pagoModal.defaultValues}
          onSubmit={(data) => createPago.mutate(data)}
          onCancel={() => setPagoModal({ open: false, defaultValues: null })}
          isLoading={createPago.isPending}
          apiError={pagoApiError}
        />
      </Modal>
    </div>
  )
}
