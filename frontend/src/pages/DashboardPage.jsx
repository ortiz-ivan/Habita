import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { formatGs, formatDate, parseApiError } from '../utils/format'
import { AlertBanner } from '../components/ui/AlertBanner'
import { MetricCard } from '../components/ui/MetricCard'
import { PaymentStatusBadge } from '../components/ui/PaymentStatusBadge'
import { FilterBar } from '../components/ui/FilterBar'
import { EmptyState } from '../components/ui/EmptyState'
import { DatePickerInput } from '../components/ui/DatePickerInput'
import { Modal } from '../components/ui/Modal'
import PagoForm from '../components/pagos/PagoForm'
import {
  IconHome,
  IconChart,
  IconDoc,
  IconMoney,
  IconBuildingEmpty,
  IconUsersEmpty,
} from '../components/ui/icons'
import { useHabitacionesSummary } from '../hooks/queries/useHabitaciones'
import { useContratosActivos } from '../hooks/queries/useContratos'
import { usePagosVencidos, usePagosPendientes, usePagosDashboard, usePagosResumen, useCreatePago, useUpdatePago } from '../hooks/queries/usePagos'
import { pagosService } from '../services/pagosService'
import { queryKeys } from '../lib/queryKeys'

// ─── Configuraciones ────────────────────────────────────────────────────────

