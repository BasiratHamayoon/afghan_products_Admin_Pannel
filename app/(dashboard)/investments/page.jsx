// app/(dashboard)/investments/page.jsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, BarChart3, List, Grid3X3,
  TrendingUp, DollarSign, Users, Target,
  SlidersHorizontal, X,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import InvestmentTable from "@/components/investments/InvestmentTable";
import InvestmentStats from "@/components/investments/InvestmentStats";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import StatusBadge from "@/components/common/StatusBadge";
import { fetchInvestments, removeInvestment, editInvestment } from "@/store/actions/investmentsActions";
import { dummyInvestmentStats, investmentTypeOptions } from "@/data/dummyInvestments";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Edit2, Eye, Trash2, Star, StarOff } from "lucide-react";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  ...investmentTypeOptions.map((t) => ({ value: t.value, label: t.label })),
];

const riskFilterOptions = [
  { value: "all", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
];

const priorityFilterOptions = [
  { value: "all", label: "All Priorities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const featuredFilterOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "Featured Only" },
  { value: "false", label: "Not Featured" },
];

const mainTabs = [
  { id: "all", label: "All Investments" },
  { id: "active", label: "Active" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export default function InvestmentsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { investments, isLoading } = useSelector((state) => state.investments);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, investment: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchInvestments());
  }, [dispatch]);

  const allItems = Array.isArray(investments) ? investments.filter(Boolean) : [];

  const tabFiltered = activeTab === "all" ? allItems : allItems.filter((inv) => inv.status === activeTab);

  const { query, setQuery, results: searched } = useSearch(tabFiltered, ["title", "slug", "description", "location", "category", "investor.name"]);

  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all",
    type: "all",
    riskLevel: "all",
    priority: "all",
    featured: "all",
  });

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.riskLevel !== "all" ||
    filters.priority !== "all" ||
    filters.featured !== "all" ||
    query.trim() !== "";

  const {
    currentPage, totalPages, paginatedData,
    goToPage, from, to, total,
  } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    const invId = deleteDialog?.investment?.id;
    if (!invId) { setDeleteDialog({ open: false, investment: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeInvestment(invId));
      if (res?.success) toast.success("Investment deleted successfully");
      else toast.error("Failed to delete investment");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, investment: null }); }
  };

  const handleToggleFeatured = async (inv) => {
    if (!inv?.id) return;
    await dispatch(editInvestment(inv.id, { ...inv, featured: !inv.featured }));
    toast.success(`${!inv.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  const handleToggleStatus = async (inv) => {
    if (!inv?.id) return;
    const newStatus = inv.status === "active" ? "pending" : "active";
    await dispatch(editInvestment(inv.id, { ...inv, status: newStatus }));
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleView = (inv) => { if (inv?.id) router.push(`/investments/${inv.id}`); };
  const handleEdit = (inv) => { if (inv?.id) router.push(`/investments/${inv.id}`); };
  const handleDeleteOpen = (inv) => { if (inv?.id) setDeleteDialog({ open: true, investment: inv }); };

  const stats = dummyInvestmentStats || {};

  const tabCounts = {
    all: allItems.length,
    active: allItems.filter((inv) => inv.status === "active").length,
    pending: allItems.filter((inv) => inv.status === "pending").length,
    completed: allItems.filter((inv) => inv.status === "completed").length,
    cancelled: allItems.filter((inv) => inv.status === "cancelled").length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader title="Investments" description="Manage all investment opportunities and portfolios">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/investments/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Investment
          </motion.button>
        </div>
      </PageHeader>

      <InvestmentStats stats={stats} />

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
            {mainTabs.map((tab) => (
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
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                    activeTab === tab.id
                      ? "bg-[#0F69B0] text-white"
                      : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground"
                  )}
                >
                  {tabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search investments..." />
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

            <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                title="Table view"
                className={cn(
                  "h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
                  viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={cn(
                  "h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
                  viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
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
                  <FilterDropdown label="Type" value={filters.type || "all"} options={typeFilterOptions} onChange={(v) => updateFilter("type", v)} />
                  <FilterDropdown label="Risk" value={filters.riskLevel || "all"} options={riskFilterOptions} onChange={(v) => updateFilter("riskLevel", v)} />
                  <FilterDropdown label="Priority" value={filters.priority || "all"} options={priorityFilterOptions} onChange={(v) => updateFilter("priority", v)} />
                  <FilterDropdown label="Featured" value={String(filters.featured || "all")} options={featuredFilterOptions} onChange={(v) => updateFilter("featured", v)} />
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
            <LoadingSpinner size="lg" text="Loading investments..." className="py-16" />
          ) : !filteredData || filteredData.length === 0 ? (
            <EmptyState
              icon={BarChart3}
              title="No investments found"
              description={hasActiveFilters ? "Try adjusting your search or filters" : "Create your first investment to get started"}
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {hasActiveFilters && (
                    <button
                      onClick={() => { resetFilters(); setQuery(""); }}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/investments/add")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Investment
                  </button>
                </div>
              }
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {paginatedData.map((inv, i) => (
                  <InvestmentGridCard
                    key={inv.id}
                    investment={inv}
                    index={i}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteOpen}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <InvestmentTable
                investments={paginatedData}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteOpen}
                onToggleStatus={handleToggleStatus}
                onToggleFeatured={handleToggleFeatured}
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
        onClose={() => setDeleteDialog({ open: false, investment: null })}
        onConfirm={handleDelete}
        title="Delete Investment"
        description={
          deleteDialog.investment
            ? `Are you sure you want to delete "${deleteDialog.investment.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this investment?"
        }
        confirmLabel="Delete Investment"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

function InvestmentGridCard({ investment, index, onView, onEdit, onDelete, onToggleFeatured }) {
  const inv = investment;
  const typeInfo = investmentTypeOptions.find((t) => t.value === inv.type) || { icon: "📦", label: inv.type, color: "#6b7280" };
  const pct = inv.targetAmount > 0 ? Math.min((inv.investedAmount / inv.targetAmount) * 100, 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-2xl p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.08)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: `${typeInfo.color}18` }}
        >
          {inv.image ? (
            <img src={inv.image} alt={inv.title} className="h-full w-full object-cover rounded-xl" />
          ) : typeInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="text-sm font-black text-foreground truncate">{inv.title}</p>
            {inv.featured && <span className="text-yellow-500 shrink-0">⭐</span>}
          </div>
          <p className="text-[10px] text-muted-foreground font-medium truncate">{inv.location}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <StatusBadge status={inv.status} />
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}
        >
          {typeInfo.label}
        </span>
        <span className="text-[10px] font-bold text-foreground ml-auto">{inv.roi}% ROI</span>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-foreground">${(inv.investedAmount / 1000).toFixed(0)}K</span>
          <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: typeInfo.color }} />
        </div>
        <p className="text-[9px] text-muted-foreground font-medium mt-0.5">of ${(inv.targetAmount / 1000).toFixed(0)}K target</p>
      </div>

      {inv.description && (
        <p className="text-[11px] text-muted-foreground font-medium mb-3 line-clamp-2 leading-relaxed">{inv.description}</p>
      )}

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium mb-3">
        <span>{inv.investorsCount} investors</span>
        <span>{inv.duration} {inv.durationUnit}</span>
        <span>{formatDate(inv.createdAt)}</span>
      </div>

      <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
        <button onClick={() => onView?.(inv)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer" title="View">
          <Eye className="h-3.5 w-3.5 mx-auto" />
        </button>
        <button onClick={() => onEdit?.(inv)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer" title="Edit">
          <Edit2 className="h-3.5 w-3.5 mx-auto" />
        </button>
        <button onClick={() => onToggleFeatured?.(inv)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer" title={inv.featured ? "Unfeature" : "Feature"}>
          {inv.featured ? <StarOff className="h-3.5 w-3.5 mx-auto" /> : <Star className="h-3.5 w-3.5 mx-auto" />}
        </button>
        <button onClick={() => onDelete?.(inv)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer" title="Delete">
          <Trash2 className="h-3.5 w-3.5 mx-auto" />
        </button>
      </div>
    </motion.div>
  );
}