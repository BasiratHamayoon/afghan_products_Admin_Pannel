function SkeletonBox({ className }) {
    return <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />;
  }
  
  function StatCardSkeleton() {
    return (
      <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-start justify-between mb-4">
          <SkeletonBox className="h-11 w-11 rounded-xl" />
          <SkeletonBox className="h-6 w-14 rounded-full" />
        </div>
        <SkeletonBox className="h-3 w-24 mb-2" />
        <SkeletonBox className="h-7 w-16" />
      </div>
    );
  }
  
  function CardSkeleton() {
    return (
      <div className="rounded-2xl p-4 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] flex items-start gap-4">
        <SkeletonBox className="h-20 w-32 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBox className="h-4 w-48" />
          <SkeletonBox className="h-3 w-64" />
          <div className="flex gap-2 mt-2">
            <SkeletonBox className="h-5 w-16 rounded-full" />
            <SkeletonBox className="h-5 w-14 rounded-full" />
            <SkeletonBox className="h-5 w-12 rounded-full" />
          </div>
          <div className="flex gap-2 mt-2">
            <SkeletonBox className="h-10 w-24 rounded-lg" />
            <SkeletonBox className="h-10 w-24 rounded-lg" />
            <SkeletonBox className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  export default function ContentAdsLoading() {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <SkeletonBox className="h-7 w-36" />
            <SkeletonBox className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-10 w-28 rounded-xl" />
            <SkeletonBox className="h-10 w-36 rounded-xl" />
          </div>
        </div>
  
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
  
        <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
          <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
            <div className="flex items-center gap-3 mb-3">
              <SkeletonBox className="h-9 w-28 rounded-xl" />
              <SkeletonBox className="h-9 w-32 rounded-xl" />
              <SkeletonBox className="h-9 w-28 rounded-xl" />
              <SkeletonBox className="h-9 w-24 rounded-xl" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-10 flex-1 rounded-xl" />
              <SkeletonBox className="h-10 w-24 rounded-xl" />
              <SkeletonBox className="h-10 w-24 rounded-xl" />
            </div>
          </div>
          <div className="p-5 space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }