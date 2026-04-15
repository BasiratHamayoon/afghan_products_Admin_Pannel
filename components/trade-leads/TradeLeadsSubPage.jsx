"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import TradeLeadTable from "@/components/trade-leads/TradeLeadTable";
import TradeLeadFilter from "@/components/trade-leads/TradeLeadFilter";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import {
  fetchTradeLeads, removeTradeLead, editTradeLead,
  approveTradeLead, closeTradeLead,
} from "@/store/actions/tradeLeadsActions";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import toast from "react-hot-toast";

export default function TradeLeadsSubPage({ type, title, description }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { tradeLeads, isLoading } = useSelector((state) => state.tradeLeads);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, lead: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchTradeLeads());
  }, [dispatch]);

  const safe = Array.isArray(tradeLeads) ? tradeLeads.filter(Boolean) : [];
  const typeFiltered = useMemo(
    () => safe.filter((l) => l.type === type),
    [safe, type]
  );

  const { query, setQuery, results: searched } = useSearch(typeFiltered, [
    "title", "slug", "category", "user.name", "deliveryLocation",
  ]);

  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all", category: "all", priority: "all",
  });

  const sorted = useMemo(() => {
    const arr = [...filteredData];
    switch (sortBy) {
      case "oldest": return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "budgetHigh": return arr.sort((a, b) => (b.budget || 0) - (a.budget || 0));
      case "budgetLow": return arr.sort((a, b) => (a.budget || 0) - (b.budget || 0));
      case "responses": return arr.sort((a, b) => (b.responses || 0) - (a.responses || 0));
      case "views": return arr.sort((a, b) => (b.views || 0) - (a.views || 0));
      default: return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [filteredData, sortBy]);

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.priority !== "all" ||
    query.trim() !== "";

  const {
    currentPage, totalPages, paginatedData,
    goToPage, from, to, total,
  } = usePagination(sorted, 10);

  const handleDelete = async () => {
    const id = deleteDialog?.lead?.id;
    if (!id) { setDeleteDialog({ open: false, lead: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeTradeLead(id));
      if (res?.success) toast.success("Lead deleted");
      else toast.error("Failed to delete");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, lead: null }); }
  };

  const handleView = (l) => { if (l?.id) router.push(`/trade-leads/${l.id}`); };
  const handleEdit = (l) => { if (l?.id) router.push(`/trade-leads/${l.id}?tab=edit`); };
  const handleDeleteOpen = (l) => { if (l?.id) setDeleteDialog({ open: true, lead: l }); };
  const handleApprove = async (l) => {
    if (!l?.id) return;
    const res = await dispatch(approveTradeLead(l.id));
    if (res?.success) toast.success("Lead approved");
    else toast.error("Failed to approve");
  };
  const handleClose = async (l) => {
    if (!l?.id) return;
    const res = await dispatch(closeTradeLead(l.id));
    if (res?.success) toast.success("Lead closed");
    else toast.error("Failed to close");
  };
  const handleToggleFeatured = async (l) => {
    if (!l?.id) return;
    await dispatch(editTradeLead(l.id, { ...l, featured: !l.featured }));
    toast.success(`${!l.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title={title}
        description={`${typeFiltered.length} ${description}`}
      >
        <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <TradeLeadFilter
            query={query}
            onQueryChange={(v) => { setQuery(v); goToPage(1); }}
            filters={filters}
            onFilterChange={(k, v) => { updateFilter(k, v); goToPage(1); }}
            onResetFilters={() => { resetFilters(); setQuery(""); goToPage(1); }}
            hasActiveFilters={hasActiveFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            sortBy={sortBy}
            onSortChange={(v) => { setSortBy(v); goToPage(1); }}
            resultCount={sorted.length}
          />
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading leads..." className="py-16" />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title={`No ${type} leads found`}
              description={
                hasActiveFilters
                  ? "Try adjusting your filters"
                  : `${type === "buy" ? "Buy" : "Sell"} leads submitted by users will appear here`
              }
              action={
                hasActiveFilters ? (
                  <button
                    onClick={() => { resetFilters(); setQuery(""); goToPage(1); }}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <TradeLeadTable
                leads={paginatedData}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteOpen}
                onApprove={handleApprove}
                onClose={handleClose}
                onToggleFeatured={handleToggleFeatured}
              />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  from={from}
                  to={to}
                  total={total}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, lead: null })}
        onConfirm={handleDelete}
        title="Delete Trade Lead"
        description={
          deleteDialog.lead
            ? `Delete "${deleteDialog.lead.title}"? This cannot be undone.`
            : "Are you sure?"
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}