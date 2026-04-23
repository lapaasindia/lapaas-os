export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    aria-hidden="true"
  />
);

export const SkeletonText = () => (
  <div className="space-y-2">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4">
    <Skeleton className="h-6 w-1/2" />
    <SkeletonText />
    <Skeleton className="h-10 w-full" />
  </div>
);
