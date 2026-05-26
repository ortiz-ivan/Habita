import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs } from '../utils/format'

const estadoBadge = {
  disponible:    'bg-green-100 text-green-700',
  ocupada:       'bg-red-100 text-red-700',
  reservada:     'bg-blue-100 text-blue-700',
  mantenimiento: 'bg-yellow-100 text-yellow-700',
}

export default function HabitacionesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['habitaciones'],
    queryFn: () => api.get('/api/habitaciones/').then((r) => r.data),
  })

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Habitaciones</h2>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Piso</th>
                <th className="px-4 py-3 text-left">Precio</th>
                <th className="px-4 py-3 text-left">Capacidad</th>
                <th className="px-4 py-3 text-left">Baño privado</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.results?.map((h) => (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">#{h.numero}</td>
                  <td className="px-4 py-3 text-gray-600">{h.piso}</td>
                  <td className="px-4 py-3 text-gray-600">{formatGs(h.precio)}</td>
                  <td className="px-4 py-3 text-gray-600">{h.capacidad}</td>
                  <td className="px-4 py-3 text-gray-600">{h.tiene_banio_privado ? 'Sí' : 'No'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${estadoBadge[h.estado]}`}>
                      {h.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
