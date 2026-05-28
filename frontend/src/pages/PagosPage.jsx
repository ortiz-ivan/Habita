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
import { Chip } from '../components/ui/Chip'
import { queryKeys } from '../lib/queryKeys'

const estadoConfig = {
  pagado:    { label: 'Pagado',    dot: '#7dc947', bg: '#0a1f00', text: '#7dc947' },
  pendiente: { label: 'Pendiente', dot: '#FAC775', bg: '#2a1400', text: '#FAC775' },
  vencido:   { label: 'Vencido',   dot: '#f87171', bg: '#1f0000', text: '#f87171' },
  parcial:   { label: 'Parcial',   dot: '#FAC775', bg: '#2a1400', text: '#FAC775' },
}

const estadoPills = [
  { id: '', label: 'Todos' },
  ...Object.entries(estadoConfig).map(([id, cfg]) => ({ id, ...cfg })),
]

const periodoPills = [
  { id: '',              label: 'Todo el tiempo' },
  { id: 'este_mes',     label: 'Este mes'        },
  { id: 'mes_anterior', label: 'Mes anterior'    },
  { id: 'este_anio',    label: 'Este año'        },
]

function getPeriodoFechas(periodo) {
  const now = new Date()
  const y   = now.getFullYear()
  const m   = now.getMonth()
  const fmt = (d) => d.toISOString().split('T')[0]
  if (periodo === 'este_mes')     return { fecha_desde: fmt(new Date(y, m, 1)),     fecha_hasta: fmt(new Date(y, m + 1, 0)) }
  if (periodo === 'mes_anterior') return { fecha_desde: fmt(new Date(y, m - 1, 1)), fecha_hasta: fmt(new Date(y, m, 0))     }
  if (periodo === 'este_anio')    return { fecha_desde: `${y}-01-01`,               fecha_hasta: `${y}-12-31`               }
  return {}
}

const metodoStyle = {
  efectivo:      { bg: '#1a1a1a', text: '#888884' },
  transferencia: { bg: '#1a1a1a', text: '#888884' },
  tarjeta:       { bg: '#2a1400', text: '#FAC775' },
  qr:            { bg: '#1a1a1a', text: '#888884' },
}

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

