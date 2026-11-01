interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`relative overflow-hidden rounded-12 bg-slate-100 ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
  </div>
)

export const SkeletonCard = ({ className = '' }: SkeletonProps) => (
  <div className={`rounded-18 border border-border bg-surface p-6 ${className}`}>
    <Skeleton className="h-4 w-28" />
    <Skeleton className="mt-3 h-8 w-40" />
    <Skeleton className="mt-3 h-3 w-24" />
  </div>
)

export const SkeletonChart = ({ className = '' }: SkeletonProps) => (
  <div className={`rounded-18 border border-border bg-surface p-6 ${className}`}>
    <Skeleton className="h-4 w-40" />
    <Skeleton className="mt-6 h-56 w-full" />
  </div>
)

export default Skeleton
