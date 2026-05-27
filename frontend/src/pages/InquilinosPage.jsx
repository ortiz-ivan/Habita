import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InquilinoForm from '../components/inquilinos/InquilinoForm'
import { EmptyState } from '../components/ui/EmptyState'
import { useDebounce } from '../hooks/useDebounce'

const inp = 'border border-stone-200 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D85A30] text-stone-700 transition-colors'

function Initials({ nombre, apellido }) {
  const text = `${apellido?.[0] ?? ''}${nombre?.[0] ?? ''}`.toUpperCase()
  return (
    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-sm font-medium flex-shrink-0">
      {text}
    </div>
  )
}

function InquilinoCard({ i, onEdit, onView }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
      <div className="px-4 py-4 flex items-center gap-3 border-b border-stone-100">
        <Initials nombre={i.nombre} apellido={i.apellido} />
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate">
            {i.apellido}, {i.nombre}
          </p>
          <p className="text-xs text-stone-400 truncate">{i.email}</p>
        </div>
      </div>

      <div className="px-5 py-4 flex-1 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-400">Documento</span>
          <span className="text-stone-700 font-medium">{i.documento}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Teléfono</span>
          <span className="text-stone-700">{i.telefono || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Ingreso</span>
          <span className="text-stone-700">{i.fecha_ingreso}</span>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-stone-100 flex gap-2">
        <button
          onClick={() => onView(i)}
          className="flex-1 text-sm py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(i)}
          className="flex-1 text-sm py-2 rounded-lg text-white transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
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
        <Initials nombre={i.nombre} apellido={i.apellido} />
        <div>
          <p className="font-medium text-stone-800">{i.apellido}, {i.nombre}</p>
          <p className="text-sm text-stone-400">{i.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Documento</p>
          <p className="font-medium text-stone-800">{i.documento}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Teléfono</p>
          <p className="font-medium text-stone-800">{i.telefono || '—'}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Fecha de ingreso</p>
          <p className="font-medium text-stone-800">{i.fecha_ingreso}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Contacto de emergencia</p>
          <p className="font-medium text-stone-800">{i.contacto_emergencia || '—'}</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={onEdit}
          className="flex-1 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium py-2 rounded-lg transition-colors"
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-stone-800">Inquilinos</h2>
        <button
          onClick={openCreate}
          className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
        >
          + Nuevo inquilino
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm px-4 py-3 mb-8 flex flex-wrap items-center gap-3">
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, apellido, documento o email..."
            className={`${inp} pl-9 w-80`}
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch('')}
            className="ml-auto flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#D85A30] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Limpiar filtros
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-stone-400">Cargando...</p>
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
            <button onClick={openCreate} className="text-sm font-medium px-4 py-2 rounded-lg text-white" style={{ backgroundColor: '#D85A30' }}>
              + Nuevo inquilino
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.results.map((i) => (
            <InquilinoCard key={i.id} i={i} onEdit={openEdit} onView={setViewTarget} />
          ))}
        </div>
      )}

      <Modal
        isOpen={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={`${viewTarget?.apellido}, ${viewTarget?.nombre}`}
      >
        {viewTarget && (
          <InquilinoDetail
            i={viewTarget}
            onEdit={() => openEdit(viewTarget)}
            onDelete={() => setDeleteTarget(viewTarget)}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar inquilino' : 'Nuevo inquilino'}
      >
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
