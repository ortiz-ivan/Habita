import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import HabitacionForm from '../components/habitaciones/HabitacionForm'
import { EmptyState } from '../components/ui/EmptyState'
import { useDebounce } from '../hooks/useDebounce'

const estadoBadge = {
  disponible:    'bg-green-100 text-green-700',
  ocupada:       'bg-red-100 text-red-700',
  reservada:     'bg-amber-100 text-amber-800',
  mantenimiento: 'bg-stone-100 text-stone-500',
}

const estadoLabel = {
  disponible:    'Disponible',
  ocupada:       'Ocupada',
  reservada:     'Reservada',
  mantenimiento: 'Mantenimiento',
}

const inp = 'border border-stone-200 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D85A30] text-stone-700 transition-colors'

function HabitacionCard({ h, onEdit, onView }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-end px-4 py-2 bg-stone-50 border-b border-stone-100">
        <span className="text-xs font-medium text-stone-500">
          Piso {h.piso}
        </span>
      </div>

      <div className="px-5 py-5 flex-1 space-y-3">
        <p className="text-base font-medium text-stone-800">
          Habitación {h.numero}
        </p>
        <p className="text-sm text-stone-600">
          <span className="text-stone-400">Precio:</span> {formatGs(h.precio)}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-400">Estado:</span>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${estadoBadge[h.estado]}`}>
            {estadoLabel[h.estado] ?? h.estado}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-stone-100 flex gap-2">
        <button
          onClick={() => onView(h)}
          className="flex-1 text-sm py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(h)}
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

function HabitacionDetail({ h, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Número</p>
          <p className="font-medium text-stone-800">{h.numero}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Piso</p>
          <p className="font-medium text-stone-800">{h.piso}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Precio</p>
          <p className="font-medium text-stone-800">{formatGs(h.precio)}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Capacidad</p>
          <p className="font-medium text-stone-800">{h.capacidad} persona{h.capacidad !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Baño privado</p>
          <p className="font-medium text-stone-800">{h.tiene_banio_privado ? 'Sí' : 'No'}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Estado</p>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${estadoBadge[h.estado]}`}>
            {estadoLabel[h.estado] ?? h.estado}
          </span>
        </div>
      </div>

      {h.descripcion && (
        <div className="bg-stone-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-xs text-stone-400 mb-0.5">Descripción</p>
          <p className="text-stone-700">{h.descripcion}</p>
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
    search: debouncedSearch || undefined,
    estado: estado          || undefined,
    piso:   piso            || undefined,
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

  const isSaving   = createMutation.isPending || updateMutation.isPending
  const hayFiltros = search || estado || piso

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-stone-800">Habitaciones</h2>
        <button
          onClick={openCreate}
          className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
        >
          + Nueva habitación
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
            placeholder="Buscar por número o descripción..."
            className={`${inp} pl-9 w-64`}
          />
        </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
            </svg>
          }
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay habitaciones registradas'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Agregá la primera habitación para empezar'}
          action={!hayFiltros && (
            <button onClick={openCreate} className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#D85A30' }}>
              + Nueva habitación
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
