"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Scale, CheckCircle, ArrowUpCircle,
  Clock, SlidersHorizontal, X, Eye, Trash2,
  DollarSign, TrendingUp, BarChart2,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import DisputeTable from "@/components/disputes/DisputeTable";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import { fetchDisputes, removeDispute } from "@/store/actions/disputesActions";
import { dummyDisputeStats, disputeTypeOptions, disputePriorityOptions, disputeStatusOptions } from "@/data/dummyDisputes";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const mainTabs = [
  { id: "all", label: "All Disputes", icon: Scale },
  { id: "open", label: "Open", icon: Clock },
  { id: "escalated", label: "Escalated", icon: ArrowUpCircle },
  { id: "resolved", label: "Resolved", icon: CheckCircle },
];

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  ...disputeStatusOptions.map((s) => ({ value: s.value, label: s.label })),
];

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  ...disputeTypeOptions.map((t) => ({ value: t.value, label: t.label })),
];

const priorityFilterOptions = [
  { value: "all", label: "All Priorities" },
  ...disputePriorityOptions.map((p) => ({ value: p.value, label: p.label })),
];

export default function DisputesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { disputes, isLoading } = useSelector((state) => state.disputes);
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { dispatch(fetchDisputes()); }, [dispatch]);

  const all = Array.isArray(disputes) ? disputes.filter(Boolean) : [];

  const tabFiltered = (() => {
    if (activeTab === "all") return all;
    if (activeTab === "open") return all.filter((d) => d.status === "open");
    if (activeTab === "escalated") return all.filter((d) => d.status === "escalated");
    if (activeTab === "resolved") return all.filter((d) => d.status === "resolved");
    return all;
  })();

  const { query, setQuery, results: searched } = useSearch(tabFiltered, [
    "title", "description", "type", "orderId", "buyer.name", "seller.name",
  ]);

  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all",
    type: "all",
    priority: "all",
  });

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.priority !== "all" ||
    query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    const res = await dispatch(removeDispute(id));
    setIsDeleting(false);
    if (res?.success) toast.success("Dispute deleted");
    else toast.error("Failed to delete dispute");
    setDeleteDialog({ open: false, item: null });
  };

  const tabCounts = {
    all: all.length,
    open: all.filter((d) => d.status === "open").length,
    escalated: all.filter((d) => d.status === "escalated").length,
    resolved: all.filter((d) => d.status === "resolved").length,
  };

  const stats = dummyDisputeStats;

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader title="Disputes" description="Manage buyer-seller disputes and resolutions">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          {
            title: "Total Disputes",
            value: stats.total,
            icon: Scale,
            color: "rgba(15,105,176,0.08)",
            iconColor: "#0F69B0",
          },
          {
            title: "Open",
            value: stats.open,
            icon: Clock,
            color: "rgba(245,158,11,0.08)",
            iconColor: "#f59e0b",
          },
          {
            title: "Escalated",
            value: stats.escalated,
            icon: ArrowUpCircle,
            color: "rgba(239,68,68,0.08)",
            iconColor: "#ef4444",
          },
          {
            title: "Resolved",
            value: stats.resolved,
            icon: CheckCircle,
            color: "rgba(16,185,129,0.08)",
            iconColor: "#10b981",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: stat.color }}>
                <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
              </div>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
            <p className="text-2xl font-black text-foreground">
              <AnimatedCounter value={stat.value} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Amount in Dispute", value: stats.totalAmount, prefix: "$", icon: DollarSign, color: "#0F69B0" },
          { label: "Avg Resolution Time", value: stats.avgResolutionDays, suffix: " days", icon: TrendingUp, color: "#7c3aed" },
          { label: "Resolution Rate", value: stats.resolutionRate, suffix: "%", icon: BarChart2, color: "#10b981" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex items-center gap-4"
          >
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${item.color}15` }}>
              <item.icon className="h-5 w-5" style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-xl font-black text-foreground">
                <AnimatedCounter value={item.value} prefix={item.prefix || ""} suffix={item.suffix || ""} />
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setQuery(""); resetFilters(); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 relative",
                    activeTab === tab.id
                      ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                    activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground"
                  )}>
                    {tabCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search disputes by title, order, buyer, seller..." />
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
                  <FilterDropdown label="Type" value={filters.type || "all"} options={typeFilterOptions} onChange={(v) => updateFilter("type", v)} />
                  <FilterDropdown label="Priority" value={filters.priority || "all"} options={priorityFilterOptions} onChange={(v) => updateFilter("priority", v)} />
                  {hasActiveFilters && (
                    <button onClick={() => { resetFilters(); setQuery(""); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                      <X className="h-3.5 w-3.5" />Clear All
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
            <LoadingSpinner size="lg" text="Loading disputes..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="No disputes found"
              description={hasActiveFilters ? "Try adjusting your search or filters" : "No disputes have been filed yet"}
            />
          ) : (
            <>
              <DisputeTable
                disputes={paginatedData}
                onView={(d) => router.push(`/disputes/${d.id}`)}
                onDelete={(d) => setDeleteDialog({ open: true, item: d })}
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
        title="Delete Dispute"
        description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}