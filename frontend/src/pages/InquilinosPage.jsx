import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function InquilinosPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['inquilinos'],
    queryFn: () => api.get('/api/inquilinos/').then((r) => r.data),
  })

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Inquilinos</h2>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Documento</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Ingreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.results?.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{i.apellido}, {i.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{i.documento}</td>
                  <td className="px-4 py-3 text-gray-600">{i.email}</td>
                  <td className="px-4 py-3 text-gray-600">{i.telefono}</td>
                  <td className="px-4 py-3 text-gray-600">{i.fecha_ingreso}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
