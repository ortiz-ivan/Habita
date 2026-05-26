import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InquilinoForm from '../components/inquilinos/InquilinoForm'
import { useDebounce } from '../hooks/useDebounce'

const inp = 'border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

function Initials({ nombre, apellido }) {
  const text = `${apellido?.[0] ?? ''}${nombre?.[0] ?? ''}`.toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
      {text}
    </div>
  )
}

function InquilinoCard({ i, onEdit, onView }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-100">
        <Initials nombre={i.nombre} apellido={i.apellido} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {i.apellido}, {i.nombre}
          </p>
          <p className="text-xs text-gray-400 truncate">{i.email}</p>
        </div>
      </div>

      <div className="px-4 py-3 flex-1 space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Documento</span>
          <span className="text-gray-700 font-medium">{i.documento}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Teléfono</span>
          <span className="text-gray-700">{i.telefono || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Ingreso</span>
          <span className="text-gray-700">{i.fecha_ingreso}</span>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => onView(i)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(i)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function InquilinoDetail({ i, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <Initials nombre={i.nombre} apellido={i.apellido} />
        <div>
          <p className="font-semibold text-gray-800">{i.apellido}, {i.nombre}</p>
          <p className="text-sm text-gray-400">{i.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Documento</p>
          <p className="font-semibold text-gray-800">{i.documento}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Teléfono</p>
          <p className="font-semibold text-gray-800">{i.telefono || '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Fecha de ingreso</p>
          <p className="font-semibold text-gray-800">{i.fecha_ingreso}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Contacto de emergencia</p>
          <p className="font-semibold text-gray-800">{i.contacto_emergencia || '—'}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium py-2 rounded-lg transition-colors"
        >
          Eliminar
        </button>
      </div>
    </div>
  )
}

export default function InquilinosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch] = useState('')
  const debouncedSearch     = useDebounce(search)

  const filters = { search: debouncedSearch || undefined }

  const { data, isLoading } = useQuery({
    queryKey: ['inquilinos', filters],
    queryFn:  () => api.get('/api/inquilinos/', { params: filters }).then((r) => r.data),
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
    onSuccess: () => { invalidate(); setDeleteTarget(null); setViewTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (i) => { setEditTarget(i);   setApiError(''); setViewTarget(null); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Inquilinos</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo inquilino
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, apellido, documento o email..."
          className={`${inp} w-80`}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-sm text-gray-400 hover:text-gray-600 px-2"
          >
            Limpiar
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : !data?.results?.length ? (
        <p className="text-sm text-gray-400">
          {search ? 'Sin resultados para esa búsqueda.' : 'No hay inquilinos registrados.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.results.map((i) => (
            <InquilinoCard key={i.id} i={i} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={`${viewTarget?.apellido}, ${viewTarget?.nombre}`}
      >
        {viewTarget && (
          <InquilinoDetail
            i={viewTarget}
            onEdit={() => openEdit(viewTarget)}
            onDelete={() => setDeleteTarget(viewTarget)}
          />
        )}
      </Modal>

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
