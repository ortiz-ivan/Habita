import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

const estadoColor = {
  disponible:   'bg-green-100 text-green-700',
  ocupada:      'bg-red-100 text-red-700',
  reservada:    'bg-blue-100 text-blue-700',
  mantenimiento:'bg-yellow-100 text-yellow-700',
}

function StatCard({ label, value, color = 'text-gray-800' }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
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

  const { data: pagos } = useQuery({
    queryKey: ['pagos-pendientes'],
    queryFn: () => api.get('/api/pagos/?estado=pendiente&page_size=100').then((r) => r.data),
  })

  const habs = habitaciones?.results ?? []
  const disponibles   = habs.filter((h) => h.estado === 'disponible').length
  const ocupadas      = habs.filter((h) => h.estado === 'ocupada').length
  const total         = habs.length
  const ocupacion     = total ? Math.round((ocupadas / total) * 100) : 0

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-1">
        Bienvenido, {user?.first_name || user?.username}
      </h2>
      <p className="text-sm text-gray-500 mb-6 capitalize">{user?.rol}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Habitaciones disponibles" value={disponibles} color="text-green-600" />
        <StatCard label="Habitaciones ocupadas"    value={ocupadas}    color="text-red-600" />
        <StatCard label="Contratos activos"        value={contratos?.count} color="text-blue-600" />
        <StatCard label="Pagos pendientes"         value={pagos?.count}     color="text-yellow-600" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Estado de habitaciones</h3>
          <span className="text-sm text-gray-500">Ocupación: {ocupacion}%</span>
        </div>

        {total === 0 ? (
          <p className="text-sm text-gray-400">No hay habitaciones cargadas.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {habs.map((h) => (
              <div
                key={h.id}
                className={`rounded-lg px-3 py-2 text-xs font-medium ${estadoColor[h.estado] ?? 'bg-gray-100 text-gray-600'}`}
              >
                <span className="font-bold">{h.numero}</span>
                <span className="ml-1 text-gray-500">Piso {h.piso}</span>
                <p className="capitalize mt-0.5">{h.estado}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
