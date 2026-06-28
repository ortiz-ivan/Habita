import { useState, useEffect } from 'react'
import type { ToastItem } from '../../hooks/ui/useToast'
import { useToastListener } from '../../hooks/ui/useToast'

const typeConfig = {
  success: {
    bg:     'var(--color-surface-2)',
    border: 'rgba(125, 201, 71, 0.30)',
    bar:    'var(--color-green-text)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, color: 'var(--color-green-text)', flexShrink: 0 }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
  error: {
    bg:     'var(--color-surface-2)',
    border: 'rgba(248, 113, 113, 0.30)',
    bar:    'var(--color-red-text)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, color: 'var(--color-red-text)', flexShrink: 0 }}>
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
      </svg>
    ),
  },
  info: {
    bg:     'var(--color-surface-2)',
    border: 'rgba(224, 97, 58, 0.30)',
    bar:    'var(--color-brand)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, color: 'var(--color-brand)', flexShrink: 0 }}>
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
      </svg>
    ),
  },
}

function ToastItemComponent({ t, onDismiss }: { t: ToastItem; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const cfg = typeConfig[t.type] ?? typeConfig.info
  const duration = t.duration ?? 4000

  useEffect(() => {
    const enterFrame = requestAnimationFrame(() => setVisible(true))
    const exitTimer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onDismiss(t.id), 300)
    }, duration)
    return () => {
      cancelAnimationFrame(enterFrame)
      clearTimeout(exitTimer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDismiss = () => {
    setExiting(true)
    setTimeout(() => onDismiss(t.id), 300)
  }

  return (
    <div
      style={{
        pointerEvents: 'all',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        minWidth: '280px',
        maxWidth: '360px',
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)',
        position: 'relative',
        overflow: 'hidden',
        opacity: visible && !exiting ? 1 : 0,
        transform: visible && !exiting ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 260ms ease, transform 260ms ease',
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          height: '2px',
          width: '100%',
          background: cfg.bar,
          opacity: 0.5,
          transformOrigin: 'left',
          animation: `shrink-bar ${duration}ms linear forwards`,
        }}
      />

      {cfg.icon}

      <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-fg)', flex: 1, lineHeight: 1.45 }}>
        {t.message}
      </p>

      <button
        onClick={handleDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-stone-text)',
          padding: '1px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          marginTop: '1px',
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-fg)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-stone-text)' }}
        aria-label="Cerrar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 13, height: 13 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastListener()
  if (!toasts.length) return null
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <ToastItemComponent key={t.id} t={t} onDismiss={dismiss} />
      ))}
    </div>
  )
}
