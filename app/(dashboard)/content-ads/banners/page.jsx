"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, Image, Star, Eye, SlidersHorizontal, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import BannerManager from "@/components/content/BannerManager";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import { fetchBanners, removeBanner, editBanner } from "@/store/actions/contentActions";
import { bannerPositionOptions, targetAudienceOptions } from "@/data/dummyContent";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "scheduled", label: "Scheduled" },
];

const positionFilterOptions = [
  { value: "all", label: "All Positions" },
  ...bannerPositionOptions.map((p) => ({ value: p.value, label: p.label })),
];

export default function BannersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { banners, isLoading } = useSelector((state) => state.content);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { dispatch(fetchBanners()); }, [dispatch]);

  const all = Array.isArray(banners) ? banners.filter(Boolean) : [];
  const { query, setQuery, results: searched } = useSearch(all, ["title", "description", "link"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { status: "all", position: "all" });

  const hasActiveFilters = filters.status !== "all" || filters.position !== "all" || query.trim() !== "";
  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 8);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    const res = await dispatch(removeBanner(id));
    setIsDeleting(false);
    if (res?.success) toast.success("Banner deleted");
    else toast.error("Failed to delete banner");
    setDeleteDialog({ open: false, item: null });
  };

  const handleToggleStatus = async (banner) => {
    const newStatus = banner.status === "active" ? "inactive" : "active";
    await dispatch(editBanner(banner.id, { ...banner, status: newStatus }));
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleToggleFeatured = async (banner) => {
    await dispatch(editBanner(banner.id, { ...banner, featured: !banner.featured }));
    toast.success(`${!banner.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  const activeCount = all.filter((b) => b.status === "active").length;
  const featuredCount = all.filter((b) => b.featured).length;
  const totalImpressions = all.reduce((acc, b) => acc + (b.impressions || 0), 0);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Banners" description="Manage promotional banners across the platform">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/content-ads/banners/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Banners" value={all.length} icon={Image} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Active" value={activeCount} icon={Eye} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Featured" value={featuredCount} icon={Star} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title="Total Impressions" value={totalImpressions.toLocaleString()} icon={Eye} color="rgba(124,58,237,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search banners..." />
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
                  <FilterDropdown label="Position" value={filters.position || "all"} options={positionFilterOptions} onChange={(v) => updateFilter("position", v)} />
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
            <LoadingSpinner size="lg" text="Loading banners..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState icon={Image} title="No banners found" description={hasActiveFilters ? "Try adjusting your search or filters" : "Create your first banner to get started"}
              action={<button onClick={() => router.push("/content-ads/banners/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><Plus className="h-4 w-4" />Add Banner</button>}
            />
          ) : (
            <>
              <BannerManager banners={paginatedData}
                onView={(b) => router.push(`/content-ads/banners/${b.id}`)}
                onEdit={(b) => router.push(`/content-ads/banners/${b.id}?tab=Edit`)}
                onDelete={(b) => setDeleteDialog({ open: true, item: b })}
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

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDelete}
        title="Delete Banner" description={`Are you sure you want to delete "${deleteDialog.item?.title}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}