import { useState } from 'react'
import { parseApiError } from '../utils/format'
import { Button } from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PagoForm from '../components/pagos/PagoForm'
import { PagoCard } from '../components/pagos/PagoCard'
import { PagoDetail } from '../components/pagos/PagoDetail'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'
import { usePagosList, useCreatePago, useUpdatePago, useDeletePago } from '../hooks/queries/usePagos'
import { estadoConfig, estadoPills, periodoPills, metodoLabel, periodoLabel, getPeriodoFechas } from '../lib/constants/pagos'

const inpFilter = 'border border-border-strong rounded px-3 py-2 text-sm bg-surface-1 focus:outline-none focus:ring-2 focus:ring-brand text-stone-dark transition-all'

export default function PagosPage() {
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch]         = useState('')
  const [estado, setEstado]         = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [periodo, setPeriodo]       = useState('')
  const debouncedSearch             = useDebounce(search)

  const periodoDates = getPeriodoFechas(periodo)
  const filters = {
    search:      debouncedSearch          || undefined,
    estado:      estado                   || undefined,
    metodo_pago: metodoPago               || undefined,
    fecha_desde: periodoDates.fecha_desde || undefined,
    fecha_hasta: periodoDates.fecha_hasta || undefined,
  }

  const { data, isLoading } = usePagosList(filters)

  const createMutation = useCreatePago({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useUpdatePago({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useDeletePago({
    onSuccess: () => { setDeleteTarget(null); setViewTarget(null) },
    onError:   (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (p) => { setEditTarget(p);   setApiError(''); setViewTarget(null); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving   = createMutation.isPending || updateMutation.isPending
  const hayFiltros = search || estado || metodoPago || periodo
  const count      = data?.count
  const activeChips = [
    search     && { key: 'search',     isSearch: true, label: `"${search}"`,                                                              onRemove: () => setSearch('') },
    estado     && { key: 'estado',     dot: estadoConfig[estado]?.dot, color: estadoConfig[estado]?.text, label: estadoConfig[estado]?.label, onRemove: () => setEstado('') },
    metodoPago && { key: 'metodoPago', label: metodoLabel[metodoPago]  ?? metodoPago,                                                     onRemove: () => setMetodoPago('') },
    periodo    && { key: 'periodo',    label: periodoLabel[periodo]    ?? periodo,                                                         onRemove: () => setPeriodo('') },
  ].filter(Boolean)

  return (
    <div>
      <PageHeader
        subtitle={!isLoading && count !== undefined ? `${count} pago${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Registrar pago"
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
              placeholder="Buscar por nombre del inquilino..."
              className={`${inpFilter} pl-9 w-64`}
            />
          </div>
          <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={inpFilter}>
            <option value="">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="qr">QR</option>
          </select>
          <div className="ml-auto flex items-center gap-4">
            {!isLoading && count !== undefined && (
              <span className="text-sm shrink-0 text-stone-text">
                {count} resultado{count !== 1 ? 's' : ''}
              </span>
            )}
            {hayFiltros && (
              <button
                onClick={() => { setSearch(''); setEstado(''); setMetodoPago(''); setPeriodo('') }}
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

          <div className="w-px h-4 mx-1.5 shrink-0 bg-border-strong" />

          {periodoPills.map((pill) => {
            const isActive = periodo === pill.id
            return (
              <button
                key={pill.id}
                onClick={() => setPeriodo(pill.id)}
                className="flex items-center gap-1.5 text-[12px] px-3 py-[5px] rounded-full font-medium transition-colors cursor-pointer"
                style={isActive
                  ? (pill.id === '' ? { backgroundColor: 'var(--color-brand)', color: '#FFFFFF' } : { backgroundColor: '#2a1200', color: 'var(--color-brand)' })
                  : { color: 'var(--color-stone-text)', backgroundColor: 'transparent' }
                }
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface-2)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay pagos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Registrá el primer pago para empezar'}
          action={!hayFiltros && (
            <Button onClick={openCreate} className="px-5">+ Registrar pago</Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar pago' : 'Registrar pago'} size="lg">
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
