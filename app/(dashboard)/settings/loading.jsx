function SkeletonBox({ className }) {
  return <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />;
}

function SidebarItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
      <SkeletonBox className="h-4 w-4 rounded-lg" />
      <SkeletonBox className="h-3.5 w-28" />
    </div>
  );
}

export default function SettingsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBox className="h-7 w-28" />
          <SkeletonBox className="h-4 w-56" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="rounded-2xl p-4 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] space-y-1">
          <SidebarItemSkeleton />
          <SidebarItemSkeleton />
          <SidebarItemSkeleton />
          <SidebarItemSkeleton />
          <SidebarItemSkeleton />
          <SidebarItemSkeleton />
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] p-6 space-y-6">
          <div className="space-y-2">
            <SkeletonBox className="h-5 w-40" />
            <SkeletonBox className="h-3 w-64" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonBox className="h-3 w-24" />
                <SkeletonBox className="h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => <SkeletonBox key={i} className="h-16 rounded-xl" />)}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <SkeletonBox className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}