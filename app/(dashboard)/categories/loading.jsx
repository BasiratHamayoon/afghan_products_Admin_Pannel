import { FolderTree } from "lucide-react";

function SkeletonBox({ className }) {
  return (
    <div
      className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`}
    />
  );
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
      <SkeletonBox className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBox className="h-3.5 w-36" />
        <SkeletonBox className="h-2.5 w-24" />
      </div>
      <SkeletonBox className="h-6 w-16 rounded-full" />
      <SkeletonBox className="h-6 w-14 rounded-full" />
      <SkeletonBox className="h-3.5 w-20" />
      <SkeletonBox className="h-3.5 w-20" />
      <div className="flex items-center gap-1">
        <SkeletonBox className="h-8 w-8 rounded-lg" />
        <SkeletonBox className="h-8 w-8 rounded-lg" />
        <SkeletonBox className="h-8 w-8 rounded-lg" />
        <SkeletonBox className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

function TreeNodeSkeleton({ indent = 0 }) {
  return (
    <div
      className="flex items-center gap-2 py-2"
      style={{ paddingLeft: `${12 + indent * 16}px` }}
    >
      <SkeletonBox className="h-4 w-4 rounded" />
      <SkeletonBox className="h-7 w-7 rounded-lg shrink-0" />
      <div className="flex-1 space-y-1.5">
        <SkeletonBox className="h-3 w-28" />
        <SkeletonBox className="h-2 w-20" />
      </div>
    </div>
  );
}

export default function CategoriesLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <SkeletonBox className="h-7 w-40" />
          <SkeletonBox className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBox className="h-10 w-28 rounded-xl" />
          <SkeletonBox className="h-10 w-36 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-1 rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center">
                <FolderTree className="h-3.5 w-3.5 text-[#0F69B0]" />
              </div>
              <SkeletonBox className="h-4 w-28" />
            </div>
            <SkeletonBox className="h-7 w-7 rounded-lg" />
          </div>
          <div className="space-y-0.5">
            <TreeNodeSkeleton indent={0} />
            <TreeNodeSkeleton indent={0} />
            <TreeNodeSkeleton indent={0} />
            <TreeNodeSkeleton indent={1} />
            <TreeNodeSkeleton indent={0} />
            <TreeNodeSkeleton indent={1} />
          </div>
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
          <div className="p-5 border-b border-gray-50 dark:border-white/[0.04]">
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-10 flex-1 rounded-xl" />
              <SkeletonBox className="h-10 w-28 rounded-xl" />
              <SkeletonBox className="h-10 w-20 rounded-xl" />
            </div>
          </div>

          <div className="p-5">
            <div className="border-b-2 border-gray-50 dark:border-white/[0.04] mb-1">
              <div className="flex items-center gap-4 py-3 px-4">
                <SkeletonBox className="h-3 w-8" />
                <SkeletonBox className="h-3 w-36" />
                <SkeletonBox className="h-3 w-16" />
                <SkeletonBox className="h-3 w-16" />
                <SkeletonBox className="h-3 w-14" />
                <SkeletonBox className="h-3 w-20" />
                <SkeletonBox className="h-3 w-20" />
              </div>
            </div>
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <TableRowSkeleton />
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.04] flex items-center justify-between">
              <SkeletonBox className="h-4 w-48" />
              <div className="flex items-center gap-1">
                <SkeletonBox className="h-8 w-8 rounded-lg" />
                <SkeletonBox className="h-8 w-8 rounded-lg" />
                <SkeletonBox className="h-8 w-8 rounded-lg" />
                <SkeletonBox className="h-8 w-8 rounded-lg" />
                <SkeletonBox className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}