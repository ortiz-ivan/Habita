import type { EstadoPago } from '../../types/api'

interface BadgeConfig {
  label: string
  bg: string
  text: string
  dot: string
  border: string
  pulse?: boolean
}

const config: Record<EstadoPago | 'sin_contrato', BadgeConfig> = {
  pagado: {
    label: 'Pagado',
    bg:     'var(--color-green-bg)',
    text:   'var(--color-green-text)',
    dot:    'var(--color-green-text)',
    border: 'var(--color-green-border)',
  },
  pendiente: {
    label: 'Pendiente',
    bg:     'var(--color-brand-amber-light)',
    text:   'var(--color-brand-amber)',
    dot:    'var(--color-brand-amber)',
    border: 'var(--color-amber-border)',
  },
  por_vencer: {
    label: 'Por vencer',
    bg:     'var(--color-brand-amber-light)',
    text:   'var(--color-brand-amber)',
    dot:    'var(--color-brand-amber)',
    border: 'var(--color-amber-border)',
  },
  vencido: {
    label:  'Vencido',
    bg:     'var(--color-red-bg)',
    text:   'var(--color-red-text)',
    dot:    'var(--color-red-text)',
    border: 'var(--color-red-border)',
    pulse:  true,
  },
  parcial: {
    label: 'Parcial',
    bg:     'var(--color-brand-amber-light)',
    text:   'var(--color-brand-amber)',
    dot:    'var(--color-brand-amber)',
    border: 'var(--color-amber-border)',
  },
  sin_contrato: {
    label: 'Sin contrato',
    bg:     'var(--color-surface-2)',
    text:   'var(--color-stone-text)',
    dot:    'var(--color-stone-text)',
    border: 'var(--color-border-strong)',
  },
}

const fallbackConfig = (status: string): BadgeConfig => ({
  label:  status,
  bg:     'var(--color-surface-2)',
  text:   'var(--color-stone-text)',
  dot:    'var(--color-stone-text)',
  border: 'var(--color-border-strong)',
})

interface PaymentStatusBadgeProps {
  status: string
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const cfg = (config as Record<string, BadgeConfig>)[status] ?? fallbackConfig(status)

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-[3px] rounded-full shrink-0"
      style={{
        backgroundColor: cfg.bg,
        color:  cfg.text,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="w-[6px] h-[6px] rounded-full shrink-0"
        style={{
          backgroundColor: cfg.dot,
          animation: cfg.pulse ? 'pulse-dot 2s ease-in-out infinite' : undefined,
        }}
      />
      {cfg.label}
    </span>
  )
}
