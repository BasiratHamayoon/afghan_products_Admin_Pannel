"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { CheckCircle, DollarSign, TrendingUp, SlidersHorizontal, X } from "lucide-react";
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
import { disputeTypeOptions } from "@/data/dummyDisputes";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  ...disputeTypeOptions.map((t) => ({ value: t.value, label: t.label })),
];

export default function ResolvedDisputesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { disputes, isLoading } = useSelector((state) => state.disputes);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { dispatch(fetchDisputes()); }, [dispatch]);

  const resolvedDisputes = (Array.isArray(disputes) ? disputes.filter(Boolean) : []).filter((d) => d.status === "resolved");

  const { query, setQuery, results: searched } = useSearch(resolvedDisputes, ["title", "orderId", "buyer.name", "seller.name"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { type: "all" });

  const hasActiveFilters = filters.type !== "all" || query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    const res = await dispatch(removeDispute(id));
    setIsDeleting(false);
    if (res?.success) toast.success("Dispute deleted");
    else toast.error("Failed to delete");
    setDeleteDialog({ open: false, item: null });
  };

  const totalRefunded = resolvedDisputes.reduce((acc, d) => acc + (d.refundAmount || 0), 0);
  const withRefund = resolvedDisputes.filter((d) => d.refundAmount > 0).length;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Resolved Disputes" description="All successfully resolved dispute cases">
        <div className="flex items-center gap-2">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Resolved", value: resolvedDisputes.length, icon: CheckCircle, color: "rgba(16,185,129,0.08)", iconColor: "#10b981" },
          { title: "With Refunds", value: withRefund, icon: TrendingUp, color: "rgba(15,105,176,0.08)", iconColor: "#0F69B0" },
          { title: "Total Refunded", value: totalRefunded, prefix: "$", icon: DollarSign, color: "rgba(16,185,129,0.08)", iconColor: "#10b981" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
          >
            <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.color }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.title}</p>
            <p className="text-2xl font-black text-foreground">
              <AnimatedCounter value={stat.value} prefix={stat.prefix || ""} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search resolved disputes..." />
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
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {hasActiveFilters && <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>}
            </button>
          </div>
          {showFilters && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <FilterDropdown label="Type" value={filters.type || "all"} options={typeFilterOptions} onChange={(v) => updateFilter("type", v)} />
              {hasActiveFilters && (
                <button onClick={() => { resetFilters(); setQuery(""); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                  <X className="h-3.5 w-3.5" />Clear All
                </button>
              )}
              <p className="text-[11px] text-muted-foreground font-medium ml-auto">{filteredData.length} result{filteredData.length !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading resolved disputes..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState icon={CheckCircle} title="No resolved disputes" description={hasActiveFilters ? "Try adjusting your filters" : "No disputes have been resolved yet"} />
          ) : (
            <>
              <DisputeTable disputes={paginatedData} onView={(d) => router.push(`/disputes/${d.id}`)} onDelete={(d) => setDeleteDialog({ open: true, item: d })} />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDelete} title="Delete Dispute" description={`Delete "${deleteDialog.item?.title}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}