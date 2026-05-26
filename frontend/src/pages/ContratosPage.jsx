import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ContratoForm from '../components/contratos/ContratoForm'
import { useDebounce } from '../hooks/useDebounce'

const estadoBadge = {
  activo:     'bg-green-100 text-green-700',
  finalizado: 'bg-gray-100 text-gray-600',
  cancelado:  'bg-red-100 text-red-700',
  moroso:     'bg-orange-100 text-orange-700',
}

const estadoLabel = {
  activo:     'Activo',
  finalizado: 'Finalizado',
  cancelado:  'Cancelado',
  moroso:     'Moroso',
}

const inp = 'border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

function ContratoCard({ c, onEdit, onView }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Hab. {c.habitacion.numero}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[c.estado]}`}>
          {estadoLabel[c.estado] ?? c.estado}
        </span>
      </div>

      <div className="px-4 py-4 flex-1 space-y-2 text-sm">
        <p className="font-semibold text-gray-800 truncate">
          {c.inquilino.apellido}, {c.inquilino.nombre}
        </p>
        <div className="flex justify-between">
          <span className="text-gray-400">Inicio</span>
          <span className="text-gray-700">{c.fecha_inicio}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Monto mensual</span>
          <span className="text-gray-700 font-medium">{formatGs(c.monto_mensual)}</span>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => onView(c)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(c)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function ContratoDetail({ c, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
          <p className="text-xs text-gray-400 mb-0.5">Inquilino</p>
          <p className="font-semibold text-gray-800">{c.inquilino.apellido}, {c.inquilino.nombre}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Habitación</p>
          <p className="font-semibold text-gray-800">{c.habitacion.numero}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Estado</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[c.estado]}`}>
            {estadoLabel[c.estado] ?? c.estado}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Fecha inicio</p>
          <p className="font-semibold text-gray-800">{c.fecha_inicio}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Fecha fin</p>
          <p className="font-semibold text-gray-800">{c.fecha_fin || '—'}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Monto mensual</p>
          <p className="font-semibold text-gray-800">{formatGs(c.monto_mensual)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Depósito</p>
          <p className="font-semibold text-gray-800">{formatGs(c.deposito ?? 0)}</p>
        </div>
      </div>

      {c.observacion && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-xs text-gray-400 mb-0.5">Observación</p>
          <p className="text-gray-700">{c.observacion}</p>
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

export default function ContratosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const debouncedSearch     = useDebounce(search)

  const filters = {
    search: debouncedSearch || undefined,
    estado: estado || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['contratos', filters],
    queryFn:  () => api.get('/api/contratos/', { params: filters }).then((r) => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['contratos'] })
    qc.invalidateQueries({ queryKey: ['contratos-select'] })
    qc.invalidateQueries({ queryKey: ['habitaciones'] })
  }

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/contratos/', data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/contratos/${id}/`, data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/contratos/${id}/`),
    onSuccess: () => { invalidate(); setDeleteTarget(null); setViewTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (c) => { setEditTarget(c);   setApiError(''); setViewTarget(null); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const hayFiltros = search || estado

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Contratos</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo contrato
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por inquilino o habitación..."
          className={`${inp} w-72`}
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inp}>
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
          <option value="moroso">Moroso</option>
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setSearch(''); setEstado('') }}
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
          {hayFiltros ? 'Sin resultados para esa búsqueda.' : 'No hay contratos registrados.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.results.map((c) => (
            <ContratoCard key={c.id} c={c} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Contrato #${viewTarget?.id}`}>
        {viewTarget && (
          <ContratoDetail
            c={viewTarget}
            onEdit={() => openEdit(viewTarget)}
            onDelete={() => setDeleteTarget(viewTarget)}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar contrato' : 'Nuevo contrato'}
        size="lg"
      >
        <ContratoForm
          key={editTarget?.id ?? 'new'}
          defaultValues={editTarget}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          apiError={apiError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`¿Eliminás el contrato #${deleteTarget?.id}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
