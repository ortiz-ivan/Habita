import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PagoForm from '../components/pagos/PagoForm'
import { useDebounce } from '../hooks/useDebounce'

const estadoBadge = {
  pagado:   'bg-green-100 text-green-700',
  pendiente:'bg-yellow-100 text-yellow-700',
  parcial:  'bg-blue-100 text-blue-700',
  vencido:  'bg-red-100 text-red-700',
}

const estadoLabel = {
  pagado:   'Pagado',
  pendiente:'Pendiente',
  parcial:  'Parcial',
  vencido:  'Vencido',
}

const metodoBadge = {
  efectivo:     'bg-gray-100 text-gray-600',
  transferencia:'bg-purple-100 text-purple-600',
  tarjeta:      'bg-indigo-100 text-indigo-600',
  qr:           'bg-teal-100 text-teal-600',
}

const inp = 'border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500'

function PagoCard({ p, onEdit, onView }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Hab. {p.contrato.habitacion_numero}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[p.estado]}`}>
          {estadoLabel[p.estado] ?? p.estado}
        </span>
      </div>

      <div className="px-4 py-4 flex-1 space-y-2 text-sm">
        <p className="font-semibold text-gray-800 truncate">{p.contrato.inquilino_nombre}</p>
        <div className="flex justify-between">
          <span className="text-gray-400">Monto</span>
          <span className="text-gray-700 font-medium">{formatGs(p.monto)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Fecha</span>
          <span className="text-gray-700">{p.fecha_pago}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Método</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${metodoBadge[p.metodo_pago] ?? 'bg-gray-100 text-gray-600'}`}>
            {p.metodo_pago}
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
        <button
          onClick={() => onView(p)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(p)}
          className="flex-1 text-sm py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function PagoDetail({ p, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
          <p className="text-xs text-gray-400 mb-0.5">Inquilino</p>
          <p className="font-semibold text-gray-800">{p.contrato.inquilino_nombre}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Habitación</p>
          <p className="font-semibold text-gray-800">{p.contrato.habitacion_numero}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Estado</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[p.estado]}`}>
            {estadoLabel[p.estado] ?? p.estado}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Monto</p>
          <p className="font-semibold text-gray-800">{formatGs(p.monto)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-400 mb-0.5">Fecha de pago</p>
          <p className="font-semibold text-gray-800">{p.fecha_pago}</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
          <p className="text-xs text-gray-400 mb-0.5">Método de pago</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${metodoBadge[p.metodo_pago] ?? 'bg-gray-100 text-gray-600'}`}>
            {p.metodo_pago}
          </span>
        </div>
      </div>

      {p.observacion && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-xs text-gray-400 mb-0.5">Observación</p>
          <p className="text-gray-700">{p.observacion}</p>
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

export default function PagosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch]           = useState('')
  const [estado, setEstado]           = useState('')
  const [metodoPago, setMetodoPago]   = useState('')
  const debouncedSearch               = useDebounce(search)

  const filters = {
    search:      debouncedSearch || undefined,
    estado:      estado          || undefined,
    metodo_pago: metodoPago      || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['pagos', filters],
    queryFn:  () => api.get('/api/pagos/', { params: filters }).then((r) => r.data),
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
    onSuccess: () => { invalidate(); setDeleteTarget(null); setViewTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (p) => { setEditTarget(p);   setApiError(''); setViewTarget(null); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const hayFiltros = search || estado || metodoPago

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Pagos</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Registrar pago
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre del inquilino..."
          className={`${inp} w-64`}
        />
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inp}>
          <option value="">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="parcial">Parcial</option>
          <option value="vencido">Vencido</option>
        </select>
        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={inp}>
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="qr">QR</option>
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setSearch(''); setEstado(''); setMetodoPago('') }}
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
          {hayFiltros ? 'Sin resultados para esa búsqueda.' : 'No hay pagos registrados.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.results.map((p) => (
            <PagoCard key={p.id} p={p} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Pago #${viewTarget?.id}`}>
        {viewTarget && (
          <PagoDetail
            p={viewTarget}
            onEdit={() => openEdit(viewTarget)}
            onDelete={() => setDeleteTarget(viewTarget)}
          />
        )}
      </Modal>

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
