import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { parseApiError } from '../utils/format'
import { avatarColor } from '../utils/avatar'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InquilinoForm from '../components/inquilinos/InquilinoForm'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'

const inpFilter = 'border border-[#2a2a2a] rounded px-3 py-2 text-sm bg-[#111111] focus:outline-none focus:ring-2 focus:ring-[#D85A30] text-[#e5e5e5] transition-all'

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

function Avatar({ nombre, apellido, size = 'md' }) {
  const { bg, text } = avatarColor(`${apellido ?? ''}${nombre ?? ''}`)
  const letters = `${apellido?.[0] ?? ''}${nombre?.[0] ?? ''}`.toUpperCase()
  const cls = size === 'lg'
    ? 'w-12 h-12 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0'
    : 'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'
  return (
    <div className={cls} style={{ backgroundColor: bg, color: text }}>{letters}</div>
  )
}

function InquilinoCard({ i, onEdit, onView }) {
  return (
    <div
      className="rounded overflow-hidden flex flex-col cursor-default"
      style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#1a1a1a' }}>
        <div className="flex items-center gap-3">
          <Avatar nombre={i.nombre} apellido={i.apellido} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="font-bold text-base leading-snug" style={{ color: '#f0f0f0' }}>
              {i.apellido}, {i.nombre}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: '#888884' }}>{i.email}</p>
          </div>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#1f1f1f' }} />

      <div className="px-4 py-4 flex-1">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Documento</p>
            <p className="text-sm font-bold" style={{ color: '#f0f0f0' }}>{i.documento}</p>
          </div>
          <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Teléfono</p>
            <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{i.telefono || '—'}</p>
          </div>
          <div className="col-span-2 rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Fecha de ingreso</p>
            <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{i.fecha_ingreso}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2">
        <button
          onClick={() => onView(i)}
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
          onClick={() => onEdit(i)}
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

function InquilinoDetail({ i, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <Avatar nombre={i.nombre} apellido={i.apellido} size="lg" />
        <div>
          <p className="font-bold" style={{ color: '#f0f0f0' }}>{i.apellido}, {i.nombre}</p>
          <p className="text-sm" style={{ color: '#888884' }}>{i.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'Documento',    value: i.documento },
          { label: 'Teléfono',     value: i.telefono || '—' },
          { label: 'Fecha ingreso', value: i.fecha_ingreso },
          { label: 'C. emergencia', value: i.contacto_emergencia || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>{label}</p>
            <p className="font-semibold" style={{ color: '#f0f0f0' }}>{value}</p>
          </div>
        ))}
      </div>

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

export default function InquilinosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch] = useState('')
  const debouncedSearch     = useDebounce(search)

  const filters = { search: debouncedSearch || undefined }

  const { data, isLoading } = useQuery({
    queryKey: ['inquilinos', filters],
    queryFn:  () => api.get('/api/inquilinos/', { params: filters }).then((r) => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['inquilinos'] })

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/inquilinos/', data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/inquilinos/${id}/`, data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/inquilinos/${id}/`),
    onSuccess: () => { invalidate(); setDeleteTarget(null); setViewTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
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
      <PageHeader
        subtitle={!isLoading && count !== undefined ? `${count} inquilino${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Nuevo inquilino"
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
              placeholder="Buscar por nombre, apellido, documento o email..."
              className={`${inpFilter} pl-9 w-80`}
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            {!isLoading && count !== undefined && (
              <span className="text-sm shrink-0" style={{ color: '#888884' }}>
                {count} resultado{count !== 1 ? 's' : ''}
              </span>
            )}
            {search && (
              <button
                onClick={() => setSearch('')}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          title={search ? 'Sin resultados para esa búsqueda' : 'No hay inquilinos registrados'}
          description={search ? 'Probá con otro nombre o documento' : 'Agregá el primer inquilino para empezar'}
          action={!search && (
            <button
              onClick={openCreate}
              className="text-sm font-semibold px-5 py-2.5 rounded text-white cursor-pointer"
              style={{ backgroundColor: '#D85A30' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
            >
              + Nuevo inquilino
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.results.map((i) => (
            <InquilinoCard key={i.id} i={i} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`${viewTarget?.apellido}, ${viewTarget?.nombre}`}>
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
