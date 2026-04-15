"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Clock, CheckCircle, UserCheck,
  SlidersHorizontal, X, AlertTriangle,
} from "lucide-react";
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
import { fetchRequests, removeRequest } from "@/store/actions/consultingActions";
import { priorityOptions, consultingCategoryOptions } from "@/data/dummyConsulting";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const priorityFilterOptions = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const categoryFilterOptions = [
  { value: "all", label: "All Categories" },
  ...consultingCategoryOptions.map((c) => ({ value: c.value, label: c.label })),
];

const priorityColors = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
const priorityBg = { high: "rgba(239,68,68,0.1)", medium: "rgba(245,158,11,0.1)", low: "rgba(16,185,129,0.1)" };

const requestStatusMap = {
  pending: "pending",
  assigned: "active",
  completed: "completed",
  cancelled: "inactive",
};

export default function RequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { requests, isLoading } = useSelector((state) => state.consulting);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchRequests());
  }, [dispatch]);

  const allRequests = Array.isArray(requests) ? requests.filter(Boolean) : [];

  const { query, setQuery, results: searched } = useSearch(allRequests, ["title", "description", "category", "requestedBy.name"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all",
    priority: "all",
  });

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.priority !== "all" ||
    query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeRequest(id));
      if (res?.success) toast.success("Request deleted successfully");
      else toast.error("Failed to delete request");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, item: null }); }
  };

  const pendingCount = allRequests.filter((r) => r.status === "pending").length;
  const assignedCount = allRequests.filter((r) => r.status === "assigned").length;
  const completedCount = allRequests.filter((r) => r.status === "completed").length;
  const highPriorityCount = allRequests.filter((r) => r.priority === "high").length;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Consulting Requests" description="Manage incoming consulting requests from clients">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Requests" value={allRequests.length} icon={MessageSquare} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Pending" value={pendingCount} icon={Clock} color="rgba(245,158,11,0.08)" index={1} />
        <StatsCard title="Assigned" value={assignedCount} icon={UserCheck} color="rgba(99,102,241,0.08)" index={2} />
        <StatsCard title="High Priority" value={highPriorityCount} icon={AlertTriangle} color="rgba(239,68,68,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search requests..." />
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
                  <FilterDropdown label="Priority" value={filters.priority || "all"} options={priorityFilterOptions} onChange={(v) => updateFilter("priority", v)} />
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
            <LoadingSpinner size="lg" text="Loading requests..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No requests found"
              description={hasActiveFilters ? "Try adjusting your search or filters" : "No consulting requests have been submitted yet"}
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
              <div className="space-y-3">
                {paginatedData.map((req, i) => (
                  <RequestCard
                    key={req.id}
                    request={req}
                    index={i}
                    onView={() => router.push(`/consulting/requests/${req.id}`)}
                    onDelete={() => setDeleteDialog({ open: true, item: req })}
                  />
                ))}
              </div>
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
        title="Delete Request"
        description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

function RequestCard({ request, index, onView, onDelete }) {
  const req = request;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 dark:hover:border-[#0F69B0]/15 transition-all shadow-[0_1px_6px_rgba(15,105,176,0.04)] p-5"
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
          <MessageSquare className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="text-sm font-black text-foreground truncate mb-0.5">{req.title}</h3>
              <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                {req.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                style={{ background: priorityBg[req.priority], color: priorityColors[req.priority] }}
              >
                {req.priority}
              </span>
              <StatusBadge status={requestStatusMap[req.status] || "pending"} />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap mb-3">
            <span className="text-[11px] text-muted-foreground font-medium">
              By: <span className="font-bold text-foreground">{req.requestedBy?.name}</span>
            </span>
            {req.requestedBy?.company && (
              <span className="text-[11px] text-muted-foreground font-medium">
                {req.requestedBy.company}
              </span>
            )}
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-[#0F69B0]/8 text-[#0F69B0]">
              {req.category}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              Budget: <span className="font-bold text-foreground">${req.budget}</span>
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              ~{req.estimatedHours}h
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {req.assignedConsultant ? (
                <span className="text-[11px] text-green-600 dark:text-green-400 font-bold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Assigned to {req.assignedConsultant.name}
                </span>
              ) : (
                <span className="text-[11px] text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Unassigned
                </span>
              )}
              {req.deadline && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  Deadline: {formatDate(req.deadline)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onView}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                title="View"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onDelete}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}