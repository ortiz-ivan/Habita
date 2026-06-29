import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost' | 'danger' | 'danger-fill'
type Size = 'sm' | 'md'

const variants: Record<Variant, { base: React.CSSProperties; hover: React.CSSProperties; leave: React.CSSProperties }> = {
  primary: {
    base:  {
      background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
      color: '#FFFFFF',
      boxShadow: '0 2px 8px rgba(224,97,58,0.28)',
      border: 'none',
    },
    hover: {
      boxShadow: '0 4px 16px rgba(224,97,58,0.44)',
      transform: 'translateY(-1px)',
    },
    leave: {
      boxShadow: '0 2px 8px rgba(224,97,58,0.28)',
      transform: 'translateY(0)',
    },
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

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-3 text-sm',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  className?: string
}

export function Button({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }: ButtonProps) {
  const v = variants[variant]
  return (
    <button
      className={`flex items-center justify-center gap-1.5 rounded font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
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
