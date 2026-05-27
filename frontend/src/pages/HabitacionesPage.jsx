import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import HabitacionForm from '../components/habitaciones/HabitacionForm'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'

const estadoConfig = {
  disponible:    { label: 'Disponible',    dot: '#3B6D11', bg: '#EAF3DE', text: '#3B6D11' },
  ocupada:       { label: 'Ocupada',       dot: '#A32D2D', bg: '#FCEBEB', text: '#A32D2D' },
  reservada:     { label: 'Reservada',     dot: '#FAC775', bg: '#FAEEDA', text: '#633806' },
  mantenimiento: { label: 'Mantenimiento', dot: '#5F5E5A', bg: '#F5F0E8', text: '#5F5E5A' },
}

const cardHover = {
  onMouseEnter: (e) => {
    e.currentTarget.style.transform = 'translateY(-3px)'
    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)'
  },
  onMouseLeave: (e) => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
  },
}

const inpFilter = 'border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D85A30] text-stone-700 transition-all'

function HabitacionCard({ h, onEdit, onView }) {
  const cfg = estadoConfig[h.estado] ?? estadoConfig.mantenimiento

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: cfg.bg }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: cfg.text, opacity: 0.65 }}>Piso {h.piso}</p>
            <p className="text-2xl font-bold leading-none" style={{ color: cfg.text }}>#{h.numero}</p>
          </div>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.75)', color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 flex-1 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Precio mensual</span>
          <span className="font-semibold" style={{ color: '#1C1917' }}>{formatGs(h.precio)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Capacidad</span>
          <span style={{ color: '#444441' }}>{h.capacidad} pers.</span>
        </div>
        {h.tiene_banio_privado && (
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#3B6D11' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
            </svg>
            Baño privado
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-1 flex gap-2">
        <button
          onClick={() => onView(h)}
          className="flex-1 text-sm font-medium py-2 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1.5px solid #E0D8CC', color: '#5F5E5A', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8'; e.currentTarget.style.color = '#1C1917' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(h)}
          className="flex-1 text-sm font-semibold py-2 rounded-xl text-white cursor-pointer"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function HabitacionDetail({ h, onEdit, onDelete }) {
  const cfg = estadoConfig[h.estado] ?? estadoConfig.mantenimiento
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'Número',    value: h.numero },
          { label: 'Piso',      value: h.piso },
          { label: 'Precio',    value: formatGs(h.precio) },
          { label: 'Capacidad', value: `${h.capacidad} persona${h.capacidad !== 1 ? 's' : ''}` },
          { label: 'Baño privado', value: h.tiene_banio_privado ? 'Sí' : 'No' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F5F0E8' }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>{label}</p>
            <p className="font-semibold" style={{ color: '#1C1917' }}>{value}</p>
          </div>
        ))}
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: cfg.bg }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: cfg.text, opacity: 0.7 }}>Estado</p>
          <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      {h.descripcion && (
        <div className="rounded-xl px-3 py-2.5 text-sm" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Descripción</p>
          <p style={{ color: '#444441' }}>{h.descripcion}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="flex-1 text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-sm font-semibold py-2.5 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1.5px solid #A32D2D', color: '#A32D2D', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FCEBEB' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
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
  const count      = data?.count

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Habitaciones"
        subtitle={!isLoading && count !== undefined ? `${count} habitación${count !== 1 ? 'es' : ''} registrada${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Nueva habitación"
        onAction={openCreate}
      />

      <div
        className="bg-white rounded-2xl px-4 py-3 mb-8 flex flex-wrap items-center gap-3"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#5F5E5A' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por número o descripción..."
            className={`${inpFilter} pl-9 w-64`}
          />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inpFilter}>
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
          className={`${inpFilter} w-24`}
        />
        {hayFiltros && (
          <button
            onClick={() => { setSearch(''); setEstado(''); setPiso('') }}
            className="ml-auto flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors"
            style={{ color: '#5F5E5A' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#D85A30' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#5F5E5A' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Limpiar
          </button>
        )}
      </div>

      {isLoading ? (
        <SkeletonGrid />
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
            <button
              onClick={openCreate}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: '#D85A30' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
            >
              + Nueva habitación
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
