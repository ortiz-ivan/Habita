import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PagoForm from '../components/pagos/PagoForm'

const estadoBadge = {
  pagado:   'bg-green-100 text-green-700',
  pendiente:'bg-yellow-100 text-yellow-700',
  parcial:  'bg-blue-100 text-blue-700',
  vencido:  'bg-red-100 text-red-700',
}

export default function PagosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['pagos'],
    queryFn: () => api.get('/api/pagos/').then((r) => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['pagos'] })
    qc.invalidateQueries({ queryKey: ['pagos-pendientes'] })
  }

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/pagos/', data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/pagos/${id}/`, data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/pagos/${id}/`),
    onSuccess: () => { invalidate(); setDeleteTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (p) => { setEditTarget(p);   setApiError(''); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Pagos</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Registrar pago
        </button>
      </div>

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
                <th className="px-4 py-3" />
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:text-blue-800">Editar</button>
                      <button onClick={() => setDeleteTarget(p)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar pago' : 'Registrar pago'}
        size="lg"
      >
        <PagoForm
          key={editTarget?.id ?? 'new'}
          defaultValues={editTarget}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          apiError={apiError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`¿Eliminás el pago #${deleteTarget?.id}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
