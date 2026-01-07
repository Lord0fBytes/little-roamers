/**
 * ActivityCardSkeleton - Loading skeleton for ActivityCard
 * Displays animated loading placeholders while activities are being fetched
 */

export default function ActivityCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      {/* Image Skeleton */}
      <div className="relative w-full aspect-video bg-gray-200" />

      <div className="p-4">
        {/* Header Skeleton */}
        <div className="mb-3">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>

        {/* Badges Skeleton */}
        <div className="flex flex-wrap gap-2 mb-3">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <div className="h-5 bg-gray-200 rounded-full w-16" />
          <div className="h-5 bg-gray-200 rounded-full w-20" />
          <div className="h-5 bg-gray-200 rounded-full w-12" />
        </div>

        {/* Notes Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
