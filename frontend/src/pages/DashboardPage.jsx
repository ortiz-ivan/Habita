import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { formatGs } from '../utils/format'
import { AlertBanner } from '../components/ui/AlertBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PaymentStatusBadge } from '../components/ui/PaymentStatusBadge'
import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
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
import { usePagosVencidos, usePagosPendientes, usePagosDashboard } from '../hooks/queries/usePagos'

// ─── Configuraciones ────────────────────────────────────────────────────────

const estadoHabConfig = {
  disponible:    { label: 'Disponible',    dot: 'var(--color-green-text)',  bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  ocupada:       { label: 'Ocupada',       dot: 'var(--color-red-text)',    bg: 'var(--color-red-bg)',            text: 'var(--color-red-text)' },
  reservada:     { label: 'Reservada',     dot: 'var(--color-brand-amber)', bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  mantenimiento: { label: 'Mantenimiento', dot: 'var(--color-stone-text)',  bg: 'var(--color-surface-2)',         text: 'var(--color-stone-text)' },
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

// ─── TenantRow ───────────────────────────────────────────────────────────────

function TenantRow({ pago }) {
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
          Hab. {pago.contrato?.habitacion_numero} · {pago.fecha_pago}
        </p>
      </div>
      <span className="text-[13px] font-medium shrink-0" style={{ color: 'var(--color-stone-dark)' }}>
        {formatGs(pago.monto)}
      </span>
      <PaymentStatusBadge status={pago.estado} />
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [tenantFilter, setTenantFilter] = useState('all')

  // ── Queries para métricas ─────────────────────────────────────────────────
  const { data: habitaciones }                         = useHabitacionesSummary()
  const { data: contratos }                            = useContratosActivos()
  const { data: pagosVencidos }                        = usePagosVencidos()
  const { data: pagosPendientes }                      = usePagosPendientes()
  const { data: tenantData, isLoading: tenantLoading } = usePagosDashboard(tenantFilter)

  // ── Métricas ──────────────────────────────────────────────────────────────
  const habs        = habitaciones?.results ?? []
  const disponibles = habs.filter((h) => h.estado === 'disponible').length
  const ocupadas    = habs.filter((h) => h.estado === 'ocupada').length
  const total       = habs.length
  const ocupacion   = total ? Math.round((ocupadas / total) * 100) : 0

  const vencidosCount    = pagosVencidos?.count   ?? 0
  const pendientesCount  = pagosPendientes?.count  ?? 0
  const pagosPendTotal   = pendientesCount + vencidosCount

  const tenantRows = tenantData?.results ?? []

  return (
    <div>
      {/* Saludo */}
      <div className="mb-5">
        <h2 className="text-[17px] font-semibold" style={{ color: 'var(--color-fg)' }}>
          Bienvenido, {user?.first_name || user?.username}
        </h2>
        <p className="text-[13px] mt-0.5 capitalize" style={{ color: 'var(--color-stone-text)' }}>{user?.rol}</p>
      </div>

      {/* Alertas */}
      {vencidosCount > 0 && (
        <AlertBanner
          type="danger"
          message={`${vencidosCount} pago${vencidosCount > 1 ? 's' : ''} vencido${vencidosCount > 1 ? 's' : ''} sin cobrar — acción urgente requerida`}
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
      {vencidosCount === 0 && pendientesCount === 0 && (
        <AlertBanner type="success" message="Todos los pagos del mes están al día" />
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <MetricCard label="Disponibles"      value={disponibles}      color="success" icon={<IconHome />} />
        <MetricCard label="Ocupación"        value={`${ocupacion}%`}  color="brand"   icon={<IconChart />} progress={ocupacion} />
        <MetricCard label="Contratos activos" value={contratos?.count} color="default" icon={<IconDoc />} />
        <MetricCard
          label="Pagos pendientes"
          value={pagosPendTotal}
          color={vencidosCount > 0 ? 'danger' : 'warning'}
          icon={<IconMoney />}
        />
      </div>

      {/* Fila inferior: TenantTable + Habitaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        {/* TenantTable */}
        <div className="flex flex-col gap-[38px]">
          {/* FilterBar */}
          <FilterBar
            filters={tenantFilters}
            active={tenantFilter}
            onChange={setTenantFilter}
          />

          <div className="rounded-xl overflow-hidden bg-surface-1 border border-border" >
          {/* Header */}
          <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid var(--color-surface-2)' }}>
            <h2 className="text-[13px] font-medium" style={{ color: 'var(--color-fg)' }}>Inquilinos</h2>
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
              tenantRows.map((p) => (
                <TenantRow key={p.id} pago={p} />
              ))
            )}
          </div>
        </div>
        </div>

        {/* Grid de habitaciones */}
        <div className="rounded-xl p-4 bg-surface-1 border border-border" >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[13px] font-medium" style={{ color: 'var(--color-fg)' }}>Habitaciones</h2>
              <p className="text-[11px] mt-[1px]" style={{ color: 'var(--color-stone-text)' }}>
                {ocupadas} de {total} ocupadas
              </p>
            </div>
            {total > 0 && (
              <div className="flex items-center gap-2.5">
                {Object.entries(estadoHabConfig).map(([key, { dot }]) => {
                  const count = habs.filter((h) => h.estado === key).length
                  if (count === 0) return null
                  return (
                    <span key={key} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-stone-text)' }}>
                      <span className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: dot }} />
                      {count}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

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
                    className="rounded-lg px-3 py-2.5 cursor-default transition-transform duration-150"
                    style={{ backgroundColor: cfg.bg, borderLeft: `3px solid ${cfg.dot}` }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                  >
                    <p className="text-[13px] font-semibold leading-tight" style={{ color: cfg.text }}>
                      #{h.numero}
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
    </div>
  )
}
