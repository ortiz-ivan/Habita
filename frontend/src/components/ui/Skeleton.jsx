function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[#2a2a2a] ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#1a1a1a', borderBottom: '1px solid #1f1f1f' }}>
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="px-5 py-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="px-4 py-4 flex gap-2" style={{ borderTop: '1px solid #1f1f1f' }}>
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
