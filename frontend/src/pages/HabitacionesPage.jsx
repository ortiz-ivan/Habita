import { useState } from 'react'
import { parseApiError } from '../utils/format'
import { Button } from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import HabitacionForm from '../components/habitaciones/HabitacionForm'
import { HabitacionCard } from '../components/habitaciones/HabitacionCard'
import { HabitacionDetail } from '../components/habitaciones/HabitacionDetail'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'
import { useHabitacionesList, useHabitacionesPisos, useCreateHabitacion, useUpdateHabitacion, useDeleteHabitacion } from '../hooks/queries/useHabitaciones'
import { estadoConfig, estadoPills } from '../lib/constants/habitaciones'

const inpFilter = 'border border-border-strong rounded px-3 py-2 text-sm bg-surface-1 focus:outline-none focus:ring-2 focus:ring-brand text-stone-dark transition-all'

export default function HabitacionesPage() {
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

  const { data, isLoading }  = useHabitacionesList(filters)
  const { data: allHabs }    = useHabitacionesPisos()
  const pisosOpciones = [...new Set((allHabs?.results ?? []).map((h) => h.piso))].sort((a, b) => a - b)

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
      <PageHeader
        subtitle={!isLoading && count !== undefined ? `${count} habitación${count !== 1 ? 'es' : ''} registrada${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Nueva habitación"
        onAction={openCreate}
      />

      <div className="rounded mb-8 bg-surface-1 border border-border">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-stone-text">
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
              <span className="text-sm shrink-0 text-stone-text">
                {count} resultado{count !== 1 ? 's' : ''}
              </span>
            )}
            {hayFiltros && (
              <button
                onClick={() => { setSearch(''); setEstado(''); setPiso('') }}
                className="flex items-center gap-1.5 text-sm font-medium cursor-pointer transition-colors shrink-0 text-stone-text"
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
        </div>
        <div className="h-px bg-border" />
        <div className="flex items-center gap-1 flex-wrap px-4 py-2.5">
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
            <Button onClick={openCreate} className="px-5">+ Nueva habitación</Button>
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar habitación' : 'Nueva habitación'}>
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
