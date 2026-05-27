import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import { formatGs, parseApiError } from '../utils/format'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import PagoForm from '../components/pagos/PagoForm'
import { PaymentStatusBadge } from '../components/ui/PaymentStatusBadge'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'

const estadoConfig = {
  pagado:    { label: 'Pagado',    dot: '#3B6D11', bg: '#EAF3DE', text: '#3B6D11' },
  pendiente: { label: 'Pendiente', dot: '#FAC775', bg: '#FAEEDA', text: '#633806' },
  vencido:   { label: 'Vencido',   dot: '#A32D2D', bg: '#FCEBEB', text: '#A32D2D' },
  parcial:   { label: 'Parcial',   dot: '#FAC775', bg: '#FAEEDA', text: '#633806' },
}

const metodoStyle = {
  efectivo:      { bg: '#F5F0E8', text: '#5F5E5A' },
  transferencia: { bg: '#F5F0E8', text: '#5F5E5A' },
  tarjeta:       { bg: '#FAEEDA', text: '#633806' },
  qr:            { bg: '#F5F0E8', text: '#5F5E5A' },
}

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

function PagoCard({ p, onEdit, onView }) {
  const cfg = estadoConfig[p.estado] ?? { label: p.estado, dot: '#5F5E5A', bg: '#F5F0E8', text: '#5F5E5A' }
  const met = metodoStyle[p.metodo_pago] ?? metodoStyle.efectivo

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-default"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div className="px-5 pt-5 pb-4" style={{ backgroundColor: cfg.bg }}>
        <div className="flex items-start justify-between mb-2">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.75)', color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
          <span className="text-xs font-bold" style={{ color: cfg.text }}>Hab. {p.contrato.habitacion_numero}</span>
        </div>
        <p className="text-base font-bold leading-tight truncate" style={{ color: cfg.text }}>
          {p.contrato.inquilino_nombre}
        </p>
      </div>

      <div className="px-5 py-4 flex-1 space-y-2.5 text-sm">
        <div className="flex justify-between items-baseline">
          <span style={{ color: '#5F5E5A' }}>Monto</span>
          <span className="text-base font-bold" style={{ color: '#1C1917' }}>{formatGs(p.monto)}</span>
        </div>
        <div className="flex justify-between">
          <span style={{ color: '#5F5E5A' }}>Fecha</span>
          <span style={{ color: '#444441' }}>{p.fecha_pago}</span>
        </div>
        <div className="flex justify-between items-center">
          <span style={{ color: '#5F5E5A' }}>Método</span>
          <span
            className="px-2 py-0.5 rounded-lg text-xs font-semibold capitalize"
            style={{ backgroundColor: met.bg, color: met.text }}
          >
            {p.metodo_pago}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-1 flex gap-2">
        <button
          onClick={() => onView(p)}
          className="flex-1 text-sm font-medium py-2 rounded-xl cursor-pointer transition-colors"
          style={{ border: '1.5px solid #E0D8CC', color: '#5F5E5A', backgroundColor: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F5F0E8'; e.currentTarget.style.color = '#1C1917' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#5F5E5A' }}
        >
          Ver más
        </button>
        <button
          onClick={() => onEdit(p)}
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

function PagoDetail({ p, onEdit, onDelete }) {
  const met = metodoStyle[p.metodo_pago] ?? metodoStyle.efectivo
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl px-3 py-2.5 col-span-2" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Inquilino</p>
          <p className="font-bold" style={{ color: '#1C1917' }}>{p.contrato.inquilino_nombre}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Habitación</p>
          <p className="font-semibold" style={{ color: '#1C1917' }}>{p.contrato.habitacion_numero}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Estado</p>
          <PaymentStatusBadge status={p.estado} />
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Monto</p>
          <p className="font-bold" style={{ color: '#1C1917' }}>{formatGs(p.monto)}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Fecha</p>
          <p className="font-semibold" style={{ color: '#1C1917' }}>{p.fecha_pago}</p>
        </div>
        <div className="rounded-xl px-3 py-2.5 col-span-2" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#5F5E5A' }}>Método</p>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize" style={{ backgroundColor: met.bg, color: met.text }}>
            {p.metodo_pago}
          </span>
        </div>
      </div>

      {p.observacion && (
        <div className="rounded-xl px-3 py-2.5 text-sm" style={{ backgroundColor: '#F5F0E8' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#5F5E5A' }}>Observación</p>
          <p style={{ color: '#444441' }}>{p.observacion}</p>
        </div>
      )}

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

  const isSaving   = createMutation.isPending || updateMutation.isPending
  const hayFiltros = search || estado || metodoPago
  const count      = data?.count

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Pagos"
        subtitle={!isLoading && count !== undefined ? `${count} pago${count !== 1 ? 's' : ''} registrado${count !== 1 ? 's' : ''}` : undefined}
        actionLabel="Registrar pago"
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
            placeholder="Buscar por nombre del inquilino..."
            className={`${inpFilter} pl-9 w-64`}
          />
        </div>
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={inpFilter}>
          <option value="">Todos los estados</option>
          <option value="pagado">Pagado</option>
          <option value="pendiente">Pendiente</option>
          <option value="parcial">Parcial</option>
          <option value="vencido">Vencido</option>
        </select>
        <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={inpFilter}>
          <option value="">Todos los métodos</option>
          <option value="efectivo">Efectivo</option>
          <option value="transferencia">Transferencia</option>
          <option value="tarjeta">Tarjeta</option>
          <option value="qr">QR</option>
        </select>
        {hayFiltros && (
          <button
            onClick={() => { setSearch(''); setEstado(''); setMetodoPago('') }}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay pagos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Registrá el primer pago para empezar'}
          action={!hayFiltros && (
            <button
              onClick={openCreate}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: '#D85A30' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
            >
              + Registrar pago
            </button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
