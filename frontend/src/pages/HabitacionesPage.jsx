import { useState, useEffect } from 'react'
import { parseApiError } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import HabitacionForm from '../components/habitaciones/HabitacionForm'
import { HabitacionCard } from '../components/habitaciones/HabitacionCard'
import { HabitacionDetail } from '../components/habitaciones/HabitacionDetail'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'
import { useHabitacionesList, useHabitacionesPisos, useCreateHabitacion, useUpdateHabitacion, useDeleteHabitacion } from '../hooks/queries/useHabitaciones'
import { Pagination } from '../components/ui/Pagination'
import { estadoConfig, estadoPills } from '../lib/constants/habitaciones'
import { TiposModal } from '../components/habitaciones/TiposModal'
import { BulkCreateModal } from '../components/habitaciones/BulkCreateModal'
import { SelectInput } from '../components/ui/ModalParts'

const inpFilter = 'border border-border-strong rounded-lg px-3 py-2 text-[13px] bg-surface-2 text-stone-dark placeholder:text-[#55554f] focus:outline-none focus:ring-[3px] focus:ring-brand/15 focus:border-brand transition-all'

function KpiCard({ label, value, dot, color, isLoading, onClick, active }) {
  const base   = { backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }
  const active_ = { backgroundColor: color?.bg ?? 'var(--color-surface-2)', borderColor: color?.dot ?? 'var(--color-brand)' }
  return (
    <div
      onClick={onClick}
      className={`rounded border px-4 py-3 transition-all select-none ${onClick ? 'cursor-pointer' : ''}`}
      style={active ? active_ : base}
      onMouseEnter={(e) => { if (onClick && !active) e.currentTarget.style.backgroundColor = 'var(--color-surface-2)' }}
      onMouseLeave={(e) => { if (onClick && !active) e.currentTarget.style.backgroundColor = 'var(--color-surface-1)' }}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        {dot && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dot }} />}
        <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: 'var(--color-stone-text)' }}>{label}</p>
      </div>
      {isLoading ? (
        <div className="h-7 w-8 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border-strong)' }} />
      ) : (
        <p className="text-[26px] font-bold leading-none tracking-tight" style={{ color: active && color ? color.text : 'var(--color-fg)' }}>
          {value ?? '—'}
        </p>
      )}
    </div>
  )
}

