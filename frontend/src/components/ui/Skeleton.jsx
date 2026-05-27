function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="px-5 py-5 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="px-4 py-4 border-t border-stone-100 flex gap-2">
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
