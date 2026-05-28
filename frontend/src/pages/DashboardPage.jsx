import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { formatGs } from '../utils/format'
import { AlertBanner } from '../components/ui/AlertBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PaymentStatusBadge } from '../components/ui/PaymentStatusBadge'
import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { queryKeys } from '../lib/queryKeys'

// ─── Configuraciones ────────────────────────────────────────────────────────

const estadoHabConfig = {
  disponible:    { label: 'Disponible',    dot: '#7dc947', bg: '#0a1f00', text: '#7dc947' },
  ocupada:       { label: 'Ocupada',       dot: '#f87171', bg: '#1f0000', text: '#f87171' },
  reservada:     { label: 'Reservada',     dot: '#FAC775', bg: '#2a1400', text: '#FAC775' },
  mantenimiento: { label: 'Mantenimiento', dot: '#888884', bg: '#1a1a1a', text: '#888884' },
}

const avatarByStatus = {
  pagado:       { bg: '#0a1f00', text: '#7dc947' },
  pendiente:    { bg: '#2a1400', text: '#FAC775' },
  por_vencer:   { bg: '#2a1400', text: '#FAC775' },
  vencido:      { bg: '#1f0000', text: '#f87171' },
  parcial:      { bg: '#2a1400', text: '#FAC775' },
  sin_contrato: { bg: '#1a1a1a', text: '#888884' },
}

const tenantFilters = [
  { id: 'all',       label: 'Todos'      },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'por_vencer',label: 'Por vencer' },
  { id: 'vencido',   label: 'Vencidos'   },
]

// ─── Íconos ──────────────────────────────────────────────────────────────────

const IconHome = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
)

const IconChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
)

const IconDoc = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
)

const IconMoney = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
)

const IconBuildingEmpty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
)

const IconUsersEmpty = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
)

// ─── TenantRow ───────────────────────────────────────────────────────────────

function TenantRow({ pago }) {
  const nombre   = pago.contrato?.inquilino_nombre ?? ''
  const words    = nombre.trim().split(' ').filter(Boolean)
  const initials = words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  const { bg, text } = avatarByStatus[pago.estado] ?? avatarByStatus.sin_contrato

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 transition-colors cursor-pointer"
      style={{ borderBottom: '1px solid #1a1a1a' }}
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
        <p className="text-[13px] font-medium truncate" style={{ color: '#f0f0f0' }}>
          {nombre || '—'}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: '#888884' }}>
          Hab. {pago.contrato?.habitacion_numero} · {pago.fecha_pago}
        </p>
      </div>
      <span className="text-[13px] font-medium shrink-0" style={{ color: '#e5e5e5' }}>
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
  const { data: habitaciones } = useQuery({
    queryKey: queryKeys.habitaciones.all(),
    queryFn:  () => api.get('/api/habitaciones/?page_size=100').then((r) => r.data),
  })

  const { data: contratos } = useQuery({
    queryKey: queryKeys.contratos.activos(),
    queryFn:  () => api.get('/api/contratos/?estado=activo&page_size=100').then((r) => r.data),
  })

  const { data: pagosVencidos } = useQuery({
    queryKey: queryKeys.pagos.vencidos(),
    queryFn:  () => api.get('/api/pagos/?estado=vencido&page_size=1').then((r) => r.data),
  })

  const { data: pagosPendientes } = useQuery({
    queryKey: queryKeys.pagos.pendientes(),
    queryFn:  () => api.get('/api/pagos/?estado=pendiente&page_size=1').then((r) => r.data),
  })

  // ── Query para TenantTable (reacciona al filtro activo) ───────────────────
  const { data: tenantData, isLoading: tenantLoading } = useQuery({
    queryKey: queryKeys.pagos.dashboard(tenantFilter),
    queryFn:  () => {
      const params = { page_size: 8 }
      if (tenantFilter !== 'all') params.estado = tenantFilter
      return api.get('/api/pagos/', { params }).then((r) => r.data)
    },
  })

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
        <h2 className="text-[17px] font-semibold" style={{ color: '#f0f0f0' }}>
          Bienvenido, {user?.first_name || user?.username}
        </h2>
        <p className="text-[13px] mt-0.5 capitalize" style={{ color: '#888884' }}>{user?.rol}</p>
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

          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f' }}>
          {/* Header */}
          <div className="flex items-center px-4 py-3" style={{ borderBottom: '1px solid #1a1a1a' }}>
            <h2 className="text-[13px] font-medium" style={{ color: '#f0f0f0' }}>Inquilinos</h2>
            <button
              onClick={() => navigate('/pagos')}
              className="ml-auto text-[12px] hover:underline cursor-pointer"
              style={{ color: '#D85A30' }}
            >
              Ver todos →
            </button>
          </div>

          {/* Filas */}
          <div>
            {tenantLoading ? (
              <div className="px-4 py-8 text-center text-[13px]" style={{ color: '#888884' }}>
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
        <div className="rounded-xl p-4" style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[13px] font-medium" style={{ color: '#f0f0f0' }}>Habitaciones</h2>
              <p className="text-[11px] mt-[1px]" style={{ color: '#888884' }}>
                {ocupadas} de {total} ocupadas
              </p>
            </div>
            {total > 0 && (
              <div className="flex items-center gap-2.5">
                {Object.entries(estadoHabConfig).map(([key, { dot }]) => {
                  const count = habs.filter((h) => h.estado === key).length
                  if (count === 0) return null
                  return (
                    <span key={key} className="flex items-center gap-1 text-[11px]" style={{ color: '#888884' }}>
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
                const cfg = estadoHabConfig[h.estado] ?? { label: h.estado, dot: '#888884', bg: '#1a1a1a', text: '#888884' }
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
