export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, #2a1200 0%, #1a0d00 100%)',
          color: '#D85A30',
        }}
      >
        {icon}
      </div>
      <p className="text-base font-semibold mb-1" style={{ color: '#e5e5e5' }}>{title}</p>
      {description && (
        <p className="text-sm mb-5" style={{ color: '#888884' }}>{description}</p>
      )}
      {action}
    </div>
  )
}
