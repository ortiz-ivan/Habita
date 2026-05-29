const variants = {
  primary: {
    base:  { backgroundColor: 'var(--color-brand)', color: '#FFFFFF' },
    hover: { backgroundColor: 'var(--color-brand-hover)' },
    leave: { backgroundColor: 'var(--color-brand)' },
  },
  ghost: {
    base:  { border: '1px solid var(--color-border-strong)', color: 'var(--color-stone-text)', backgroundColor: 'transparent' },
    hover: { backgroundColor: 'var(--color-surface-2)', color: 'var(--color-stone-dark)', borderColor: '#3a3a3a' },
    leave: { backgroundColor: 'transparent', color: 'var(--color-stone-text)', borderColor: 'var(--color-border-strong)' },
  },
  danger: {
    base:  { border: '1.5px solid #A32D2D', color: 'var(--color-red-text)', backgroundColor: 'transparent' },
    hover: { backgroundColor: 'var(--color-red-bg)' },
    leave: { backgroundColor: 'transparent' },
  },
  'danger-fill': {
    base:  { backgroundColor: '#A32D2D', color: '#FFFFFF' },
    hover: { backgroundColor: '#8B2424' },
    leave: { backgroundColor: '#A32D2D' },
  },
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
}

export function Button({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }) {
  const v = variants[variant]
  return (
    <button
      className={`flex items-center justify-center gap-1.5 rounded font-semibold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      style={v.base}
      onMouseEnter={(e) => { if (!disabled) Object.assign(e.currentTarget.style, v.hover) }}
      onMouseLeave={(e) => { if (!disabled) Object.assign(e.currentTarget.style, v.leave) }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
