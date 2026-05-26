import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import HabitacionForm from '../components/habitaciones/HabitacionForm'
import { useDebounce } from '../hooks/useDebounce'

const estadoBadge = {
  disponible:    'bg-green-100 text-green-700',
  ocupada:       'bg-red-100 text-red-700',
  reservada:     'bg-blue-100 text-blue-700',
  mantenimiento: 'bg-yellow-100 text-yellow-700',
}

const estadoLabel = {
  disponible:    'Disponible',
  ocupada:       'Ocupada',
  reservada:     'Reservada',
  mantenimiento: 'Mantenimiento',
}

const inp = 'border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

function HabitacionCard({ h, onEdit, onView }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="flex items-center justify-end px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Piso: {h.piso}
        </span>
      </div>

      <div className="px-4 py-4 flex-1 space-y-2">
        <p className="text-base font-semibold text-gray-800">
          Habitación {h.numero}
        </p>
        <p className="text-sm text-gray-600">
          <span className="text-gray-400">Precio:</span> {formatGs(h.precio)}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Estado:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[h.estado]}`}>
            {estadoLabel[h.estado] ?? h.estado}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => onView(h)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(h)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function HabitacionDetail({ h, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Número</p>
          <p className="font-semibold text-gray-800">{h.numero}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Piso</p>
          <p className="font-semibold text-gray-800">{h.piso}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Precio</p>
          <p className="font-semibold text-gray-800">{formatGs(h.precio)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Capacidad</p>
          <p className="font-semibold text-gray-800">{h.capacidad} persona{h.capacidad !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Baño privado</p>
          <p className="font-semibold text-gray-800">{h.tiene_banio_privado ? 'Sí' : 'No'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Estado</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[h.estado]}`}>
            {estadoLabel[h.estado] ?? h.estado}
          </span>
        </div>
      </div>

      {h.descripcion && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-xs text-gray-400 mb-0.5">Descripción</p>
          <p className="text-gray-700">{h.descripcion}</p>
        </div>
      )}

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

export default function HabitacionesPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [piso, setPiso]     = useState('')
  const debouncedSearch     = useDebounce(search)

  const filters = {
    search:  debouncedSearch || undefined,
    estado:  estado || undefined,
    piso:    piso   || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['habitaciones', filters],
    queryFn:  () => api.get('/api/habitaciones/', { params: filters }).then((r) => r.data),
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
    onSuccess: () => { invalidate(); setDeleteTarget(null); setViewTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (h) => { setEditTarget(h);   setApiError(''); setViewTarget(null); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const hayFiltros = search || estado || piso

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Habitaciones</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nueva habitación
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por número o descripción..."
          className={`${inp} w-64`}
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inp}>
          <option value="">Todos los estados</option>
          <option value="disponible">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="reservada">Reservada</option>
          <option value="mantenimiento">Mantenimiento</option>
        </select>
        <input
          type="number"
          value={piso}
          onChange={(e) => setPiso(e.target.value)}
          placeholder="Piso"
          min="1"
          className={`${inp} w-24`}
        />
        {hayFiltros && (
          <button
            onClick={() => { setSearch(''); setEstado(''); setPiso('') }}
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
          {hayFiltros ? 'Sin resultados para esa búsqueda.' : 'No hay habitaciones registradas.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.results.map((h) => (
            <HabitacionCard key={h.id} h={h} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Habitación ${viewTarget?.numero}`}>
        {viewTarget && (
          <HabitacionDetail
            h={viewTarget}
            onEdit={() => openEdit(viewTarget)}
            onDelete={() => setDeleteTarget(viewTarget)}
          />
        )}
      </Modal>

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
        message={`¿Eliminás la habitación ${deleteTarget?.numero}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
