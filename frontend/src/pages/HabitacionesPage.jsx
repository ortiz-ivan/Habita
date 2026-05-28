import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatGs, parseApiError } from '../utils/format'
import { habitacionesService } from '../services/habitacionesService'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import HabitacionForm from '../components/habitaciones/HabitacionForm'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'
import { queryKeys } from '../lib/queryKeys'

const estadoConfig = {
  disponible:    { label: 'Disponible',    dot: '#7dc947', bg: '#0a1f00', text: '#7dc947' },
  ocupada:       { label: 'Ocupada',       dot: '#f87171', bg: '#1f0000', text: '#f87171' },
  reservada:     { label: 'Reservada',     dot: '#FAC775', bg: '#2a1400', text: '#FAC775' },
  mantenimiento: { label: 'Mantenimiento', dot: '#888884', bg: '#1a1a1a', text: '#888884' },
}

const estadoPills = [
  { id: '', label: 'Todos' },
  ...Object.entries(estadoConfig).map(([id, cfg]) => ({ id, ...cfg })),
]

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

const inpFilter = 'border border-[#2a2a2a] rounded px-3 py-2 text-sm bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D85A30] text-[#e5e5e5] transition-all'

function HabitacionCard({ h, onEdit, onView }) {
  const cfg = estadoConfig[h.estado] ?? estadoConfig.mantenimiento

  return (
    <div
      className="rounded overflow-hidden flex flex-col cursor-default"
      style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div style={{ height: '3px', backgroundColor: cfg.dot }} />

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Piso {h.piso}</p>
            <p className="text-2xl font-bold leading-none" style={{ color: '#f0f0f0' }}>#{h.numero}</p>
          </div>
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="mx-5" style={{ height: '1px', backgroundColor: '#1f1f1f' }} />

      <div className="px-4 py-4 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Precio</p>
            <p className="text-sm font-bold" style={{ color: '#f0f0f0' }}>{formatGs(h.precio)}</p>
          </div>
          <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Capacidad</p>
            <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{h.capacidad} pers.</p>
          </div>
          {h.tiene_banio_privado && (
            <div className="col-span-2 rounded px-3 py-2.5 flex items-center gap-2" style={{ backgroundColor: '#0a1f00' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0" style={{ color: '#7dc947' }}>
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
              </svg>
              <p className="text-xs font-medium" style={{ color: '#7dc947' }}>Baño privado incluido</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2">
        <button
          onClick={() => onView(h)}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium py-2.5 rounded cursor-pointer transition-all"
          style={{ border: '1px solid #2a2a2a', color: '#888884', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a1a1a'; e.currentTarget.style.color = '#e5e5e5'; e.currentTarget.style.borderColor = '#3a3a3a' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#888884'; e.currentTarget.style.borderColor = '#2a2a2a' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          Ver más
        </button>
        <button
          onClick={() => onEdit(h)}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded text-white cursor-pointer transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
          </svg>
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
          <div key={label} className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>{label}</p>
            <p className="font-semibold" style={{ color: '#f0f0f0' }}>{value}</p>
          </div>
        ))}
        <div className="rounded px-3 py-2.5" style={{ backgroundColor: cfg.bg }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: cfg.text, opacity: 0.7 }}>Estado</p>
          <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: cfg.text }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
        </div>
      </div>

      {h.descripcion && (
        <div className="rounded px-3 py-2.5 text-sm" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>Descripción</p>
          <p style={{ color: '#e5e5e5' }}>{h.descripcion}</p>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="flex-1 text-white text-sm font-semibold py-2.5 rounded cursor-pointer"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 text-sm font-semibold py-2.5 rounded cursor-pointer transition-colors"
          style={{ border: '1.5px solid #A32D2D', color: '#f87171', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1f0000' }}
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
    queryKey: queryKeys.habitaciones.list(filters),
    queryFn:  () => habitacionesService.list(filters),
  })

  const { data: allHabs } = useQuery({
    queryKey: queryKeys.habitaciones.pisos(),
    queryFn:  () => habitacionesService.list({ page_size: 200 }),
    staleTime: 2 * 60 * 1000,
  })

  const pisosOpciones = [...new Set((allHabs?.results ?? []).map((h) => h.piso))].sort((a, b) => a - b)

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.habitaciones.all() })
    qc.invalidateQueries({ queryKey: queryKeys.habitaciones.pisos() })
  }

  const createMutation = useMutation({
    mutationFn: habitacionesService.create,
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => habitacionesService.update(id, data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: habitacionesService.remove,
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
  const activeChips = [
    search && { key: 'search', isSearch: true, label: `"${search}"`,                                                  onRemove: () => setSearch('') },
    estado && { key: 'estado', dot: estadoConfig[estado]?.dot, color: estadoConfig[estado]?.text, label: estadoConfig[estado]?.label, onRemove: () => setEstado('') },
    piso   && { key: 'piso',   label: `Piso ${piso}`,                                                                 onRemove: () => setPiso('') },
  ].filter(Boolean)

  return (
    <div>
      <PageHeader
        subtitle={!isLoading && count !== undefined ? `${count} habitación${count !== 1 ? 'es' : ''} registrada${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Nueva habitación"
        onAction={openCreate}
      />

      <div className="rounded mb-8" style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f' }}>
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#888884' }}>
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
          <select value={piso} onChange={(e) => setPiso(e.target.value)} className={inpFilter}>
            <option value="">Todos los pisos</option>
            {pisosOpciones.map((p) => (
              <option key={p} value={String(p)}>Piso {p}</option>
            ))}
          </select>
          <div className="ml-auto flex items-center gap-4">
            {!isLoading && count !== undefined && (
              <span className="text-sm shrink-0" style={{ color: '#888884' }}>
                {count} resultado{count !== 1 ? 's' : ''}
              </span>
            )}
            {hayFiltros && (
              <button
                onClick={() => { setSearch(''); setEstado(''); setPiso('') }}
                className="flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors shrink-0"
                style={{ color: '#888884' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#D85A30' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#888884' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
          </div>
        </div>
        <div style={{ height: '1px', backgroundColor: '#1f1f1f' }} />
        <div className="flex items-center gap-1 flex-wrap px-4 py-2.5">
          {estadoPills.map((pill) => {
            const isActive = estado === pill.id
            const activeStyle = pill.id === ''
              ? { backgroundColor: '#D85A30', color: '#FFFFFF' }
              : { backgroundColor: pill.bg, color: pill.text }
            return (
              <button
                key={pill.id}
                onClick={() => setEstado(pill.id)}
                className="flex items-center gap-1.5 text-[12px] px-3 py-[5px] rounded-full font-medium transition-colors cursor-pointer"
                style={isActive ? activeStyle : { color: '#888884', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1a1a1a' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {pill.id && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? pill.dot : '#555553' }}
                  />
                )}
                {pill.label}
              </button>
            )
          })}
        </div>
        {activeChips.length > 0 && (
          <>
            <div style={{ height: '1px', backgroundColor: '#1f1f1f' }} />
            <div className="flex items-center gap-2 flex-wrap px-4 py-2.5">
              {activeChips.map((chip) => <Chip key={chip.key} {...chip} />)}
            </div>
          </>
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
              className="text-sm font-semibold px-5 py-2.5 rounded text-white cursor-pointer"
              style={{ backgroundColor: '#D85A30' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
            >
              + Nueva habitación
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
