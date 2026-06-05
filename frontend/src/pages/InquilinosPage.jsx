import { useState } from 'react'
import { parseApiError } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import InquilinoForm from '../components/inquilinos/InquilinoForm'
import { InquilinoCard } from '../components/inquilinos/InquilinoCard'
import { InquilinoDetail } from '../components/inquilinos/InquilinoDetail'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'
import { useInquilinosList, useInquilinosSummary, useCreateInquilino, useUpdateInquilino, useDeleteInquilino } from '../hooks/queries/useInquilinos'

const inpFilter = 'border border-border-strong rounded px-3 py-2 text-sm bg-surface-1 focus:outline-none focus:ring-2 focus:ring-brand text-stone-dark transition-all'

export default function InquilinosPage() {
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch] = useState('')
  const debouncedSearch     = useDebounce(search)

  const filters = { search: debouncedSearch || undefined }

  const { data, isLoading }                              = useInquilinosList(filters)
  const { data: allInquilinos, isLoading: kpiLoading }   = useInquilinosSummary()
  const totalInquilinos = allInquilinos?.results?.length ?? 0

  const createMutation = useCreateInquilino({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useUpdateInquilino({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useDeleteInquilino({
    onSuccess: () => { setDeleteTarget(null); setViewTarget(null) },
    onError:   (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (i) => { setEditTarget(i);   setApiError(''); setViewTarget(null); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving    = createMutation.isPending || updateMutation.isPending
  const count       = data?.count
  const activeChips = [
    search && { key: 'search', isSearch: true, label: `"${search}"`, onRemove: () => setSearch('') },
  ].filter(Boolean)

  return (
    <div>
      <PageHeader actionLabel="Nuevo inquilino" onAction={openCreate} />

      {/* Mini KPIs */}
      <div className="grid grid-cols-1 gap-3 mb-6 max-w-[200px]">
        <div className="rounded border px-4 py-3 select-none" style={{ backgroundColor: 'var(--color-surface-1)', borderColor: 'var(--color-border)' }}>
          <p className="text-[11px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-stone-text)' }}>Total</p>
          {kpiLoading
            ? <div className="h-7 w-8 rounded animate-pulse" style={{ backgroundColor: 'var(--color-border-strong)' }} />
            : <p className="text-[26px] font-bold leading-none tracking-tight" style={{ color: 'var(--color-fg)' }}>{totalInquilinos}</p>
          }
        </div>
      </div>

      <div className="rounded mb-8 bg-surface-1 border border-border">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <div className="relative flex-1 min-w-[350px] max-w-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-stone-text">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, apellido, documento o email..."
              className={`${inpFilter} pl-9 w-full`}
            />
          </div>

          <div className="w-px h-5 self-center shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />

          {!isLoading && count !== undefined && (
            <span className="text-[13px] shrink-0" style={{ color: 'var(--color-stone-text)' }}>
              {count} resultado{count !== 1 ? 's' : ''}
            </span>
          )}

          {search && (
            <button
              onClick={() => setSearch('')}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          title={search ? 'Sin resultados para esa búsqueda' : 'No hay inquilinos registrados'}
          description={search ? 'Probá con otro nombre o documento' : 'Agregá el primer inquilino para empezar'}
          action={!search && (
            <Button onClick={openCreate} className="px-5">+ Nuevo inquilino</Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {data.results.map((i) => (
            <InquilinoCard key={i.id} i={i} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`${viewTarget?.apellido}, ${viewTarget?.nombre}`} size="lg">
        {viewTarget && (
          <InquilinoDetail
            i={viewTarget}
            onEdit={() => openEdit(viewTarget)}
            onDelete={() => setDeleteTarget(viewTarget)}
          />
        )}
      </Modal>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Editar inquilino' : 'Nuevo inquilino'}>
        <InquilinoForm
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
        message={`¿Eliminás a ${deleteTarget?.nombre} ${deleteTarget?.apellido}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
