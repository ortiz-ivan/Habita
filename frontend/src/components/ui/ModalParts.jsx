import { Button } from './Button'

export const inputClass = 'w-full border border-border-strong rounded-lg px-4 py-3 text-[14px] bg-surface-2 text-stone-dark placeholder:text-[#55554f] focus:outline-none focus:ring-[3px] focus:ring-brand/15 focus:border-brand transition-all'
export const selectClass = `${inputClass} appearance-none cursor-pointer pr-10`

const Chevron = () => (
  <svg
    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none shrink-0"
    style={{ color: 'var(--color-stone-text)' }}
    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

export function SelectInput({ className, wrapperClassName = '', children, ...props }) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select className={`${className ?? selectClass} appearance-none cursor-pointer pr-10`} {...props}>
        {children}
      </select>
      <Chevron />
    </div>
  )
}

export function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-2 text-stone-text">{label}</label>
      {children}
      {error && <p className="text-[12px] mt-1.5 font-medium text-red-text">{error.message}</p>}
    </div>
  )
}

export function FormSection({ label, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            background: 'var(--color-brand)',
            flexShrink: 0,
            opacity: 0.65,
          }}
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0" style={{ color: 'var(--color-stone-text)' }}>{label}</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-border)' }} />
      </div>
      {children}
    </div>
  )
}

export function FormFooter({ apiError, onCancel, isLoading, isEdit }) {
  return (
    <>
      {apiError && (
        <p
          className="text-[13px] font-medium px-3 py-2 rounded-lg"
          style={{
            color: 'var(--color-red-text)',
            backgroundColor: 'var(--color-red-bg)',
            border: '1px solid var(--color-red-border)',
          }}
        >
          {apiError}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Guardar')}
        </Button>
      </div>
    </>
  )
}

export function InfoCard({ label, value, colSpan, style, labelStyle, children }) {
  return (
    <div
      className={`rounded-lg px-3 py-2.5 bg-surface-2${colSpan === 2 ? ' col-span-2' : ''}`}
      style={style}
    >
      <p className="text-[11px] font-medium mb-0.5 text-stone-text" style={labelStyle}>{label}</p>
      {children ?? <p className="text-[14px] font-semibold text-fg">{value}</p>}
    </div>
  )
}

export function DetailActions({ onEdit, onDelete }) {
  return (
    <div className="flex gap-2 pt-1">
      <Button onClick={onEdit} className="flex-1">Editar</Button>
      <Button variant="danger" onClick={onDelete} className="flex-1">Eliminar</Button>
    </div>
  )
}
