import { useQuery } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs } from '../utils/format'

const estadoBadge = {
  pagado:   'bg-green-100 text-green-700',
  pendiente:'bg-yellow-100 text-yellow-700',
  parcial:  'bg-blue-100 text-blue-700',
  vencido:  'bg-red-100 text-red-700',
}

export default function PagosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['pagos'],
    queryFn: () => api.get('/api/pagos/').then((r) => r.data),
  })

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Pagos</h2>

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
                <th className="px-4 py-3 text-left">Monto</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Método</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.results?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{p.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.contrato.inquilino_nombre}</td>
                  <td className="px-4 py-3 text-gray-600">#{p.contrato.habitacion_numero}</td>
                  <td className="px-4 py-3 text-gray-600">{formatGs(p.monto)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.fecha_pago}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.metodo_pago}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${estadoBadge[p.estado]}`}>
                      {p.estado}
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
