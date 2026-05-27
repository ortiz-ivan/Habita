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
      className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="flex items-center gap-3">
          <Avatar nombre={i.nombre} apellido={i.apellido} size="lg" />
          <div className="min-w-0">
            <p className="font-bold text-base leading-tight truncate" style={{ color: '#1C1917' }}>
              {i.apellido}, {i.nombre}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: '#5F5E5A' }}>{i.email}</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex-1 space-y-2.5 text-sm">
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Documento</span>
          <span className="font-semibold" style={{ color: '#1C1917' }}>{i.documento}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Teléfono</span>
          <span style={{ color: '#444441' }}>{i.telefono || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Ingreso</span>
          <span style={{ color: '#444441' }}>{i.fecha_ingreso}</span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex gap-2">
        <button
          onClick={() => onView(i)}
          className="flex-1 text-sm font-medium py-2 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1.5px solid #E0D8CC', color: '#5F5E5A', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8'; e.currentTarget.style.color = '#1C1917' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(i)}
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

function InquilinoDetail({ i, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 pb-2">
        <Avatar nombre={i.nombre} apellido={i.apellido} size="lg" />
        <div>
          <p className="font-bold" style={{ color: '#1C1917' }}>{i.apellido}, {i.nombre}</p>
          <p className="text-sm" style={{ color: '#5F5E5A' }}>{i.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {[
          { label: 'Documento',    value: i.documento },
          { label: 'Teléfono',     value: i.telefono || '—' },
          { label: 'Fecha ingreso', value: i.fecha_ingreso },
          { label: 'C. emergencia', value: i.contacto_emergencia || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F5F0E8' }}>
            <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>{label}</p>
            <p className="font-semibold" style={{ color: '#1C1917' }}>{value}</p>
          </div>
        ))}
      </div>

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

  const isSaving = createMutation.isPending || updateMutation.isPending
  const count    = data?.count

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Inquilinos"
        subtitle={!isLoading && count !== undefined ? `${count} inquilino${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Nuevo inquilino"
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
            placeholder="Buscar por nombre, apellido, documento o email..."
            className={`${inpFilter} pl-9 w-80`}
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
            </svg>
          }
          title={search ? 'Sin resultados para esa búsqueda' : 'No hay inquilinos registrados'}
          description={search ? 'Probá con otro nombre o documento' : 'Agregá el primer inquilino para empezar'}
          action={!search && (
            <button
              onClick={openCreate}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: '#D85A30' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
            >
              + Nuevo inquilino
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
