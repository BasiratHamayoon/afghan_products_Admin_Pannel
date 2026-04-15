import { Users } from "lucide-react";

function Skeleton({ className }) {
  return <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />;
}

function StatSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-50 dark:border-white/[0.03] last:border-0">
      <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-2.5 w-48" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
      <Skeleton className="h-6 w-14 rounded-full hidden md:block" />
      <Skeleton className="h-3.5 w-24 hidden lg:block" />
      <Skeleton className="h-3.5 w-20 hidden xl:block" />
      <Skeleton className="h-7 w-7 rounded-lg" />
    </div>
  );
}

export default function UsersLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-white/[0.06]">
          {[100, 80, 70, 65, 70].map((w, i) => (
            <div key={i} className="px-4 py-4">
              <Skeleton className="h-4 rounded" style={{ width: w }} />
            </div>
          ))}
        </div>
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
            <Skeleton className="h-10 w-20 rounded-xl" />
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-4 py-3 px-4 border-b-2 border-gray-50 dark:border-white/[0.04] mb-1">
            {[40, 100, 80, 70, 90, 60, 80, 80].map((w, i) => (
              <Skeleton key={i} className="h-3" style={{ width: w }} />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      </div>
    </div>
  );
}