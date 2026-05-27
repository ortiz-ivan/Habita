export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-4 text-stone-300">
        {icon}
      </div>
      <p className="text-base font-medium text-stone-500 mb-1">{title}</p>
      {description && <p className="text-sm text-stone-400 mb-5">{description}</p>}
      {action}
    </div>
  )
}
