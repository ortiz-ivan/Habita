const IconWarning = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" clipRule="evenodd" />
  </svg>
)

const IconDanger = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
)

const IconSuccess = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 mt-0.5">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5z" clipRule="evenodd" />
  </svg>
)

type AlertType = 'warning' | 'danger' | 'success'

interface AlertConfig {
  bg: string
  border: string
  text: string
  icon: string
  Icon: () => React.ReactElement
}

const alertConfig: Record<AlertType, AlertConfig> = {
  warning: {
    bg:     'var(--color-brand-amber-light)',
    border: 'var(--color-brand-amber)',
    text:   'var(--color-brand-amber)',
    icon:   'var(--color-brand-amber)',
    Icon:   IconWarning,
  },
  danger: {
    bg:     'var(--color-red-bg)',
    border: 'var(--color-red-text)',
    text:   'var(--color-red-text)',
    icon:   'var(--color-red-text)',
    Icon:   IconDanger,
  },
  success: {
    bg:     'var(--color-green-bg)',
    border: 'var(--color-green-text)',
    text:   'var(--color-green-text)',
    icon:   'var(--color-green-text)',
    Icon:   IconSuccess,
  },
}

interface AlertBannerProps {
  type: AlertType
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function AlertBanner({ type, message, actionLabel, onAction }: AlertBannerProps) {
  const cfg = alertConfig[type] ?? alertConfig.warning
  const { bg, border, text, icon, Icon } = cfg

  return (
    <div
      className="flex items-start gap-2.5 px-3.5 py-[10px] rounded-xl mb-3"
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
      }}
    >
      <span style={{ color: icon }}>
        <Icon />
      </span>
      <p className="text-[13px] leading-relaxed flex-1 font-medium" style={{ color: text }}>{message}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-[12px] font-medium shrink-0 pl-2.5 hover:underline"
          style={{ color: icon }}
        >
          {actionLabel} →
        </button>
      )}
    </div>
  )
}
