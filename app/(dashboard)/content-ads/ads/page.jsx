"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, TrendingUp, Eye, MousePointer,
  DollarSign, SlidersHorizontal, X,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AdManager from "@/components/content/AdManager";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import { fetchAds, removeAd, editAd } from "@/store/actions/contentActions";
import { adTypeOptions, adPlacementOptions } from "@/data/dummyContent";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "scheduled", label: "Scheduled" },
  { value: "expired", label: "Expired" },
];

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  ...adTypeOptions.map((t) => ({ value: t.value, label: t.label })),
];

const placementFilterOptions = [
  { value: "all", label: "All Placements" },
  ...adPlacementOptions.map((p) => ({ value: p.value, label: p.label })),
];

export default function AdsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { ads, isLoading } = useSelector((state) => state.content);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchAds());
  }, [dispatch]);

  const all = Array.isArray(ads) ? ads.filter(Boolean) : [];

  const { query, setQuery, results: searched } = useSearch(all, [
    "title", "description", "type", "placement",
  ]);

  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all",
    type: "all",
    placement: "all",
  });

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.type !== "all" ||
    filters.placement !== "all" ||
    query.trim() !== "";

  const {
    currentPage, totalPages, paginatedData,
    goToPage, from, to, total,
  } = usePagination(filteredData, 8);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    const res = await dispatch(removeAd(id));
    setIsDeleting(false);
    if (res?.success) toast.success("Ad deleted successfully");
    else toast.error("Failed to delete ad");
    setDeleteDialog({ open: false, item: null });
  };

  const handleToggleStatus = async (ad) => {
    const newStatus = ad.status === "active" ? "paused" : "active";
    await dispatch(editAd(ad.id, { ...ad, status: newStatus }));
    toast.success(`Ad ${newStatus === "active" ? "activated" : "paused"}`);
  };

  const activeCount = all.filter((a) => a.status === "active").length;
  const totalClicks = all.reduce((acc, a) => acc + (a.clicks || 0), 0);
  const totalRevenue = all.reduce((acc, a) => acc + (a.spent || 0), 0);

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title="Advertisements"
        description="Manage sponsored ads and promotional campaigns"
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/content-ads/ads/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Create Ad
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title="Total Ads"
          value={all.length}
          icon={TrendingUp}
          color="rgba(15,105,176,0.08)"
          index={0}
        />
        <StatsCard
          title="Active Ads"
          value={activeCount}
          icon={Eye}
          color="rgba(16,185,129,0.08)"
          index={1}
        />
        <StatsCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointer}
          color="rgba(124,58,237,0.08)"
          index={2}
        />
        <StatsCard
          title="Total Spent"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="rgba(245,158,11,0.08)"
          index={3}
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search ads..."
              />
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
                <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">
                  !
                </span>
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
                  <FilterDropdown
                    label="Status"
                    value={filters.status || "all"}
                    options={statusFilterOptions}
                    onChange={(v) => updateFilter("status", v)}
                  />
                  <FilterDropdown
                    label="Type"
                    value={filters.type || "all"}
                    options={typeFilterOptions}
                    onChange={(v) => updateFilter("type", v)}
                  />
                  <FilterDropdown
                    label="Placement"
                    value={filters.placement || "all"}
                    options={placementFilterOptions}
                    onChange={(v) => updateFilter("placement", v)}
                  />
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

        {/* Content */}
        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading ads..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No ads found"
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Create your first ad campaign to get started"
              }
              action={
                <button
                  onClick={() => router.push("/content-ads/ads/add")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                >
                  <Plus className="h-4 w-4" />
                  Create Ad
                </button>
              }
            />
          ) : (
            <>
              <AdManager
                ads={paginatedData}
                // ✅ View → goes to detail page Overview tab
                onView={(ad) => router.push(`/content-ads/ads/${ad.id}`)}
                // ✅ Edit → goes to detail page Edit tab directly
                onEdit={(ad) => router.push(`/content-ads/ads/${ad.id}?tab=Edit`)}
                onDelete={(ad) => setDeleteDialog({ open: true, item: ad })}
                onToggleStatus={handleToggleStatus}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
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
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Ad"
        description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}