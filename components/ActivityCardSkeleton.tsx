/**
 * ActivityCardSkeleton - Loading skeleton for ActivityCard
 * Displays animated loading placeholders while activities are being fetched
 */

export default function ActivityCardSkeleton() {
  return (
    <div className="bg-white rounded-card shadow-card overflow-hidden border border-warm-200 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full aspect-video bg-warm-100" />

      <div className="p-4">
        {/* Header Skeleton */}
        <div className="mb-3">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="h-6 bg-warm-100 rounded w-3/4" />
            <div className="h-6 bg-warm-100 rounded-full w-16" />
          </div>
          <div className="h-4 bg-warm-100 rounded w-24" />
        </div>

        {/* Badges Skeleton */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-6 bg-warm-100 rounded-full w-20" />
          <div className="h-6 bg-warm-100 rounded-full w-16" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <div className="h-5 bg-warm-100 rounded-full w-16" />
          <div className="h-5 bg-warm-100 rounded-full w-20" />
          <div className="h-5 bg-warm-100 rounded-full w-12" />
        </div>

        {/* Notes Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-warm-100 rounded w-full" />
          <div className="h-4 bg-warm-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