export default function HabitacionesPage() {
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')
  const [tiposOpen, setTiposOpen]       = useState(false)
  const [bulkOpen, setBulkOpen]         = useState(false)

  const [search, setSearch] = useState('')
  const [estado, setEstado] = useState('')
  const [piso, setPiso]     = useState('')
  const [page, setPage]     = useState(1)
  const debouncedSearch     = useDebounce(search)

  useEffect(() => { setPage(1) }, [debouncedSearch, estado, piso])

  const filters = {
    search: debouncedSearch || undefined,
    estado: estado          || undefined,
    piso:   piso            || undefined,
    page:   page > 1 ? page : undefined,
  }

  const { data, isLoading }                      = useHabitacionesList(filters)
  const { data: allHabs, isLoading: kpiLoading } = useHabitacionesPisos()
  const allResults    = allHabs?.results ?? []
  const pisosOpciones = [...new Set(allResults.map((h) => h.piso))].sort((a, b) => a - b)
  const kpis = {
    total:         allResults.length,
    disponible:    allResults.filter(h => h.estado === 'disponible').length,
    ocupada:       allResults.filter(h => h.estado === 'ocupada').length,
    reservada:     allResults.filter(h => h.estado === 'reservada').length,
    mantenimiento: allResults.filter(h => h.estado === 'mantenimiento').length,
  }

  const createMutation = useCreateHabitacion({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useUpdateHabitacion({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useDeleteHabitacion({
    onSuccess: () => { setDeleteTarget(null); setViewTarget(null) },
    onError:   (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
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
      <div className="flex items-center justify-between mb-6">
        <div />
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => setTiposOpen(true)} className="shrink-0 px-7 py-5">
            Tipos
          </Button>
          <Button variant="ghost" onClick={() => setBulkOpen(true)} className="shrink-0 px-7 py-5">
            Crear en lote
          </Button>
          <Button onClick={openCreate} className="shrink-0 px-7 py-5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva habitación
          </Button>
        </div>
      </div>

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Total"         value={kpis.total}         isLoading={kpiLoading} />
        <KpiCard label="Disponibles"   value={kpis.disponible}    dot={estadoConfig.disponible.dot}    color={estadoConfig.disponible}    isLoading={kpiLoading} onClick={() => setEstado(estado === 'disponible'    ? '' : 'disponible')}    active={estado === 'disponible'} />
        <KpiCard label="Ocupadas"      value={kpis.ocupada}       dot={estadoConfig.ocupada.dot}       color={estadoConfig.ocupada}       isLoading={kpiLoading} onClick={() => setEstado(estado === 'ocupada'       ? '' : 'ocupada')}       active={estado === 'ocupada'} />
        <KpiCard label="Reservadas"    value={kpis.reservada}     dot={estadoConfig.reservada.dot}     color={estadoConfig.reservada}     isLoading={kpiLoading} onClick={() => setEstado(estado === 'reservada'     ? '' : 'reservada')}     active={estado === 'reservada'} />
        <KpiCard label="Mantenimiento" value={kpis.mantenimiento} dot={estadoConfig.mantenimiento.dot} color={estadoConfig.mantenimiento} isLoading={kpiLoading} onClick={() => setEstado(estado === 'mantenimiento' ? '' : 'mantenimiento')} active={estado === 'mantenimiento'} />
      </div>

      <div className="rounded mb-8 bg-surface-1 border border-border">

        {/* Fila de búsqueda y filtros */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <div className="relative flex-1 min-w-[350px] max-w-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-stone-text">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por número o descripción..."
              className={`${inpFilter} pl-9 w-full`}
            />
          </div>

          <SelectInput value={piso} onChange={(e) => setPiso(e.target.value)} className={inpFilter}>
            <option value="">Todos los pisos</option>
            {pisosOpciones.map((p) => (
              <option key={p} value={String(p)}>Piso {p}</option>
            ))}
          </SelectInput>

          <div className="w-px h-5 self-center shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />

          {!isLoading && count !== undefined && (
            <span className="text-[13px] shrink-0" style={{ color: 'var(--color-stone-text)' }}>
              {count} resultado{count !== 1 ? 's' : ''}
            </span>
          )}

          {hayFiltros && (
            <button
              onClick={() => { setSearch(''); setEstado(''); setPiso('') }}
              className="flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors shrink-0"
              style={{ color: 'var(--color-stone-text)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-brand)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Limpiar
            </button>
          )}
        </div>

        {/* Fila de pills de estado */}
        <div className="h-px bg-border" />
        <div className="flex items-center gap-1 flex-wrap px-6 py-3">
          {estadoPills.map((pill) => {
            const isActive = estado === pill.id
            const activeStyle = pill.id === ''
              ? { backgroundColor: 'var(--color-brand)', color: '#FFFFFF' }
              : { backgroundColor: pill.bg, color: pill.text }
            return (
              <button
                key={pill.id}
                onClick={() => setEstado(pill.id)}
                className="flex items-center gap-1.5 text-[12px] px-3 py-[5px] rounded-full font-medium transition-colors cursor-pointer"
                style={isActive ? activeStyle : { color: 'var(--color-stone-text)', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface-2)' }}
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
            <div className="h-px bg-border" />
            <div className="flex items-center gap-2 flex-wrap px-6 py-3">
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
            <Button onClick={openCreate} className="px-5">+ Nueva habitación</Button>
          )}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {data.results.map((h, i) => (
              <div
                key={h.id}
                style={{
                  animation: 'slide-up-fade 0.38s ease both',
                  animationDelay: `${Math.min(i * 0.045, 0.36)}s`,
                }}
              >
                <HabitacionCard h={h} onEdit={openEdit} onView={setViewTarget} />
              </div>
            ))}
          </div>
          <Pagination count={data.count} page={page} onChange={setPage} />
        </>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Habitación ${viewTarget?.numero}`} size="lg">
        {viewTarget && (
          <HabitacionDetail
            h={viewTarget}
            onEdit={() => openEdit(viewTarget)}
            onDelete={() => setDeleteTarget(viewTarget)}
          />
        )}
      </Modal>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar habitación' : 'Nueva habitación'}>
        <HabitacionForm
          key={editTarget?.id ?? 'new'}
          defaultValues={editTarget}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
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

      <TiposModal isOpen={tiposOpen} onClose={() => setTiposOpen(false)} />
      <BulkCreateModal isOpen={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  )
}
