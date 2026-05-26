import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs } from '../utils/format'

const estadoBadge = {
  activo:     'bg-green-100 text-green-700',
  finalizado: 'bg-gray-100 text-gray-600',
  cancelado:  'bg-red-100 text-red-700',
  moroso:     'bg-orange-100 text-orange-700',
}

export default function ContratosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['contratos'],
    queryFn: () => api.get('/api/contratos/').then((r) => r.data),
  })

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Contratos</h2>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Inquilino</th>
                <th className="px-4 py-3 text-left">Habitación</th>
                <th className="px-4 py-3 text-left">Inicio</th>
                <th className="px-4 py-3 text-left">Monto mensual</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.results?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{c.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {c.inquilino.apellido}, {c.inquilino.nombre}
                  </td>
                  <td className="px-4 py-3 text-gray-600">#{c.habitacion.numero}</td>
                  <td className="px-4 py-3 text-gray-600">{c.fecha_inicio}</td>
                  <td className="px-4 py-3 text-gray-600">{formatGs(c.monto_mensual)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${estadoBadge[c.estado]}`}>
                      {c.estado}
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
