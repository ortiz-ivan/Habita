import { Button } from './Button'

export function ConfirmDialog({ isOpen, onConfirm, onCancel, message, isLoading }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-enter"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      <div
        className="rounded w-full max-w-sm p-6 modal-panel-enter bg-surface-1 border border-border"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-bg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--color-red-text)" strokeWidth={1.5} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <p className="text-sm text-center leading-relaxed mb-6 text-stone-dark">
          {message}
        </p>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading} className="flex-1">
            Cancelar
          </Button>
          <Button variant="danger-fill" onClick={onConfirm} disabled={isLoading} className="flex-1">
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
