import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const panelMaxW = size === 'lg' ? 'min(700px, 90vw)' : 'min(560px, 90vw)'

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-enter"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="flex flex-col overflow-hidden rounded-xl w-full max-h-[88vh] modal-panel-enter bg-surface-1"
        style={{
          maxWidth: panelMaxW,
          border: '1px solid var(--color-border)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.70), 0 8px 32px rgba(0,0,0,0.45)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Acento coral — gradiente */}
        <div
          className="shrink-0"
          style={{ height: '3px', background: 'linear-gradient(90deg, var(--color-brand) 0%, #FAC775 100%)' }}
        />

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 pt-4 pb-4 shrink-0"
          style={{
            borderBottom: '1px solid var(--color-border)',
            background: 'linear-gradient(180deg, var(--color-surface-2) 0%, var(--color-surface-1) 100%)',
          }}
        >
          <h3 className="text-[16px] font-bold text-fg" style={{ letterSpacing: '-0.01em' }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-stone-text"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-3)'
              e.currentTarget.style.color = 'var(--color-fg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-stone-text)'
            }}
            aria-label="Cerrar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  )
}
