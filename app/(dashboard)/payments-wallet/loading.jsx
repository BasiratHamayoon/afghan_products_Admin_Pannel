function Skeleton({ className }) {
  return <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />;
}
function StatSkeleton() {
  return (
    <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
      <Skeleton className="h-11 w-11 rounded-xl mb-4" />
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-7 w-24" />
    </div>
  );
}
function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-50 dark:border-white/[0.03] last:border-0">
      <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-2.5 w-48" /></div>
      <Skeleton className="h-6 w-16 rounded-full hidden sm:block" />
      <Skeleton className="h-3.5 w-20 hidden md:block" />
      <Skeleton className="h-6 w-16 rounded-full hidden lg:block" />
      <Skeleton className="h-3.5 w-16 hidden xl:block" />
      <Skeleton className="h-7 w-7 rounded-lg" />
    </div>
  );
}

export default function PaymentsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-64" /></div>
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] overflow-hidden">
        <div className="flex border-b border-gray-100 dark:border-white/[0.06]">
          {[80, 90, 80, 90, 90].map((w, i) => <div key={i} className="px-4 py-4"><Skeleton className="h-4 rounded" style={{ width: w }} /></div>)}
        </div>
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]"><div className="flex gap-2"><Skeleton className="h-10 flex-1 rounded-xl" /><Skeleton className="h-10 w-24 rounded-xl" /></div></div>
        <div className="p-4">{Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)}</div>
      </div>
    </div>
  );
}