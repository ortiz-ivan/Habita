import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { PagoRead, PagoWrite } from '../types/api'
import { parseApiError } from '../utils/format'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import PagoForm from '../components/pagos/PagoForm'
import { PagoCard } from '../components/pagos/PagoCard'
import { PagoDetail } from '../components/pagos/PagoDetail'
import { EmptyState } from '../components/ui/EmptyState'
import { SkeletonGrid } from '../components/ui/Skeleton'
import { PageHeader } from '../components/ui/PageHeader'
import { useDebounce } from '../hooks/useDebounce'
import { Chip } from '../components/ui/Chip'
import { usePagosList, usePagosSummary, useCreatePago, useUpdatePago, useDeletePago } from '../hooks/queries/usePagos'
import { useContratosSelect } from '../hooks/queries/useContratos'
import { Pagination } from '../components/ui/Pagination'
import { SelectInput } from '../components/ui/ModalParts'
import { estadoConfig, estadoPills, periodoPills, metodoLabel, periodoLabel, getPeriodoFechas } from '../lib/constants/pagos'
import { pagosService } from '../services/pagosService'
import { queryKeys } from '../lib/queryKeys'

const inpFilter = 'border border-border-strong rounded-lg px-3 py-2 text-[13px] bg-surface-2 text-stone-dark placeholder:text-[#55554f] focus:outline-none focus:ring-[3px] focus:ring-brand/15 focus:border-brand transition-all'

interface KpiCardProps {
  label: string
  value?: number
  dot?: string
  color?: { bg: string; dot: string; text: string }
  isLoading?: boolean
  onClick?: () => void
  active?: boolean
}

