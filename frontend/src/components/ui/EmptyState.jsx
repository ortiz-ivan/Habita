export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-brand"
        style={{ background: 'linear-gradient(135deg, #2a1200 0%, #1a0d00 100%)' }}
      >
        {icon}
      </div>
      <p className="text-base font-semibold mb-1 text-stone-dark">{title}</p>
      {description && (
        <p className="text-sm mb-5 text-stone-text">{description}</p>
      )}
      {action}
    </div>
  )
}
