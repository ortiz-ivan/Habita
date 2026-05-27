import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PagoForm from '../components/pagos/PagoForm'
import { PaymentStatusBadge } from '../components/ui/PaymentStatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { useDebounce } from '../hooks/useDebounce'

const accentBorder = {
  pagado:   'border-l-4 border-l-green-400',
  pendiente:'border-l-4 border-l-amber-400',
  vencido:  'border-l-4 border-l-red-400',
  parcial:  'border-l-4 border-l-blue-400',
}

const metodoBadge = {
  efectivo:      'bg-stone-100 text-stone-600',
  transferencia: 'bg-purple-100 text-purple-600',
  tarjeta:       'bg-indigo-100 text-indigo-600',
  qr:            'bg-teal-100 text-teal-600',
}

const inp = 'border border-stone-200 rounded-lg px-3 py-2 text-sm bg-stone-50 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#D85A30] text-stone-700 transition-colors'

const IconPago = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
  </svg>
)

function PagoCard({ p, onEdit, onView }) {
  const accent = accentBorder[p.estado] ?? ''
  return (
    <div className={`bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow ${accent}`}>
      <div className="flex items-center justify-between px-4 py-3 bg-stone-50 border-b border-stone-100">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          Hab. {p.contrato.habitacion_numero}
        </span>
        <PaymentStatusBadge status={p.estado} />
      </div>

      <div className="px-5 py-5 flex-1 space-y-3 text-sm">
        <p className="font-medium text-stone-800 truncate">{p.contrato.inquilino_nombre}</p>
        <div className="flex justify-between">
          <span className="text-stone-400">Monto</span>
          <span className="text-stone-700 font-medium">{formatGs(p.monto)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Fecha</span>
          <span className="text-stone-700">{p.fecha_pago}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-stone-400">Método</span>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${metodoBadge[p.metodo_pago] ?? 'bg-stone-100 text-stone-600'}`}>
            {p.metodo_pago}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 border-t border-stone-100 flex gap-2">
        <button
          onClick={() => onView(p)}
          className="flex-1 text-sm py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(p)}
          className="flex-1 text-sm py-2 rounded-lg border text-white transition-colors"
          style={{ backgroundColor: '#D85A30', borderColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
        >
          Editar
        </button>
      </div>
    </div>
  )
}

function PagoDetail({ p, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-stone-50 rounded-lg px-3 py-2 col-span-2">
          <p className="text-xs text-stone-400 mb-0.5">Inquilino</p>
          <p className="font-medium text-stone-800">{p.contrato.inquilino_nombre}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Habitación</p>
          <p className="font-medium text-stone-800">{p.contrato.habitacion_numero}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Estado</p>
          <PaymentStatusBadge status={p.estado} />
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Monto</p>
          <p className="font-medium text-stone-800">{formatGs(p.monto)}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2">
          <p className="text-xs text-stone-400 mb-0.5">Fecha de pago</p>
          <p className="font-medium text-stone-800">{p.fecha_pago}</p>
        </div>
        <div className="bg-stone-50 rounded-lg px-3 py-2 col-span-2">
          <p className="text-xs text-stone-400 mb-0.5">Método de pago</p>
          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium capitalize ${metodoBadge[p.metodo_pago] ?? 'bg-stone-100 text-stone-600'}`}>
            {p.metodo_pago}
          </span>
        </div>
      </div>

      {p.observacion && (
        <div className="bg-stone-50 rounded-lg px-3 py-2 text-sm">
          <p className="text-xs text-stone-400 mb-0.5">Observación</p>
          <p className="text-stone-700">{p.observacion}</p>
        </div>
      )}

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

export default function PagosPage() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen]       = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [viewTarget, setViewTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [apiError, setApiError]         = useState('')

  const [search, setSearch]         = useState('')
  const [estado, setEstado]         = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const debouncedSearch             = useDebounce(search)

  const filters = {
    search:      debouncedSearch || undefined,
    estado:      estado          || undefined,
    metodo_pago: metodoPago      || undefined,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['pagos', filters],
    queryFn:  () => api.get('/api/pagos/', { params: filters }).then((r) => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['pagos'] })
    qc.invalidateQueries({ queryKey: ['pagos-pendientes'] })
    qc.invalidateQueries({ queryKey: ['pagos-vencidos'] })
  }

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/pagos/', data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.patch(`/api/pagos/${id}/`, data),
    onSuccess: () => { invalidate(); setModalOpen(false) },
    onError: (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/pagos/${id}/`),
    onSuccess: () => { invalidate(); setDeleteTarget(null); setViewTarget(null) },
    onError: (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => { setEditTarget(null); setApiError(''); setModalOpen(true) }
  const openEdit   = (p) => { setEditTarget(p);   setApiError(''); setViewTarget(null); setModalOpen(true) }

  const handleSubmit = (data) => {
    setApiError('')
    if (editTarget) updateMutation.mutate({ id: editTarget.id, data })
    else            createMutation.mutate(data)
  }

  const isSaving    = createMutation.isPending || updateMutation.isPending
  const hayFiltros  = search || estado || metodoPago

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-medium text-stone-800">Pagos</h2>
        <button
          onClick={openCreate}
          className="text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: '#D85A30' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c04e27'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D85A30'}
        >
          + Registrar pago
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
            placeholder="Buscar por nombre del inquilino..."
            className={`${inp} pl-9 w-64`}
          />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inp}>
          <option value="">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="parcial">Parcial</option>
          <option value="vencido">Vencido</option>
        </select>
        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={inp}>
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="qr">QR</option>
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setSearch(''); setEstado(''); setMetodoPago('') }}
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
          icon={<IconPago />}
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay pagos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Registrá el primer pago para empezar'}
          action={!hayFiltros && (
            <button
              onClick={openCreate}
              className="text-sm font-medium px-4 py-2 rounded-lg text-white transition-colors"
              style={{ backgroundColor: '#D85A30' }}
            >
              + Registrar pago
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar pago' : 'Registrar pago'}
        size="lg"
      >
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
