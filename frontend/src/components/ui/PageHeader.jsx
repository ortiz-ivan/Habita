import { Button } from './Button'

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

export function PageHeader({ subtitle, actionLabel, onAction }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {subtitle
        ? <p className="text-sm text-stone-text">{subtitle}</p>
        : <div />
      }
      {actionLabel && (
        <Button onClick={onAction} className="shrink-0 px-5">
          <IconPlus />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
