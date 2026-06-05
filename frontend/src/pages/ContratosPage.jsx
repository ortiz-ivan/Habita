import { useState } from 'react'
import { parseApiError } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import ContratoForm from '../components/contratos/ContratoForm'
import { ContratoCard } from '../components/contratos/ContratoCard'
import { ContratoDetail } from '../components/contratos/ContratoDetail'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'
import { useContratosList, useContratosSummary, useCreateContrato, useUpdateContrato, useDeleteContrato } from '../hooks/queries/useContratos'
import { estadoConfig, estadoPills } from '../lib/constants/contratos'

const inpFilter = 'border border-border-strong rounded px-3 py-2 text-sm bg-surface-1 focus:outline-none focus:ring-2 focus:ring-brand text-stone-dark transition-all'

function KpiCard({ label, value, dot, color, isLoading, onClick, active }) {
  const base    = { backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }
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

export default function ContratosPage() {
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

  const { data, isLoading }                          = useContratosList(filters)
  const { data: allContratos, isLoading: kpiLoading } = useContratosSummary()
  const allResults = allContratos?.results ?? []
  const kpis = {
    total:      allResults.length,
    activo:     allResults.filter(c => c.estado === 'activo').length,
    moroso:     allResults.filter(c => c.estado === 'moroso').length,
    finalizado: allResults.filter(c => c.estado === 'finalizado').length,
    cancelado:  allResults.filter(c => c.estado === 'cancelado').length,
  }

  const createMutation = useCreateContrato({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useUpdateContrato({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useDeleteContrato({
    onSuccess: () => { setDeleteTarget(null); setViewTarget(null) },
    onError:   (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
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
  const activeChips = [
    search && { key: 'search', isSearch: true, label: `"${search}"`,                                                  onRemove: () => setSearch('') },
    estado && { key: 'estado', dot: estadoConfig[estado]?.dot, color: estadoConfig[estado]?.text, label: estadoConfig[estado]?.label, onRemove: () => setEstado('') },
  ].filter(Boolean)

  return (
    <div>
      <PageHeader actionLabel="Nuevo contrato" onAction={openCreate} />

      {/* Mini KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Total"      value={kpis.total}      isLoading={kpiLoading} />
        <KpiCard label="Activos"    value={kpis.activo}     dot={estadoConfig.activo.dot}     color={estadoConfig.activo}     isLoading={kpiLoading} onClick={() => setEstado(estado === 'activo'     ? '' : 'activo')}     active={estado === 'activo'} />
        <KpiCard label="Morosos"    value={kpis.moroso}     dot={estadoConfig.moroso.dot}     color={estadoConfig.moroso}     isLoading={kpiLoading} onClick={() => setEstado(estado === 'moroso'     ? '' : 'moroso')}     active={estado === 'moroso'} />
        <KpiCard label="Finalizados" value={kpis.finalizado} dot={estadoConfig.finalizado.dot} color={estadoConfig.finalizado} isLoading={kpiLoading} onClick={() => setEstado(estado === 'finalizado' ? '' : 'finalizado')} active={estado === 'finalizado'} />
        <KpiCard label="Cancelados" value={kpis.cancelado}  dot={estadoConfig.cancelado.dot}  color={estadoConfig.cancelado}  isLoading={kpiLoading} onClick={() => setEstado(estado === 'cancelado'  ? '' : 'cancelado')}  active={estado === 'cancelado'} />
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
              placeholder="Buscar por inquilino o habitación..."
              className={`${inpFilter} pl-9 w-full`}
            />
          </div>

          <div className="w-px h-5 self-center shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />

          {!isLoading && count !== undefined && (
            <span className="text-[13px] shrink-0" style={{ color: 'var(--color-stone-text)' }}>
              {count} resultado{count !== 1 ? 's' : ''}
            </span>
          )}

          {hayFiltros && (
            <button
              onClick={() => { setSearch(''); setEstado('') }}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
          }
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay contratos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Creá el primer contrato para empezar'}
          action={!hayFiltros && (
            <Button onClick={openCreate} className="px-5">+ Nuevo contrato</Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {data.results.map((c) => (
            <ContratoCard key={c.id} c={c} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Contrato #${viewTarget?.id}`} size="lg">
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
          onCancel={() => setModalOpen(false)}
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
