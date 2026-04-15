"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Calendar, CheckCircle, Clock,
  DollarSign, SlidersHorizontal, X,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SessionTable from "@/components/consulting/SessionTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import { fetchSessions, removeSession } from "@/store/actions/consultingActions";
import { sessionFormatOptions } from "@/data/dummyConsulting";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const formatFilterOptions = [
  { value: "all", label: "All Formats" },
  ...sessionFormatOptions.map((f) => ({ value: f.value, label: f.label })),
];

const paymentFilterOptions = [
  { value: "all", label: "All Payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

export default function SessionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { sessions, isLoading } = useSelector((state) => state.consulting);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const allSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];

  const { query, setQuery, results: searched } = useSearch(allSessions, ["title", "consultantName", "clientName", "category"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all",
    format: "all",
    paymentStatus: "all",
  });

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.format !== "all" ||
    filters.paymentStatus !== "all" ||
    query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeSession(id));
      if (res?.success) toast.success("Session deleted successfully");
      else toast.error("Failed to delete session");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, item: null }); }
  };

  const completedCount = allSessions.filter((s) => s.status === "completed").length;
  const scheduledCount = allSessions.filter((s) => s.status === "scheduled").length;
  const totalRevenue = allSessions
    .filter((s) => s.paymentStatus === "paid")
    .reduce((acc, s) => acc + (s.price || 0), 0);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Sessions" description="Manage all consulting sessions and their statuses">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Sessions" value={allSessions.length} icon={Calendar} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Completed" value={completedCount} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Scheduled" value={scheduledCount} icon={Clock} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title="Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="rgba(124,58,237,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search sessions..." />
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
              {hasActiveFilters && (
                <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>
              )}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <FilterDropdown label="Status" value={filters.status || "all"} options={statusFilterOptions} onChange={(v) => updateFilter("status", v)} />
                  <FilterDropdown label="Format" value={filters.format || "all"} options={formatFilterOptions} onChange={(v) => updateFilter("format", v)} />
                  <FilterDropdown label="Payment" value={filters.paymentStatus || "all"} options={paymentFilterOptions} onChange={(v) => updateFilter("paymentStatus", v)} />
                  {hasActiveFilters && (
                    <button
                      onClick={() => { resetFilters(); setQuery(""); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear All
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground font-medium ml-auto">
                    {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading sessions..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No sessions found"
              description={hasActiveFilters ? "Try adjusting your search or filters" : "No sessions have been created yet"}
              action={
                hasActiveFilters ? (
                  <button
                    onClick={() => { resetFilters(); setQuery(""); }}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <SessionTable
                sessions={paginatedData}
                onView={(ses) => router.push(`/consulting/sessions/${ses.id}`)}
                onEdit={(ses) => router.push(`/consulting/sessions/${ses.id}?tab=Edit+Status`)}
                onDelete={(ses) => setDeleteDialog({ open: true, item: ses })}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Session"
        description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}