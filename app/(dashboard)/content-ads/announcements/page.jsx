"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, Megaphone, Pin, Eye, AlertTriangle, SlidersHorizontal, X, Edit2, Trash2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import StatusBadge from "@/components/common/StatusBadge";
import { fetchAnnouncements, removeAnnouncement, editAnnouncement } from "@/store/actions/contentActions";
import { announcementTypeOptions } from "@/data/dummyContent";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "scheduled", label: "Scheduled" },
];

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  ...announcementTypeOptions.map((t) => ({ value: t.value, label: t.label })),
];

const priorityColors = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

export default function AnnouncementsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { announcements, isLoading } = useSelector((state) => state.content);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const all = Array.isArray(announcements) ? announcements.filter(Boolean) : [];
  const { query, setQuery, results: searched } = useSearch(all, ["title", "content", "type"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { status: "all", type: "all" });
  const hasActiveFilters = filters.status !== "all" || filters.type !== "all" || query.trim() !== "";
  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 8);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    const res = await dispatch(removeAnnouncement(id));
    setIsDeleting(false);
    if (res?.success) toast.success("Announcement deleted");
    else toast.error("Failed to delete");
    setDeleteDialog({ open: false, item: null });
  };

  const handleTogglePinned = async (ann) => {
    await dispatch(editAnnouncement(ann.id, { ...ann, isPinned: !ann.isPinned }));
    toast.success(ann.isPinned ? "Unpinned" : "Pinned");
  };

  const pinnedCount = all.filter((a) => a.isPinned).length;
  const activeCount = all.filter((a) => a.status === "active").length;
  const highPriorityCount = all.filter((a) => a.priority === "high").length;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Announcements" description="Manage platform-wide announcements and notices">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/content-ads/announcements/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            New Announcement
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total" value={all.length} icon={Megaphone} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Active" value={activeCount} icon={Eye} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Pinned" value={pinnedCount} icon={Pin} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title="High Priority" value={highPriorityCount} icon={AlertTriangle} color="rgba(239,68,68,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search announcements..." />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                showFilters || hasActiveFilters
                  ? "border-[#0F69B0] bg-[#0F69B0]/8 text-[#0F69B0]"
                  : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/30 hover:text-[#0F69B0]"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {hasActiveFilters && <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>}
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <FilterDropdown label="Status" value={filters.status || "all"} options={statusFilterOptions} onChange={(v) => updateFilter("status", v)} />
                  <FilterDropdown label="Type" value={filters.type || "all"} options={typeFilterOptions} onChange={(v) => updateFilter("type", v)} />
                  {hasActiveFilters && (
                    <button onClick={() => { resetFilters(); setQuery(""); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                      <X className="h-3.5 w-3.5" />Clear All
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground font-medium ml-auto">{filteredData.length} result{filteredData.length !== 1 ? "s" : ""}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading announcements..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No announcements found"
              description={hasActiveFilters ? "Try adjusting your search or filters" : "Create your first announcement"}
              action={
                <button onClick={() => router.push("/content-ads/announcements/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  <Plus className="h-4 w-4" />New Announcement
                </button>
              }
            />
          ) : (
            <>
              <div className="space-y-3">
                {paginatedData.map((ann, i) => {
                  const typeOpt = announcementTypeOptions.find((t) => t.value === ann.type);
                  return (
                    <motion.div
                      key={ann.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all shadow-[0_1px_6px_rgba(15,105,176,0.04)] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${typeOpt?.color || "#0F69B0"}15` }}>
                          <Megaphone className="h-4 w-4" style={{ color: typeOpt?.color || "#0F69B0" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <h3 className="text-sm font-black text-foreground truncate">{ann.title}</h3>
                              {ann.isPinned && <Pin className="h-3 w-3 text-[#0F69B0] shrink-0" />}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${typeOpt?.color}15`, color: typeOpt?.color }}>{typeOpt?.label}</span>
                              <StatusBadge status={ann.status} />
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 mb-2">{ann.content}</p>
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium flex-wrap">
                              <span>By: <span className="font-bold text-foreground">{ann.author?.name}</span></span>
                              <span>{(ann.views || 0).toLocaleString()} views</span>
                              <span>{formatDate(ann.startDate)} → {formatDate(ann.endDate)}</span>
                              <span className="capitalize font-bold" style={{ color: priorityColors[ann.priority] }}>● {ann.priority}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleTogglePinned(ann)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Pin">
                                <Pin className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => router.push(`/content-ads/announcements/${ann.id}`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="View">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => router.push(`/content-ads/announcements/${ann.id}?tab=Edit`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit">
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setDeleteDialog({ open: true, item: ann })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDelete}
        title="Delete Announcement" description={`Are you sure you want to delete "${deleteDialog.item?.title}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}