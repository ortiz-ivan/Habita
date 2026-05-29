import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
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

  const maxW = size === 'lg' ? 'max-w-xl' : 'max-w-md'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-enter"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className={`flex flex-col overflow-hidden rounded w-full ${maxW} max-h-[88vh] modal-panel-enter bg-surface-1`}
        style={{
          border: '1px solid #222222',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), 0 8px 24px rgba(0,0,0,0.4)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Acento coral */}
        <div className="bg-brand shrink-0" style={{ height: '2px' }} />

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 pt-4 pb-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--color-surface-2)' }}
        >
          <h3 className="text-[15px] font-semibold text-fg">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer text-stone-text"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'
              e.currentTarget.style.color = 'var(--color-stone-dark)'
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
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