function KpiCard({ label, value, dot, color, isLoading, onClick, active }: KpiCardProps) {
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

// Cubre tanto pagos existentes (con id) como valores parciales para el formulario
type PagoFormDefaults = Partial<Omit<PagoRead, 'contrato'> & { contrato?: number | { id: number } | null }>

export default function PagosPage() {
  const [modalOpen, setModalOpen]           = useState(false)
  const [editTarget, setEditTarget]         = useState<PagoFormDefaults | null>(null)
  const [isCobrarMode, setIsCobrarMode]     = useState(false)
  const [garantiaPagoId, setGarantiaPagoId] = useState<number | null>(null)
  const [viewTarget, setViewTarget]         = useState<PagoRead | null>(null)
  const [deleteTarget, setDeleteTarget]     = useState<PagoRead | null>(null)
  const [apiError, setApiError]             = useState('')
  const qc = useQueryClient()

  const [search, setSearch]         = useState('')
  const [estado, setEstado]         = useState('')
  const [metodoPago, setMetodoPago] = useState('')
  const [periodo, setPeriodo]       = useState('')
  const [contratoId, setContratoId] = useState('')
  const [page, setPage]             = useState(1)
  const debouncedSearch             = useDebounce(search)

  useEffect(() => { setPage(1) }, [debouncedSearch, estado, metodoPago, periodo, contratoId])

  const { data: contratos }  = useContratosSelect()
  const selectedContrato     = contratos?.find(c => c.id === Number(contratoId))
  const diaInicio            = selectedContrato ? parseInt(selectedContrato.fecha_inicio.split('-')[2], 10) : 1

  const periodoDates = getPeriodoFechas(periodo, diaInicio)
  const filters = {
    search:      debouncedSearch          || undefined,
    estado:      estado                   || undefined,
    metodo_pago: metodoPago               || undefined,
    contrato:    contratoId               || undefined,
    fecha_desde: periodoDates.fecha_desde || undefined,
    fecha_hasta: periodoDates.fecha_hasta || undefined,
    page:        page > 1 ? page          : undefined,
  }

  const { data, isLoading }                       = usePagosList(filters)
  const { data: allPagos, isLoading: kpiLoading } = usePagosSummary()
  const allResults = allPagos?.results ?? []
  const kpis = {
    total:     allResults.length,
    pagado:    allResults.filter(p => p.estado === 'pagado').length,
    pendiente: allResults.filter(p => p.estado === 'pendiente').length,
    vencido:   allResults.filter(p => p.estado === 'vencido').length,
    parcial:   allResults.filter(p => p.estado === 'parcial').length,
  }

  const createMutation = useCreatePago({ onError: (err) => setApiError(parseApiError(err)) })

  const updateMutation = useUpdatePago({
    onSuccess: () => setModalOpen(false),
    onError:   (err) => setApiError(parseApiError(err)),
  })

  const deleteMutation = useDeletePago({
    onSuccess: () => { setDeleteTarget(null); setViewTarget(null) },
    onError:   (err) => { setDeleteTarget(null); alert(parseApiError(err)) },
  })

  const openCreate = () => {
    setEditTarget(null); setGarantiaPagoId(null)
    setIsCobrarMode(false); setApiError(''); setModalOpen(true)
  }
  const openEdit = (p: PagoRead) => {
    setEditTarget(p); setGarantiaPagoId(null)
    setIsCobrarMode(false); setApiError(''); setViewTarget(null); setModalOpen(true)
  }
  const openCobrar = (p: PagoRead) => {
    const today = new Date().toISOString().slice(0, 10)
    if (p.tipo === 'garantia') {
      setEditTarget({ contrato: p.contrato?.id, fecha_pago: today })
      setGarantiaPagoId(p.id)
    } else {
      setEditTarget({ ...p, estado: 'pagado' })
      setGarantiaPagoId(null)
    }
    setIsCobrarMode(true); setApiError(''); setViewTarget(null); setModalOpen(true)
  }

  const handleSubmit = (data: PagoWrite) => {
    setApiError('')
    const existingId = (editTarget as Partial<PagoRead>)?.id
    if (existingId) {
      updateMutation.mutate({ id: existingId, data })
    } else {
      const gId = garantiaPagoId
      createMutation.mutate(data, {
        onSuccess: async () => {
          if (gId) {
            try {
              await pagosService.update(gId, { estado: 'pagado' })
            } finally {
              qc.invalidateQueries({ queryKey: queryKeys.pagos.all() })
              qc.invalidateQueries({ queryKey: queryKeys.pagos.resumen() })
            }
          }
          setModalOpen(false)
        },
      })
    }
  }

  const isSaving      = createMutation.isPending || updateMutation.isPending
  const hayFiltros    = search || estado || metodoPago || periodo || contratoId
  const count         = data?.count
  const contratoLabel = selectedContrato
    ? `${selectedContrato.inquilino.apellido}, ${selectedContrato.inquilino.nombre} · Hab. ${selectedContrato.habitacion.numero}`
    : ''
  const activeChips = [
    search     && { key: 'search',     isSearch: true as const, label: `"${search}"`,                                                                           onRemove: () => setSearch('') },
    estado     && { key: 'estado',     dot: estadoConfig[estado]?.dot, color: estadoConfig[estado]?.text, label: estadoConfig[estado]?.label ?? estado,          onRemove: () => setEstado('') },
    metodoPago && { key: 'metodoPago', label: metodoLabel[metodoPago] ?? metodoPago,                                                                             onRemove: () => setMetodoPago('') },
    contratoId && { key: 'contrato',   label: contratoLabel,                                                                                                     onRemove: () => setContratoId('') },
    periodo    && { key: 'periodo',    label: (periodoLabel[periodo] ?? periodo) + (diaInicio !== 1 ? ` · día ${diaInicio}` : ''),                              onRemove: () => setPeriodo('') },
  ].filter(Boolean) as Array<{ key: string; isSearch?: true; dot?: string; color?: string; label: string; onRemove: () => void }>

  return (
    <div>
      <PageHeader actionLabel="Registrar pago" onAction={openCreate} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <KpiCard label="Total"      value={kpis.total}     isLoading={kpiLoading} />
        <KpiCard label="Pagados"    value={kpis.pagado}    dot={estadoConfig.pagado?.dot}    color={estadoConfig.pagado}    isLoading={kpiLoading} onClick={() => setEstado(estado === 'pagado'    ? '' : 'pagado')}    active={estado === 'pagado'} />
        <KpiCard label="Pendientes" value={kpis.pendiente} dot={estadoConfig.pendiente?.dot} color={estadoConfig.pendiente} isLoading={kpiLoading} onClick={() => setEstado(estado === 'pendiente' ? '' : 'pendiente')} active={estado === 'pendiente'} />
        <KpiCard label="Vencidos"   value={kpis.vencido}   dot={estadoConfig.vencido?.dot}   color={estadoConfig.vencido}   isLoading={kpiLoading} onClick={() => setEstado(estado === 'vencido'   ? '' : 'vencido')}   active={estado === 'vencido'} />
        <KpiCard label="Parciales"  value={kpis.parcial}   dot={estadoConfig.parcial?.dot}   color={estadoConfig.parcial}   isLoading={kpiLoading} onClick={() => setEstado(estado === 'parcial'   ? '' : 'parcial')}   active={estado === 'parcial'} />
      </div>

      <div className="rounded mb-8 bg-surface-1 border border-border">
        <div className="flex flex-wrap items-center gap-3 px-6 py-4">
          <div className="relative flex-1 min-w-[350px] max-w-xl">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-stone-text">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre del inquilino..." className={`${inpFilter} pl-9 w-full`} />
          </div>

          <SelectInput value={contratoId} onChange={(e) => setContratoId(e.target.value)} className={inpFilter}>
            <option value="">Todos los contratos</option>
            {contratos?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.inquilino.apellido}, {c.inquilino.nombre} · Hab. {c.habitacion.numero}
              </option>
            ))}
          </SelectInput>

          <SelectInput value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} className={inpFilter}>
            <option value="">Todos los métodos</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="qr">QR</option>
          </SelectInput>

          <div className="w-px h-5 self-center shrink-0" style={{ backgroundColor: 'var(--color-border-strong)' }} />

          {!isLoading && count !== undefined && (
            <span className="text-[13px] shrink-0" style={{ color: 'var(--color-stone-text)' }}>{count} resultado{count !== 1 ? 's' : ''}</span>
          )}

          {hayFiltros && (
            <button onClick={() => { setSearch(''); setEstado(''); setMetodoPago(''); setPeriodo(''); setContratoId('') }} className="flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors shrink-0" style={{ color: 'var(--color-stone-text)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-brand)' }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              Limpiar
            </button>
          )}
        </div>

        <div className="h-px bg-border" />
        <div className="flex items-center gap-1 flex-wrap px-6 py-3">
          {estadoPills.map((pill) => {
            const isActive    = estado === pill.id
            const activeStyle = pill.id === '' ? { backgroundColor: 'var(--color-brand)', color: '#FFFFFF' } : { backgroundColor: pill.bg, color: pill.text }
            return (
              <button key={pill.id} onClick={() => setEstado(pill.id)} className="flex items-center gap-1.5 text-[12px] px-3 py-[5px] rounded-full font-medium transition-colors cursor-pointer" style={isActive ? activeStyle : { color: 'var(--color-stone-text)', backgroundColor: 'transparent' }} onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface-2)' }} onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}>
                {pill.id && <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: isActive ? pill.dot : '#555553' }} />}
                {pill.label}
              </button>
            )
          })}

          <div className="w-px h-4 mx-1.5 shrink-0 bg-border-strong" />

          {periodoPills.map((pill) => {
            const isActive = periodo === pill.id
            return (
              <button key={pill.id} onClick={() => setPeriodo(pill.id)} className="flex items-center gap-1.5 text-[12px] px-3 py-[5px] rounded-full font-medium transition-colors cursor-pointer" style={isActive ? (pill.id === '' ? { backgroundColor: 'var(--color-brand)', color: '#FFFFFF' } : { backgroundColor: '#2a1200', color: 'var(--color-brand)' }) : { color: 'var(--color-stone-text)', backgroundColor: 'transparent' }} onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-surface-2)' }} onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}>
                {pill.label}
              </button>
            )
          })}
        </div>

        {activeChips.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="flex items-center gap-2 flex-wrap px-6 py-3">
              {activeChips.map(({ key, ...rest }) => <Chip key={key} {...rest} />)}
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <SkeletonGrid />
      ) : !data?.results?.length ? (
        <EmptyState
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>}
          title={hayFiltros ? 'Sin resultados para esa búsqueda' : 'No hay pagos registrados'}
          description={hayFiltros ? 'Probá con otros filtros' : 'Registrá el primer pago para empezar'}
          action={!hayFiltros && <Button onClick={openCreate} className="px-5">+ Registrar pago</Button>}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {data.results.map((p) => (
              <PagoCard key={p.id} p={p} onEdit={openEdit} onView={setViewTarget} onCobrar={openCobrar} />
            ))}
          </div>
          <Pagination count={data.count} page={page} onChange={setPage} />
        </>
      )}

      <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Pago #${viewTarget?.id}`} size="lg">
        {viewTarget && <PagoDetail p={viewTarget} onEdit={() => openEdit(viewTarget)} onDelete={() => setDeleteTarget(viewTarget)} />}
      </Modal>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={isCobrarMode ? 'Registrar cobro' : editTarget ? 'Editar pago' : 'Registrar pago'} size="lg">
        <PagoForm
          key={(editTarget as Partial<PagoRead>)?.id ?? 'new'}
          defaultValues={editTarget ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={isSaving}
          apiError={apiError}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        message={`¿Eliminás el pago #${deleteTarget?.id}? Esta acción no se puede deshacer.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
