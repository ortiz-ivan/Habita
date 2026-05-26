import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import HabitacionForm from '../components/habitaciones/HabitacionForm'

const estadoBadge = {
  disponible:    'bg-green-100 text-green-700',
  ocupada:       'bg-red-100 text-red-700',
  reservada:     'bg-blue-100 text-blue-700',
  mantenimiento: 'bg-yellow-100 text-yellow-700',
}

export default function HabitacionesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]     = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]       = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['habitaciones'],
    queryFn: () => api.get('/api/habitaciones/').then((r) => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['habitaciones'] })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/habitaciones/', data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/habitaciones/${id}/`, data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/habitaciones/${id}/`),
    onSuccess: () => { invalidate(); setDeleteTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (h) => { setEditTarget(h);   setApiError(''); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Habitaciones</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva habitación
        </button>
      </div>

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
                <th className="px-4 py-3" />
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(h)} className="text-xs text-blue-600 hover:text-blue-800">Editar</button>
                      <button onClick={() => setDeleteTarget(h)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
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
        title={editTarget ? 'Editar habitación' : 'Nueva habitación'}
      >
        <HabitacionForm
          key={editTarget?.id ?? 'new'}
          defaultValues={editTarget}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          apiError={apiError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`¿Eliminás la habitación #${deleteTarget?.numero}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
