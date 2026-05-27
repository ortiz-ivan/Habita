export default function ConfirmDialog({ isOpen, onConfirm, onCancel, message, isLoading }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-enter"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 modal-panel-enter"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.10)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#FCEBEB' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#A32D2D" strokeWidth={1.5} className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>

        <p className="text-sm text-center leading-relaxed mb-6" style={{ color: '#444441' }}>
          {message}
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
            style={{ border: '1.5px solid #E0D8CC', color: '#5F5E5A', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F0E8'
              e.currentTarget.style.color = '#1C1917'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#5F5E5A'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: '#A32D2D' }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#8B2424' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#A32D2D' }}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
