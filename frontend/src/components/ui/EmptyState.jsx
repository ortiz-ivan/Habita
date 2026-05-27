export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, #FAECE7 0%, #F5EDE8 100%)',
          color: '#D85A30',
        }}
      >
        {icon}
      </div>
      <p className="text-base font-semibold mb-1" style={{ color: '#444441' }}>{title}</p>
      {description && (
        <p className="text-sm mb-5" style={{ color: '#5F5E5A' }}>{description}</p>
      )}
      {action}
    </div>
  )
}
