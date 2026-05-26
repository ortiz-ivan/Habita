import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InquilinoForm from '../components/inquilinos/InquilinoForm'

export default function InquilinosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['inquilinos'],
    queryFn: () => api.get('/api/inquilinos/').then((r) => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['inquilinos'] })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/inquilinos/', data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/inquilinos/${id}/`, data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/inquilinos/${id}/`),
    onSuccess: () => { invalidate(); setDeleteTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (i) => { setEditTarget(i);   setApiError(''); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Inquilinos</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo inquilino
        </button>
      </div>

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
                <th className="px-4 py-3" />
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
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(i)} className="text-xs text-blue-600 hover:text-blue-800">Editar</button>
                      <button onClick={() => setDeleteTarget(i)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
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
        title={editTarget ? 'Editar inquilino' : 'Nuevo inquilino'}
      >
        <InquilinoForm
          key={editTarget?.id ?? 'new'}
          defaultValues={editTarget}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          apiError={apiError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`¿Eliminás a ${deleteTarget?.nombre} ${deleteTarget?.apellido}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