function PagoCard({ p, onEdit, onView }) {
  const cfg = estadoConfig[p.estado] ?? { label: p.estado, dot: '#888884', bg: '#1a1a1a', text: '#888884' }
  const met = metodoStyle[p.metodo_pago] ?? metodoStyle.efectivo

  return (
    <div
      className="rounded overflow-hidden flex flex-col cursor-default"
      style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', transition: 'transform 200ms ease, box-shadow 200ms ease' }}
      {...cardHover}
    >
      <div style={{ height: '3px', backgroundColor: cfg.dot }} />

      <div className="px-5 pt-4 pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
            style={{ backgroundColor: cfg.bg, color: cfg.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
            {cfg.label}
          </span>
          <span className="text-xs font-bold shrink-0" style={{ color: '#888884' }}>Hab. {p.contrato.habitacion_numero}</span>
        </div>
        <p className="text-base font-bold leading-snug" style={{ color: '#f0f0f0' }}>
          {p.contrato.inquilino_nombre}
        </p>
      </div>

      <div className="mx-5" style={{ height: '1px', backgroundColor: '#1f1f1f' }} />

      <div className="px-4 py-4 flex-1">
        <div className="space-y-2">
          <div className="rounded px-3 py-3" style={{ backgroundColor: '#1a1a1a' }}>
            <p className="text-[10px] font-medium uppercase tracking-wide mb-0.5" style={{ color: '#888884' }}>Monto</p>
            <p className="text-lg font-bold" style={{ color: '#f0f0f0' }}>{formatGs(p.monto)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
              <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Fecha</p>
              <p className="text-sm font-semibold" style={{ color: '#e5e5e5' }}>{p.fecha_pago}</p>
            </div>
            <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
              <p className="text-[10px] font-medium uppercase tracking-wide mb-1" style={{ color: '#888884' }}>Método</p>
              <span
                className="px-2 py-0.5 rounded-lg text-xs font-semibold capitalize"
                style={{ backgroundColor: met.bg, color: met.text }}
              >
                {p.metodo_pago}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 flex gap-2">
        <button
          onClick={() => onView(p)}
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
          onClick={() => onEdit(p)}
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

function PagoDetail({ p, onEdit, onDelete }) {
  const met = metodoStyle[p.metodo_pago] ?? metodoStyle.efectivo
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded px-3 py-2.5 col-span-2" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>Inquilino</p>
          <p className="font-bold" style={{ color: '#f0f0f0' }}>{p.contrato.inquilino_nombre}</p>
        </div>
        <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>Habitación</p>
          <p className="font-semibold" style={{ color: '#f0f0f0' }}>{p.contrato.habitacion_numero}</p>
        </div>
        <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>Estado</p>
          <PaymentStatusBadge status={p.estado} />
        </div>
        <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>Monto</p>
          <p className="font-bold" style={{ color: '#f0f0f0' }}>{formatGs(p.monto)}</p>
        </div>
        <div className="rounded px-3 py-2.5" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>Fecha</p>
          <p className="font-semibold" style={{ color: '#f0f0f0' }}>{p.fecha_pago}</p>
        </div>
        <div className="rounded px-3 py-2.5 col-span-2" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-1" style={{ color: '#888884' }}>Método</p>
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold capitalize" style={{ backgroundColor: met.bg, color: met.text }}>
            {p.metodo_pago}
          </span>
        </div>
      </div>

      {p.observacion && (
        <div className="rounded px-3 py-2.5 text-sm" style={{ backgroundColor: '#1a1a1a' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#888884' }}>Observación</p>
          <p style={{ color: '#e5e5e5' }}>{p.observacion}</p>
        </div>
      )}

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

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.pagos.list(filters),
    queryFn:  () => api.get('/api/pagos/', { params: filters }).then((r) => r.data),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: queryKeys.pagos.all() })
    qc.invalidateQueries({ queryKey: queryKeys.pagos.pendientes() })
    qc.invalidateQueries({ queryKey: queryKeys.pagos.vencidos() })
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

  const metodoLabel  = { efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta', qr: 'QR' }
  const periodoLabel = { este_mes: 'Este mes', mes_anterior: 'Mes anterior', este_anio: 'Este año' }

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
              <span className="text-sm shrink-0" style={{ color: '#888884' }}>
                {count} resultado{count !== 1 ? 's' : ''}
              </span>
            )}
            {hayFiltros && (
              <button
                onClick={() => { setSearch(''); setEstado(''); setMetodoPago(''); setPeriodo('') }}
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
        <div style={{ height: '1px', backgroundColor: '#1f1f1f' }} />
        <div className="flex items-center gap-1 flex-wrap px-4 py-2.5">
          {estadoPills.map((pill) => {
            const isActive = estado === pill.id
            const activeStyle = pill.id === ''
              ? { backgroundColor: '#D85A30', color: '#FFFFFF' }
              : { backgroundColor: pill.bg, color: pill.text }
            return (
              <button
                key={pill.id}
                onClick={() => setEstado(pill.id)}
                className="flex items-center gap-1.5 text-[12px] px-3 py-[5px] rounded-full font-medium transition-colors cursor-pointer"
                style={isActive ? activeStyle : { color: '#888884', backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1a1a1a' }}
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

          <div className="w-px h-4 mx-1.5 shrink-0" style={{ backgroundColor: '#2a2a2a' }} />

          {periodoPills.map((pill) => {
            const isActive = periodo === pill.id
            return (
              <button
                key={pill.id}
                onClick={() => setPeriodo(pill.id)}
                className="flex items-center gap-1.5 text-[12px] px-3 py-[5px] rounded-full font-medium transition-colors cursor-pointer"
                style={isActive
                  ? (pill.id === '' ? { backgroundColor: '#D85A30', color: '#FFFFFF' } : { backgroundColor: '#2a1200', color: '#D85A30' })
                  : { color: '#888884', backgroundColor: 'transparent' }
                }
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#1a1a1a' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {pill.label}
              </button>
            )
          })}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          }
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay pagos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Registrá el primer pago para empezar'}
          action={!hayFiltros && (
            <button
              onClick={openCreate}
              className="text-sm font-semibold px-5 py-2.5 rounded text-white cursor-pointer"
              style={{ backgroundColor: '#D85A30' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#C04E27' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#D85A30' }}
            >
              + Registrar pago
            </button>
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
