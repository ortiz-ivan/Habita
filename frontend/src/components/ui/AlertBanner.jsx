const alertConfig = {
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-900', icon: '🔔' },
  danger:  { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-800',   icon: '⚠️' },
  success: { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-800', icon: '✓'  },
}

export function AlertBanner({ type, message }) {
  const { bg, border, text, icon } = alertConfig[type] ?? alertConfig.warning
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${bg} ${border} mb-3`}>
      <span className="text-base shrink-0 leading-relaxed">{icon}</span>
      <p className={`text-sm leading-relaxed ${text}`}>{message}</p>
    </div>
  )
}
