import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import ContratoForm from '../components/contratos/ContratoForm'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'

const estadoConfig = {
  activo:     { label: 'Activo',     dot: '#3B6D11', bg: '#EAF3DE', text: '#3B6D11' },
  finalizado: { label: 'Finalizado', dot: '#5F5E5A', bg: '#F5F0E8', text: '#5F5E5A' },
  cancelado:  { label: 'Cancelado',  dot: '#A32D2D', bg: '#FCEBEB', text: '#A32D2D' },
  moroso:     { label: 'Moroso',     dot: '#A32D2D', bg: '#FCEBEB', text: '#A32D2D' },
}

const inpFilter = 'border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D85A30] text-stone-700 transition-all'

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

function ContratoCard({ c, onEdit, onView }) {
  const cfg = estadoConfig[c.estado] ?? estadoConfig.finalizado

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: cfg.bg }}>
        <div className="flex items-start justify-between mb-2">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.75)', color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
          <span className="text-xs font-bold" style={{ color: cfg.text }}>Hab. {c.habitacion.numero}</span>
        </div>
        <p className="text-base font-bold leading-tight truncate" style={{ color: cfg.text }}>
          {c.inquilino.apellido}, {c.inquilino.nombre}
        </p>
      </div>

      <div className="px-5 py-4 flex-1 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Inicio</span>
          <span style={{ color: '#444441' }}>{c.fecha_inicio}</span>
        </div>
        {c.fecha_fin && (
          <div className="flex justify-between">
            <span style={{ color: '#5F5E5A' }}>Fin</span>
            <span style={{ color: '#444441' }}>{c.fecha_fin}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Mensual</span>
          <span className="font-bold" style={{ color: '#1C1917' }}>{formatGs(c.monto_mensual)}</span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex gap-2">
        <button
          onClick={() => onView(c)}
          className="flex-1 text-sm font-medium py-2 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1.5px solid #E0D8CC', color: '#5F5E5A', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8'; e.currentTarget.style.color = '#1C1917' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(c)}
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

function ContratoDetail({ c, onEdit, onDelete }) {
  const cfg = estadoConfig[c.estado] ?? estadoConfig.finalizado
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl px-3 py-2.5 col-span-2" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Inquilino</p>
          <p className="font-bold" style={{ color: '#1C1917' }}>{c.inquilino.apellido}, {c.inquilino.nombre}</p>
        </div>
        {[
          { label: 'Habitación', value: c.habitacion.numero },
          { label: 'Fecha inicio', value: c.fecha_inicio },
          { label: 'Fecha fin', value: c.fecha_fin || '—' },
          { label: 'Mensual', value: formatGs(c.monto_mensual) },
          { label: 'Depósito', value: formatGs(c.deposito ?? 0) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F5F0E8' }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>{label}</p>
            <p className="font-semibold" style={{ color: '#1C1917' }}>{value}</p>
          </div>
        ))}
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: cfg.bg }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: cfg.text, opacity: 0.7 }}>Estado</p>
          <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      {c.observacion && (
        <div className="rounded-xl px-3 py-2.5 text-sm" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Observación</p>
          <p style={{ color: '#444441' }}>{c.observacion}</p>
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
  const count      = data?.count

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Contratos"
        subtitle={!isLoading && count !== undefined ? `${count} contrato${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Nuevo contrato"
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
            placeholder="Buscar por inquilino o habitación..."
            className={`${inpFilter} pl-9 w-72`}
          />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inpFilter}>
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="finalizado">Finalizado</option>
          <option value="cancelado">Cancelado</option>
          <option value="moroso">Moroso</option>
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setSearch(''); setEstado('') }}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay contratos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Creá el primer contrato para empezar'}
          action={!hayFiltros && (
            <button
              onClick={openCreate}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: '#D85A30' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
            >
              + Nuevo contrato
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar contrato' : 'Nuevo contrato'} size="lg">
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
