import { AlertTriangle } from "lucide-react";

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

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-50 dark:border-white/[0.03] last:border-0">
      <SkeletonBox className="h-9 w-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-3.5 w-48" />
        <SkeletonBox className="h-2.5 w-24" />
      </div>
      <SkeletonBox className="h-6 w-20 rounded-full" />
      <SkeletonBox className="h-6 w-16 rounded-full" />
      <SkeletonBox className="h-3.5 w-16" />
      <SkeletonBox className="h-3.5 w-28" />
      <SkeletonBox className="h-3.5 w-20" />
      <div className="flex items-center gap-1">
        <SkeletonBox className="h-8 w-8 rounded-lg" />
        <SkeletonBox className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

export default function DisputesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBox className="h-7 w-32" />
          <SkeletonBox className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBox className="h-10 w-28 rounded-xl" />
          <SkeletonBox className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.06]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-4 py-4">
              <SkeletonBox className="h-4 w-20" />
            </div>
          ))}
        </div>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <SkeletonBox className="h-10 flex-1 rounded-xl" />
            <SkeletonBox className="h-10 w-28 rounded-xl" />
            <SkeletonBox className="h-10 w-24 rounded-xl" />
          </div>
          <div className="border-b-2 border-gray-50 dark:border-white/[0.04] mb-1">
            <div className="flex items-center gap-4 py-3 px-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonBox key={i} className="h-3 w-16" />
              ))}
            </div>
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => <TableRowSkeleton key={i} />)}
          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.04] flex items-center justify-between">
            <SkeletonBox className="h-4 w-48" />
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => <SkeletonBox key={i} className="h-8 w-8 rounded-lg" />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}