const estadoHabConfig = {
  disponible:    { label: 'Disponible',    dot: 'var(--color-green-text)',   bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  ocupada:       { label: 'Ocupada',       dot: 'var(--color-blue-text)',    bg: 'var(--color-blue-bg)',           text: 'var(--color-blue-text)' },
  reservada:     { label: 'Reservada',     dot: 'var(--color-brand-amber)',  bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  mantenimiento: { label: 'Mantenimiento', dot: 'var(--color-yellow-text)',  bg: 'var(--color-yellow-bg)',         text: 'var(--color-yellow-text)' },
}

const avatarByStatus = {
  pagado:       { bg: 'var(--color-green-bg)',          text: 'var(--color-green-text)' },
  pendiente:    { bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  por_vencer:   { bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  vencido:      { bg: 'var(--color-red-bg)',            text: 'var(--color-red-text)' },
  parcial:      { bg: 'var(--color-brand-amber-light)', text: 'var(--color-brand-amber)' },
  sin_contrato: { bg: 'var(--color-surface-2)',         text: 'var(--color-stone-text)' },
}

const tenantFilters = [
  { id: 'all',       label: 'Todos'      },
  { id: 'pendiente', label: 'Pendientes' },
  { id: 'por_vencer',label: 'Por vencer' },
  { id: 'vencido',   label: 'Vencidos'   },
]

// TODO: reemplazar por histórico real (endpoint mensual)
const dispSerie = [1, 2, 1, 1, 3, 2]
const contratosSerie = [7, 8, 8, 9, 9, 9]

// ─── SectionLabel ────────────────────────────────────────────────────────────

function SectionLabel({ label, noMargin = false }) {
  return (
    <div className={`flex items-center gap-2.5 ${noMargin ? '' : 'mb-5'}`}>
      <div style={{
        width: '3px',
        height: '14px',
        borderRadius: '2px',
        background: 'linear-gradient(180deg, var(--color-brand) 0%, #C9522E 100%)',
        flexShrink: 0,
      }} />
      <span
        className="text-[13px] font-semibold shrink-0"
        style={{ color: 'var(--color-fg)', letterSpacing: '-0.01em' }}
      >
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
    </div>
  )
}

// ─── TenantRow ───────────────────────────────────────────────────────────────

function TenantRow({ pago, onCobrar }) {
  const nombre   = pago.contrato?.inquilino_nombre ?? ''
  const words    = nombre.trim().split(' ').filter(Boolean)
  const initials = words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
  const { bg, text } = avatarByStatus[pago.estado] ?? avatarByStatus.sin_contrato

  // Para garantías pendientes mostrar alquiler + cuota de garantía
  const montoMostrar = pago.tipo === 'garantia' && pago.estado !== 'pagado'
    ? (pago.contrato?.monto_mensual ?? 0) + pago.monto
    : pago.monto

  return (
    <div
      className="flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer"
      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-surface-2)' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
        style={{ backgroundColor: bg, color: text, border: `1.5px solid ${text}33` }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-fg)' }}>
          {nombre || '—'}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: 'var(--color-stone-text)' }}>
          Hab. {pago.contrato?.habitacion_numero} · {formatDate(pago.fecha_pago)}
        </p>
      </div>
      <span
        className="text-[14px] font-bold shrink-0"
        style={{ color: 'var(--color-fg)', letterSpacing: '-0.01em' }}
      >
        {formatGs(montoMostrar)}
      </span>
      <div className="w-[92px] flex justify-end shrink-0">
        <PaymentStatusBadge status={pago.estado} />
      </div>
      {pago.estado !== 'pagado' ? (
        <button
          onClick={(e) => { e.stopPropagation(); onCobrar?.(pago) }}
          className="text-[12px] font-bold px-3 py-1.5 rounded-md cursor-pointer shrink-0 whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
            color: '#fff',
            border: 'none',
            boxShadow: '0 2px 6px rgba(224,97,58,0.25)',
            transition: 'all 150ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(224,97,58,0.40)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(224,97,58,0.25)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Cobrar
        </button>
      ) : (
        <div className="w-[62px] shrink-0" />
      )}
    </div>
  )
}

// ─── Página ──────────────────────────────────────────────────────────────────

// ─── Helpers filtro período ──────────────────────────────────────────────────

const PERIODO_LABELS = { hoy: 'Hoy', semana: 'Esta semana', mes: 'Este mes', '': 'Todo el tiempo' }

function getPeriodoParams(periodo, rangoDesde, rangoHasta) {
  const now = new Date()
  const fmt = (d) => d.toISOString().slice(0, 10)

  if (periodo === 'hoy') {
    const t = fmt(now)
    return { fecha_desde: t, fecha_hasta: t }
  }
  if (periodo === 'semana') {
    const day = now.getDay()
    const diffMon = day === 0 ? -6 : 1 - day
    const mon = new Date(now); mon.setDate(now.getDate() + diffMon)
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
    return { fecha_desde: fmt(mon), fecha_hasta: fmt(sun) }
  }
  if (periodo === 'mes') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const last  = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { fecha_desde: fmt(first), fecha_hasta: fmt(last) }
  }
  if (periodo === 'rango') {
    return {
      fecha_desde: rangoDesde || undefined,
      fecha_hasta: rangoHasta || undefined,
    }
  }
  return {}
}

// ─── Página ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const user     = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const [tenantFilter, setTenantFilter] = useState('all')
  const [habPage, setHabPage] = useState(0)
  const [movPage, setMovPage] = useState(0)

  // ── Filtro período KPI ───────────────────────────────────────────────────
  const [periodoKpi, setPeriodoKpi] = useState('mes')
  const [rangoDesde, setRangoDesde] = useState('')
  const [rangoHasta, setRangoHasta] = useState('')
  const resumenParams = getPeriodoParams(periodoKpi, rangoDesde, rangoHasta)

  // ── Modal cobrar ──────────────────────────────────────────────────────────
  const [pagoModal, setPagoModal] = useState({ open: false, defaultValues: null, garantiaPagoId: null })
  const [pagoApiError, setPagoApiError] = useState('')
  const qc = useQueryClient()

  const closeModal = () => {
    setPagoModal({ open: false, defaultValues: null, garantiaPagoId: null })
    setPagoApiError('')
  }

  const createPago = useCreatePago({ onError: (err) => setPagoApiError(parseApiError(err)) })
  const updatePago = useUpdatePago({ onSuccess: closeModal, onError: (err) => setPagoApiError(parseApiError(err)) })

  const handleCobrar = (pago) => {
    setPagoApiError('')
    const today = new Date().toISOString().slice(0, 10)
    if (pago.tipo === 'garantia') {
      // Crear un nuevo pago de alquiler con monto_mensual + cuota de garantía
      // La garantía se marca automáticamente como pagada al completar
      setPagoModal({
        open: true,
        defaultValues: { contrato: pago.contrato?.id, fecha_pago: today },
        garantiaPagoId: pago.id,
      })
    } else {
      // Actualizar el pago de alquiler existente
      setPagoModal({
        open: true,
        defaultValues: {
          id:         pago.id,
          contrato:   pago.contrato?.id,
          monto:      pago.monto,
          fecha_pago: today,
          estado:     'pagado',
        },
        garantiaPagoId: null,
      })
    }
  }

  const handlePagoSubmit = (data) => {
    if (pagoModal.defaultValues?.id) {
      updatePago.mutate({ id: pagoModal.defaultValues.id, data })
    } else {
      const garantiaPagoId = pagoModal.garantiaPagoId
      createPago.mutate(data, {
        onSuccess: async () => {
          if (garantiaPagoId) {
            try {
              await pagosService.update(garantiaPagoId, { estado: 'pagado' })
            } finally {
              qc.invalidateQueries({ queryKey: queryKeys.pagos.all() })
              qc.invalidateQueries({ queryKey: queryKeys.pagos.resumen() })
              qc.invalidateQueries({ queryKey: ['pagos-dashboard'] })
            }
          }
          closeModal()
        },
      })
    }
  }

  // ── Queries para métricas ─────────────────────────────────────────────────
  const { data: habitaciones }                         = useHabitacionesSummary()
  const { data: contratos }                            = useContratosActivos()
  const { data: pagosVencidos }                        = usePagosVencidos()
  const { data: pagosPendientes }                      = usePagosPendientes()
  const { data: resumen }                              = usePagosResumen(resumenParams)
  const { data: tenantData, isLoading: tenantLoading } = usePagosDashboard(tenantFilter, resumenParams)

  // ── Métricas ──────────────────────────────────────────────────────────────
  const habs        = habitaciones?.results ?? []
  const disponibles = habs.filter((h) => h.estado === 'disponible').length
  const ocupadas    = habs.filter((h) => h.estado === 'ocupada').length
  const total       = habs.length
  const ocupacion   = total ? Math.round((ocupadas / total) * 100) : 0

  const vencidosCount   = pagosVencidos?.count  ?? 0
  const pendientesCount = pagosPendientes?.count ?? 0

  const montoVencido      = (pagosVencidos?.results ?? []).reduce((acc, p) => acc + (p.monto ?? 0), 0)
  const ingresosMes       = resumen?.ingresos_mes          ?? 0
  const ingresosMesAnt    = resumen?.ingresos_mes_anterior ?? 0
  const montoAdeudado     = resumen?.monto_adeudado        ?? 0

  const ingresosDeltas = (() => {
    if (ingresosMesAnt === 0) return null
    const pct = Math.round(((ingresosMes - ingresosMesAnt) / ingresosMesAnt) * 100)
    return { value: `${pct >= 0 ? '+' : ''}${pct}% vs mes ant.`, up: pct >= 0 }
  })()

  const tenantRows = tenantData?.results ?? []

  return (
    <div>
      {/* Hero banner */}
      <div
        className="flex items-center gap-4 rounded-xl px-6 py-5 mb-8"
        style={{
          background: 'linear-gradient(135deg, rgba(224,97,58,0.07) 0%, rgba(224,97,58,0.03) 60%, transparent 100%)',
          border: '1px solid rgba(224,97,58,0.12)',
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, var(--color-brand) 0%, #FAC775 100%)',
            boxShadow: '0 4px 16px rgba(224,97,58,0.30)',
            color: '#fff',
          }}
        >
          <span style={{ transform: 'scale(1.4)', display: 'flex' }}>
            <IconHome />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h2
            className="font-bold leading-tight"
            style={{ fontSize: '20px', color: 'var(--color-fg)', letterSpacing: '-0.02em' }}
          >
            Bienvenido, {user?.first_name || user?.username}
          </h2>
          <p className="text-[13px] capitalize mt-1" style={{ color: 'var(--color-stone-text)' }}>
            {user?.rol} · {new Date().toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {vencidosCount > 0 ? (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0"
            style={{ backgroundColor: 'var(--color-red-bg)', color: 'var(--color-red-text)', border: '1px solid var(--color-red-border)' }}
          >
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1ZM4.22 4.22a.75.75 0 0 1 1.06 0L6 4.94l.72-.72a.75.75 0 1 1 1.06 1.06L7.06 6l.72.72a.75.75 0 1 1-1.06 1.06L6 7.06l-.72.72a.75.75 0 0 1-1.06-1.06L4.94 6l-.72-.72a.75.75 0 0 1 0-1.06Z" clipRule="evenodd"/>
            </svg>
            {vencidosCount} vencido{vencidosCount > 1 ? 's' : ''}
          </span>
        ) : pendientesCount > 0 ? (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0"
            style={{ backgroundColor: 'var(--color-brand-amber-light)', color: 'var(--color-brand-amber)', border: '1px solid var(--color-amber-border)' }}
          >
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M5.105 1.67c.394-.683 1.396-.683 1.79 0l4.5 7.794C11.787 10.148 11.29 11 10.5 11h-9c-.79 0-1.287-.852-.895-1.536l4.5-7.794ZM6 4.5a.75.75 0 0 0-.75.75v2a.75.75 0 0 0 1.5 0v-2A.75.75 0 0 0 6 4.5Zm0 5.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd"/>
            </svg>
            {pendientesCount} pendiente{pendientesCount > 1 ? 's' : ''}
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold shrink-0"
            style={{ backgroundColor: 'var(--color-green-bg)', color: 'var(--color-green-text)', border: '1px solid var(--color-green-border)' }}
          >
            <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M10.22 2.47a.75.75 0 0 1 0 1.06l-5.5 5.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 0 1 1.06-1.06L4.25 7.44l4.97-4.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd"/>
            </svg>
            Al día
          </span>
        )}
      </div>


      {/* Métricas */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <SectionLabel label="Resumen" noMargin />
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'hoy',    label: 'Hoy' },
            { id: 'semana', label: 'Esta semana' },
            { id: 'mes',    label: 'Este mes' },
            { id: '',       label: 'Todo' },
            { id: 'rango',  label: 'Rango' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriodoKpi(p.id)}
              className="text-[12px] px-3 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
              style={periodoKpi === p.id
                ? { backgroundColor: 'var(--color-brand)', color: '#fff' }
                : { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-stone-text)', border: '1px solid var(--color-border)' }
              }
              onMouseEnter={(e) => { if (periodoKpi !== p.id) e.currentTarget.style.color = 'var(--color-fg)' }}
              onMouseLeave={(e) => { if (periodoKpi !== p.id) e.currentTarget.style.color = 'var(--color-stone-text)' }}
            >
              {p.label}
            </button>
          ))}
          {periodoKpi === 'rango' && (
            <div className="flex items-center gap-1.5 ml-1">
              <DatePickerInput
                value={rangoDesde}
                onChange={setRangoDesde}
                placeholder="Desde"
                compact
              />
              <span className="text-[12px]" style={{ color: 'var(--color-stone-text)' }}>–</span>
              <DatePickerInput
                value={rangoHasta}
                onChange={setRangoHasta}
                placeholder="Hasta"
                compact
              />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <MetricCard
          label="Ingresos del mes"
          value={formatGs(ingresosMes)}
          color="success"
          icon={<IconMoney />}
          delta={ingresosDeltas}
        />
        <MetricCard
          label="Pendiente de cobro"
          value={formatGs(montoAdeudado)}
          color={vencidosCount > 0 ? 'danger' : 'warning'}
          icon={<IconChart />}
          delta={
            vencidosCount > 0
              ? { value: `${vencidosCount} vencido${vencidosCount > 1 ? 's' : ''}`, up: false }
              : { value: PERIODO_LABELS[periodoKpi] ?? 'Rango personalizado', neutral: true }
          }
        />
        <MetricCard
          label="Ocupación"
          value={`${ocupacion}%`}
          color="brand"
          icon={<IconHome />}
          progress={ocupacion}
        />
        <MetricCard
          label="Contratos activos"
          value={contratos?.count}
          color="default"
          icon={<IconDoc />}
          spark={contratosSerie}
          animated
        />
      </div>

      {/* Fila inferior: TenantTable + Habitaciones */}
      <SectionLabel label="Actividad" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">

        {/* TenantTable */}
        <div className="flex flex-col gap-3">
          <FilterBar
            filters={tenantFilters}
            active={tenantFilter}
            onChange={(v) => { setTenantFilter(v); setMovPage(0) }}
          />

          <div className="rounded-xl overflow-hidden bg-surface-1 border border-border">
            {/* Header */}
            <div className="flex items-center px-5 py-3.5" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <h2 className="text-[14px] font-semibold" style={{ color: 'var(--color-fg)' }}>Últimos movimientos</h2>
              <button
                onClick={() => navigate('/pagos')}
                className="ml-auto text-[12px] font-medium cursor-pointer"
                style={{ color: 'var(--color-brand)', transition: 'opacity 150ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                Ver todos →
              </button>
            </div>
            {/* Columnas */}
            <div
              className="flex items-center gap-3 px-5 py-2"
              style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-0)' }}
            >
              <div style={{ width: '32px', flexShrink: 0 }} />
              <span className="flex-1" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-stone-text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Inquilino</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-stone-text)', textTransform: 'uppercase', letterSpacing: '0.07em', width: '90px', textAlign: 'right', flexShrink: 0 }}>Monto</span>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-stone-text)', textTransform: 'uppercase', letterSpacing: '0.07em', width: '92px', textAlign: 'right', flexShrink: 0 }}>Estado</span>
              <div style={{ width: '62px', flexShrink: 0 }} />
            </div>

            {/* Filas */}
            <div>
              {tenantLoading ? (
                <div className="px-4 py-8 text-center text-[13px]" style={{ color: 'var(--color-stone-text)' }}>
                  Cargando…
                </div>
              ) : tenantRows.length === 0 ? (
                <div className="py-8">
                  <EmptyState
                    icon={<IconUsersEmpty />}
                    title="Sin resultados"
                    description="No hay pagos en este estado"
                  />
                </div>
              ) : (() => {
                const MOV_PAGE_SIZE = 5
                const movTotalPages = Math.ceil(tenantRows.length / MOV_PAGE_SIZE)
                const movCurPage = Math.min(movPage, movTotalPages - 1)
                const pageRows = tenantRows.slice(movCurPage * MOV_PAGE_SIZE, (movCurPage + 1) * MOV_PAGE_SIZE)
                return (
                  <>
                    {pageRows.map((p) => (
                      <TenantRow key={p.id} pago={p} onCobrar={handleCobrar} />
                    ))}
                    {movTotalPages > 1 && (
                      <div className="flex items-center justify-between mx-3 mt-2 mb-2 px-2 py-2 rounded-lg" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                        <button
                          onClick={() => setMovPage((p) => Math.max(0, p - 1))}
                          disabled={movCurPage === 0}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                          style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: movCurPage === 0 ? 'not-allowed' : 'pointer' }}
                          onMouseEnter={(e) => { if (movCurPage > 0) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                        >
                          ← Ant.
                        </button>
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888884' }}>
                          <span style={{ color: 'var(--color-brand)' }}>{movCurPage + 1}</span> / {movTotalPages}
                        </span>
                        <button
                          onClick={() => setMovPage((p) => Math.min(movTotalPages - 1, p + 1))}
                          disabled={movCurPage === movTotalPages - 1}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                          style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: movCurPage === movTotalPages - 1 ? 'not-allowed' : 'pointer' }}
                          onMouseEnter={(e) => { if (movCurPage < movTotalPages - 1) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                        >
                          Sig. →
                        </button>
                      </div>
                    )}
                  </>
                )
              })()}
            </div>
          </div>
        </div>

        {/* Grid de habitaciones */}
        <div className="rounded p-4 bg-surface-1 border border-border">
          <h2 className="text-[13px] font-medium mb-3" style={{ color: 'var(--color-fg)' }}>Habitaciones</h2>

          {/* Resumen por estado */}
          {total > 0 && (
            <div className="space-y-1.5 mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              {Object.entries(estadoHabConfig).map(([key, { label, dot }]) => {
                const count = habs.filter((h) => h.estado === key).length
                if (count === 0) return null
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                    <span className="text-[12px] flex-1" style={{ color: 'var(--color-stone-text)' }}>{label}</span>
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--color-fg)' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          )}


          {total === 0 ? (
            <EmptyState
              icon={<IconBuildingEmpty />}
              title="No hay habitaciones"
              description="Agregá la primera habitación"
            />
          ) : (() => {
            const PAGE_SIZE = 8
            const totalPages = Math.ceil(habs.length / PAGE_SIZE)
            const page = Math.min(habPage, totalPages - 1)
            const pageHabs = habs.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
            return (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {pageHabs.map((h) => {
                    const cfg = estadoHabConfig[h.estado] ?? { label: h.estado, dot: 'var(--color-stone-text)', bg: 'var(--color-surface-2)', text: 'var(--color-stone-text)' }
                    return (
                      <div
                        key={h.id}
                        className="rounded px-3 py-2.5 cursor-default transition-transform duration-150"
                        style={{ backgroundColor: cfg.bg, borderLeft: `3px solid ${cfg.dot}` }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                      >
                        <p className="text-[13px] font-semibold leading-tight" style={{ color: cfg.text }}>N°{h.numero}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: cfg.dot }}>Piso {h.piso}</p>
                        <p className="text-[11px] mt-1 capitalize font-medium" style={{ color: cfg.text }}>{cfg.label}</p>
                      </div>
                    )
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-3 pt-3 px-2 pb-2 rounded-lg" style={{ borderTop: '1px solid var(--color-border)', background: '#0f0f0f' }}>
                    <button
                      onClick={() => setHabPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                      style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                      onMouseEnter={(e) => { if (page > 0) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                    >
                      ← Ant.
                    </button>
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-md" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888884' }}>
                      <span style={{ color: 'var(--color-brand)' }}>{page + 1}</span> / {totalPages}
                    </span>
                    <button
                      onClick={() => setHabPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page === totalPages - 1}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-md disabled:opacity-35 transition-colors"
                      style={{ color: '#e5e5e5', background: '#1a1a1a', border: '1px solid #2a2a2a', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                      onMouseEnter={(e) => { if (page < totalPages - 1) { e.currentTarget.style.background = '#222222'; e.currentTarget.style.borderColor = '#374151' } }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                    >
                      Sig. →
                    </button>
                  </div>
                )}
              </>
            )
          })()}
        </div>

      </div>

      {/* Modal — Cobrar pago rápido */}
      <Modal
        isOpen={pagoModal.open}
        onClose={closeModal}
        title="Registrar pago"
        size="lg"
      >
        <PagoForm
          defaultValues={pagoModal.defaultValues}
          onSubmit={handlePagoSubmit}
          onCancel={closeModal}
          isLoading={createPago.isPending || updatePago.isPending}
          apiError={pagoApiError}
        />
      </Modal>
    </div>
  )
}
