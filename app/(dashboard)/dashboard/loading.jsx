function Skeleton({ className }) {
    return (
      <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />
    );
  }
  
  function StatCardSkeleton() {
    return (
      <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
        <Skeleton className="h-2.5 w-24 mb-2" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-2.5 w-36" />
      </div>
    );
  }
  
  function ChartSkeleton({ height = 260 }) {
    return (
      <div className="relative w-full" style={{ height }}>
        <div className="absolute inset-0 flex items-end gap-2 px-2 pb-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <Skeleton
                className="w-full rounded-t-lg"
                style={{ height: `${20 + Math.random() * 60}%` }}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m) => (
            <Skeleton key={m} className="h-2 w-5" />
          ))}
        </div>
      </div>
    );
  }
  
  function AreaChartSkeleton({ height = 260 }) {
    return (
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <Skeleton className="absolute inset-0 rounded-xl opacity-30" />
        <div className="absolute bottom-6 left-0 right-0 flex items-end gap-0 px-2">
          {Array.from({ length: 12 }).map((_, i) => {
            const h = 30 + ((Math.sin(i * 0.8) + 1) / 2) * 55;
            return (
              <div key={i} className="flex-1 flex flex-col justify-end">
                <Skeleton className="w-full rounded-t" style={{ height: `${h}%` }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  function QuickActionSkeleton() {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
        <Skeleton className="h-3.5 w-36" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-8 rounded-full" />
          <Skeleton className="h-3.5 w-3.5 rounded" />
        </div>
      </div>
    );
  }
  
  function CategoryRowSkeleton() {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-2.5 w-20" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-1 w-14 rounded-full" />
          <Skeleton className="h-2.5 w-8" />
        </div>
      </div>
    );
  }
  
  export default function DashboardLoading() {
    return (
      <div className="space-y-0">
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="space-y-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20 rounded-xl" />
                <Skeleton className="h-8 w-28 rounded-xl" />
              </div>
            </div>
            <AreaChartSkeleton height={260} />
          </div>
  
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="mb-4 space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="flex items-center justify-center my-4">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
            <div className="space-y-2.5 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CategoryRowSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="flex items-start justify-between mb-5">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-3 w-52" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-20 rounded-xl" />
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-sm" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3 rounded-sm" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            </div>
            <ChartSkeleton height={240} />
          </div>
  
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <div className="mb-5 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <QuickActionSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }