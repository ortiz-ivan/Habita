export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Icon with radial glow halo */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <div style={{
          position: 'absolute', inset: '-16px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224,97,58,0.10) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          width: '64px', height: '64px', borderRadius: '16px', position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(224,97,58,0.14) 0%, rgba(201,82,46,0.06) 100%)',
          border: '1px solid rgba(224,97,58,0.20)',
          color: 'var(--color-brand)',
          boxShadow: '0 4px 18px rgba(224,97,58,0.14)',
        }}>
          {icon}
        </div>
      </div>
      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-fg)', marginBottom: '6px', letterSpacing: '-0.01em' }}>
        {title}
      </p>
      {description && (
        <p style={{ fontSize: '13px', color: 'var(--color-stone-text)', marginBottom: '20px', maxWidth: '280px', lineHeight: 1.55 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  )
}
