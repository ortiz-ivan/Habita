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
  const [habPage, setHabPage] = useState(0)
  const [movPage, setMovPage] = useState(0)

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
          {vencidosCount > 0 ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: 'var(--color-red-bg)', color: 'var(--color-red-text)' }}
            >
              <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1ZM4.22 4.22a.75.75 0 0 1 1.06 0L6 4.94l.72-.72a.75.75 0 1 1 1.06 1.06L7.06 6l.72.72a.75.75 0 1 1-1.06 1.06L6 7.06l-.72.72a.75.75 0 0 1-1.06-1.06L4.94 6l-.72-.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
              </svg>
              {vencidosCount} pago{vencidosCount > 1 ? 's' : ''} vencido{vencidosCount > 1 ? 's' : ''}
            </span>
          ) : pendientesCount > 0 ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: 'var(--color-brand-amber-light)', color: 'var(--color-brand-amber)' }}
            >
              <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                <path fillRule="evenodd" d="M5.105 1.67c.394-.683 1.396-.683 1.79 0l4.5 7.794C11.787 10.148 11.29 11 10.5 11h-9c-.79 0-1.287-.852-.895-1.536l4.5-7.794ZM6 4.5a.75.75 0 0 0-.75.75v2a.75.75 0 0 0 1.5 0v-2A.75.75 0 0 0 6 4.5Zm0 5.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd"/>
              </svg>
              {pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''}
            </span>
          ) : (
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
            onChange={(v) => { setTenantFilter(v); setMovPage(0) }}
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
              ) : (() => {
                const MOV_PAGE_SIZE = 5
                const movTotalPages = Math.ceil(tenantRows.length / MOV_PAGE_SIZE)
                const movCurPage = Math.min(movPage, movTotalPages - 1)
                const pageRows = tenantRows.slice(movCurPage * MOV_PAGE_SIZE, (movCurPage + 1) * MOV_PAGE_SIZE)
                return (
                  <>
                    {pageRows.map((p) => (
                      <TenantRow key={p.id} pago={p} onCobrar={handleCobrar} />
                    ))}
                    {movTotalPages > 1 && (
                      <div className="flex items-center justify-between mx-3 mt-2 mb-2 px-2 py-2 rounded-lg" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                        <button
                          onClick={() => setMovPage((p) => Math.max(0, p - 1))}
                          disabled={movCurPage === 0}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                          style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: movCurPage === 0 ? 'not-allowed' : 'pointer' }}
                          onMouseEnter={(e) => { if (movCurPage > 0) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                        >
                          ← Ant.
                        </button>
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888884' }}>
                          <span style={{ color: 'var(--color-brand)' }}>{movCurPage + 1}</span> / {movTotalPages}
                        </span>
                        <button
                          onClick={() => setMovPage((p) => Math.min(movTotalPages - 1, p + 1))}
                          disabled={movCurPage === movTotalPages - 1}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                          style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: movCurPage === movTotalPages - 1 ? 'not-allowed' : 'pointer' }}
                          onMouseEnter={(e) => { if (movCurPage < movTotalPages - 1) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                        >
                          Sig. →
                        </button>
                      </div>
                    )}
                  </>
                )
              })()}
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
          ) : (() => {
            const PAGE_SIZE = 8
            const totalPages = Math.ceil(habs.length / PAGE_SIZE)
            const page = Math.min(habPage, totalPages - 1)
            const pageHabs = habs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            return (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {pageHabs.map((h) => {
                    const cfg = estadoHabConfig[h.estado] ?? { label: h.estado, dot: 'var(--color-stone-text)', bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' }
                    return (
                      <div
                        key={h.id}
                        className="rounded px-3 py-2.5 cursor-default transition-transform duration-150"
                        style={{ backgroundColor: cfg.bg, borderLeft: `3px solid ${cfg.dot}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <p className="text-[13px] font-semibold leading-tight" style={{ color: cfg.text }}>N°{h.numero}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: cfg.dot }}>Piso {h.piso}</p>
                        <p className="text-[11px] mt-1 capitalize font-medium" style={{ color: cfg.text }}>{cfg.label}</p>
                      </div>
                    )
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 px-2 pb-2 rounded-lg" style={{ borderTop: '1px solid var(--color-border)', background: '#0f0f0f' }}>
                    <button
                      onClick={() => setHabPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                      style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                      onMouseEnter={(e) => { if (page > 0) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                    >
                      ← Ant.
                    </button>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888884' }}>
                      <span style={{ color: 'var(--color-brand)' }}>{page + 1}</span> / {totalPages}
                    </span>
                    <button
                      onClick={() => setHabPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                      style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                      onMouseEnter={(e) => { if (page < totalPages - 1) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                    >
                      Sig. →
                    </button>
                  </div>
                )}
              </>
            )
          })()}
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
