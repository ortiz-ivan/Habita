import { Button } from './Button'

export const inputClass = 'w-full border border-border-strong rounded px-3.5 py-2.5 text-sm bg-surface-2 text-stone-dark placeholder:text-[#555553] focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all'
export const selectClass = `${inputClass} cursor-pointer`

export function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5 text-stone-dark">{label}</label>
      {children}
      {error && <p className="text-xs mt-1.5 font-medium text-red-text">{error.message}</p>}
    </div>
  )
}

export function FormSection({ label, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
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
      {apiError && <p className="text-sm font-medium text-red-text">{apiError}</p>}
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
      className={`rounded px-3 py-2.5 bg-surface-2${colSpan === 2 ? ' col-span-2' : ''}`}
      style={style}
    >
      <p className="text-xs font-medium mb-0.5 text-stone-text" style={labelStyle}>{label}</p>
      {children ?? <p className="font-semibold text-fg">{value}</p>}
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
