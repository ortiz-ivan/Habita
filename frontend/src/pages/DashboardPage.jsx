import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import { formatGs } from '../utils/format'
import { AlertBanner } from '../components/ui/AlertBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PaymentStatusBadge } from '../components/ui/PaymentStatusBadge'
import { EmptyState } from '../components/ui/EmptyState'

const estadoHabColor = {
  disponible:    'bg-green-100 text-green-700',
  ocupada:       'bg-red-100 text-red-700',
  reservada:     'bg-amber-100 text-amber-800',
  mantenimiento: 'bg-stone-100 text-stone-500',
}

const estadoHabLabel = {
  disponible:    'Disponible',
  ocupada:       'Ocupada',
  reservada:     'Reservada',
  mantenimiento: 'Mantenimiento',
}

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

function PaymentRow({ pago }) {
  const words = (pago.contrato?.inquilino_nombre ?? '').trim().split(' ').filter(Boolean)
  const initials = words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

  return (
    <div className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-0">
      <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-900 shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-medium text-stone-800 truncate">
          {pago.contrato?.inquilino_nombre ?? '—'}
        </p>
        <p className="text-xs text-stone-400">Hab. {pago.contrato?.habitacion_numero}</p>
      </div>
      <span className="text-[15px] font-medium text-stone-700 shrink-0">{formatGs(pago.monto)}</span>
      <PaymentStatusBadge status={pago.estado} />
    </div>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const { data: habitaciones } = useQuery({
    queryKey: ['habitaciones'],
    queryFn: () => api.get('/api/habitaciones/?page_size=100').then((r) => r.data),
  })

  const { data: contratos } = useQuery({
    queryKey: ['contratos-activos'],
    queryFn: () => api.get('/api/contratos/?estado=activo&page_size=100').then((r) => r.data),
  })

  const { data: pagosVencidos } = useQuery({
    queryKey: ['pagos-vencidos'],
    queryFn: () => api.get('/api/pagos/?estado=vencido&page_size=5').then((r) => r.data),
  })

  const { data: pagosPendientes } = useQuery({
    queryKey: ['pagos-pendientes'],
    queryFn: () => api.get('/api/pagos/?estado=pendiente&page_size=5').then((r) => r.data),
  })

  const habs        = habitaciones?.results ?? []
  const disponibles = habs.filter((h) => h.estado === 'disponible').length
  const ocupadas    = habs.filter((h) => h.estado === 'ocupada').length
  const total       = habs.length
  const ocupacion   = total ? Math.round((ocupadas / total) * 100) : 0

  const vencidosCount   = pagosVencidos?.count   ?? 0
  const pendientesCount = pagosPendientes?.count  ?? 0

  const rowsVencidos   = pagosVencidos?.results   ?? []
  const rowsPendientes = pagosPendientes?.results ?? []
  const urgentRows     = [...rowsVencidos, ...rowsPendientes].slice(0, 6)

  const pagosPendientesTotal = pendientesCount + vencidosCount

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-stone-800">
          Bienvenido, {user?.first_name || user?.username}
        </h2>
        <p className="text-sm text-stone-400 capitalize">{user?.rol}</p>
      </div>

      {/* Alertas */}
      {vencidosCount > 0 && (
        <AlertBanner
          type="danger"
          message={`${vencidosCount} pago${vencidosCount > 1 ? 's' : ''} vencido${vencidosCount > 1 ? 's' : ''} sin cobrar — acción urgente requerida`}
        />
      )}
      {pendientesCount > 0 && (
        <AlertBanner
          type="warning"
          message={`${pendientesCount} pago${pendientesCount > 1 ? 's' : ''} pendiente${pendientesCount > 1 ? 's' : ''} por cobrar este mes`}
        />
      )}
      {vencidosCount === 0 && pendientesCount === 0 && (
        <AlertBanner type="success" message="Todos los pagos del mes están al día" />
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Habitaciones disponibles"
          value={disponibles}
          color="success"
          icon={<IconHome />}
        />
        <MetricCard
          label="Ocupación"
          value={`${ocupacion}%`}
          color="brand"
          icon={<IconChart />}
        />
        <MetricCard
          label="Contratos activos"
          value={contratos?.count}
          color="default"
          icon={<IconDoc />}
        />
        <MetricCard
          label="Pagos pendientes"
          value={pagosPendientesTotal}
          color={vencidosCount > 0 ? 'danger' : 'warning'}
          icon={<IconMoney />}
        />
      </div>

      {/* Lista de pagos urgentes */}
      {urgentRows.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 mb-6">
          <h3 className="text-lg font-medium text-stone-800 mb-1">Pagos por atender</h3>
          <p className="text-sm text-stone-400 mb-4">Vencidos y pendientes · ordenados por urgencia</p>
          <div>
            {urgentRows.map((p) => (
              <PaymentRow key={p.id} pago={p} />
            ))}
          </div>
        </div>
      )}

      {/* Grid de habitaciones */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-stone-800">Estado de habitaciones</h3>
          <span className="text-sm text-stone-400">{ocupadas} de {total} ocupadas</span>
        </div>

        {total === 0 ? (
          <EmptyState
            icon={<IconBuildingEmpty />}
            title="No hay habitaciones cargadas"
            description="Agregá la primera habitación para empezar"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {habs.map((h) => (
              <div
                key={h.id}
                className={`rounded-lg px-3 py-2 text-xs ${estadoHabColor[h.estado] ?? 'bg-stone-100 text-stone-500'}`}
              >
                <p className="font-medium">Hab. {h.numero}</p>
                <p className="text-[11px] opacity-60">Piso {h.piso}</p>
                <p className="mt-0.5 capitalize">{estadoHabLabel[h.estado] ?? h.estado}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
