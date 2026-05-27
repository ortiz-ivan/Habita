import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ContratoForm from '../components/contratos/ContratoForm'
import { EmptyState } from '../components/ui/EmptyState'
import { useDebounce } from '../hooks/useDebounce'

const accentBorder = {
  activo:     'border-l-4 border-l-green-400',
  finalizado: 'border-l-4 border-l-stone-300',
  cancelado:  'border-l-4 border-l-red-400',
  moroso:     'border-l-4 border-l-orange-400',
}

const estadoBadge = {
  activo:     'bg-green-100 text-green-700',
  finalizado: 'bg-stone-100 text-stone-500',
  cancelado:  'bg-red-100 text-red-700',
  moroso:     'bg-orange-100 text-orange-700',
}

const estadoLabel = {
  activo:     'Activo',
  finalizado: 'Finalizado',
  cancelado:  'Cancelado',
  moroso:     'Moroso',
}

const inp = 'border border-stone-200 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D85A30] text-stone-700 transition-colors'

function ContratoCard({ c, onEdit, onView }) {
  const accent = accentBorder[c.estado] ?? ''
  return (
    <div className={`bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow ${accent}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-100">
        <span className="text-xs font-medium text-stone-500">
          Hab. {c.habitacion.numero}
        </span>
        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${estadoBadge[c.estado]}`}>
          {estadoLabel[c.estado] ?? c.estado}
        </span>
      </div>

      <div className="px-5 py-5 flex-1 space-y-3 text-sm">
        <p className="font-medium text-stone-800 truncate">
          {c.inquilino.apellido}, {c.inquilino.nombre}
        </p>
        <div className="flex justify-between">
          <span className="text-stone-400">Inicio</span>
          <span className="text-stone-700">{c.fecha_inicio}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Monto mensual</span>
          <span className="text-stone-700 font-medium">{formatGs(c.monto_mensual)}</span>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-stone-100 flex gap-2">
        <button
          onClick={() => onView(c)}
          className="flex-1 text-sm py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(c)}
          className="flex-1 text-sm py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
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
        <div className="bg-stone-50 rounded-lg px-3 py-2 col-span-2">
          <p className="text-xs text-stone-400 mb-0.5">Inquilino</p>
          <p className="font-medium text-stone-800">{c.inquilino.apellido}, {c.inquilino.nombre}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Habitación</p>
          <p className="font-medium text-stone-800">{c.habitacion.numero}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Estado</p>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${estadoBadge[c.estado]}`}>
            {estadoLabel[c.estado] ?? c.estado}
          </span>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Fecha inicio</p>
          <p className="font-medium text-stone-800">{c.fecha_inicio}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Fecha fin</p>
          <p className="font-medium text-stone-800">{c.fecha_fin || '—'}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Monto mensual</p>
          <p className="font-medium text-stone-800">{formatGs(c.monto_mensual)}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Depósito</p>
          <p className="font-medium text-stone-800">{formatGs(c.deposito ?? 0)}</p>
        </div>
      </div>

      {c.observacion && (
        <div className="bg-stone-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-xs text-stone-400 mb-0.5">Observación</p>
          <p className="text-stone-700">{c.observacion}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
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
    estado: estado          || undefined,
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

  const isSaving   = createMutation.isPending || updateMutation.isPending
  const hayFiltros = search || estado

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-stone-800">Contratos</h2>
        <button
          onClick={openCreate}
          className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
        >
          + Nuevo contrato
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 mb-8 flex flex-wrap items-center gap-3">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por inquilino o habitación..."
            className={`${inp} pl-9 w-72`}
          />
        </div>
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
            className="ml-auto flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#D85A30] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-stone-400">Cargando...</p>
      ) : !data?.results?.length ? (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay contratos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Creá el primer contrato para empezar'}
          action={!hayFiltros && (
            <button onClick={openCreate} className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#D85A30' }}>
              + Nuevo contrato
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
