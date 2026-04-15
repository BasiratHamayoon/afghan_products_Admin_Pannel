  "use client";

  import { useState, useEffect } from "react";
  import { motion } from "framer-motion";
  import { useDispatch, useSelector } from "react-redux";
  import { useRouter } from "next/navigation";
  import {
    Plus, Users, Star, CheckCircle, TrendingUp,
    SlidersHorizontal, X, List, Grid3X3,
  } from "lucide-react";
  import PageHeader from "@/components/layout/PageHeader";
  import Breadcrumb from "@/components/layout/Breadcrumb";
  import ConsultantTable from "@/components/consulting/ConsultantTable";
  import StatsCard from "@/components/common/StatCard";
  import SearchInput from "@/components/common/SearchInput";
  import FilterDropdown from "@/components/common/FilterDropdown";
  import Pagination from "@/components/common/Pagination";
  import LoadingSpinner from "@/components/common/LoadingSpinner";
  import EmptyState from "@/components/common/EmptyState";
  import ConfirmDialog from "@/components/common/ConfirmDialog";
  import ExportButton from "@/components/common/ExportButton";
  import StatusBadge from "@/components/common/StatusBadge";
  import { fetchConsultants, removeConsultant, editConsultant } from "@/store/actions/consultingActions";
  import { availabilityOptions, consultingCategoryOptions, dummyConsultingStats } from "@/data/dummyConsulting";
  import { useSearch } from "@/hooks/useSearch";
  import { useFilter } from "@/hooks/useFilter";
  import { usePagination } from "@/hooks/usePagination";
  import { formatDate } from "@/lib/helpers";
  import { cn } from "@/lib/utils";
  import { Edit2, Eye, Trash2, Star as StarIcon, StarOff } from "lucide-react";
  import { AnimatePresence } from "framer-motion";
  import toast from "react-hot-toast";

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const availabilityFilterOptions = [
    { value: "all", label: "All Availability" },
    ...availabilityOptions.map((a) => ({ value: a.value, label: a.label })),
  ];

  const categoryFilterOptions = [
    { value: "all", label: "All Categories" },
    ...consultingCategoryOptions.map((c) => ({ value: c.value, label: c.label })),
  ];

  const featuredFilterOptions = [
    { value: "all", label: "All" },
    { value: "true", label: "Featured Only" },
    { value: "false", label: "Not Featured" },
  ];

  export default function ConsultantsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { consultants, isLoading } = useSelector((state) => state.consulting);
    const [viewMode, setViewMode] = useState("table");
    const [showFilters, setShowFilters] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
      dispatch(fetchConsultants());
    }, [dispatch]);

    const allConsultants = Array.isArray(consultants) ? consultants.filter(Boolean) : [];

    const { query, setQuery, results: searched } = useSearch(allConsultants, ["name", "title", "location", "email"]);
    const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
      status: "all",
      availability: "all",
      featured: "all",
    });

    const hasActiveFilters =
      filters.status !== "all" ||
      filters.availability !== "all" ||
      filters.featured !== "all" ||
      query.trim() !== "";

    const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 10);

    const handleDelete = async () => {
      const id = deleteDialog?.item?.id;
      if (!id) { setDeleteDialog({ open: false, item: null }); return; }
      setIsDeleting(true);
      try {
        const res = await dispatch(removeConsultant(id));
        if (res?.success) toast.success("Consultant deleted successfully");
        else toast.error("Failed to delete consultant");
      } catch { toast.error("Something went wrong"); }
      finally { setIsDeleting(false); setDeleteDialog({ open: false, item: null }); }
    };

    const handleToggleFeatured = async (con) => {
      if (!con?.id) return;
      await dispatch(editConsultant(con.id, { ...con, featured: !con.featured }));
      toast.success(`${!con.featured ? "Featured" : "Unfeatured"} successfully`);
    };

    const handleToggleStatus = async (con) => {
      if (!con?.id) return;
      const newStatus = con.status === "active" ? "inactive" : "active";
      await dispatch(editConsultant(con.id, { ...con, status: newStatus }));
      toast.success(`Status changed to ${newStatus}`);
    };

    const stats = dummyConsultingStats || {};
    const activeCount = allConsultants.filter((c) => c.status === "active").length;
    const verifiedCount = allConsultants.filter((c) => c.verified).length;
    const featuredCount = allConsultants.filter((c) => c.featured).length;

    return (
      <div className="space-y-5">
        <Breadcrumb />
        <PageHeader title="Consultants" description="Manage all registered consultants and their profiles">
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push("/consulting/consultants/add")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
            >
              <Plus className="h-4 w-4" />
              Add Consultant
            </motion.button>
          </div>
        </PageHeader>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatsCard title="Total Consultants" value={allConsultants.length} icon={Users} color="rgba(15,105,176,0.08)" index={0} />
          <StatsCard title="Active" value={activeCount} icon={TrendingUp} color="rgba(16,185,129,0.08)" index={1} />
          <StatsCard title="Verified" value={verifiedCount} icon={CheckCircle} color="rgba(124,58,237,0.08)" index={2} />
          <StatsCard title="Featured" value={featuredCount} icon={Star} color="rgba(245,158,11,0.08)" index={3} />
        </div>

        <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
          <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex-1 min-w-[180px]">
                <SearchInput value={query} onChange={setQuery} placeholder="Search consultants..." />
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
                  className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
                    viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
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
                    <FilterDropdown label="Status" value={filters.status || "all"} options={statusOptions} onChange={(v) => updateFilter("status", v)} />
                    <FilterDropdown label="Availability" value={filters.availability || "all"} options={availabilityFilterOptions} onChange={(v) => updateFilter("availability", v)} />
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
              <LoadingSpinner size="lg" text="Loading consultants..." className="py-16" />
            ) : filteredData.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No consultants found"
                description={hasActiveFilters ? "Try adjusting your search or filters" : "Add your first consultant to get started"}
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
                      onClick={() => router.push("/consulting/consultants/add")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                    >
                      <Plus className="h-4 w-4" />
                      Add Consultant
                    </button>
                  </div>
                }
              />
            ) : viewMode === "grid" ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {paginatedData.map((con, i) => (
                    <ConsultantGridCard
                    key={con.id}
                    consultant={con}
                    index={i}
                    onView={() => router.push(`/consulting/${con.id}`)}
                    onEdit={() => router.push(`/consulting/${con.id}?tab=Edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: con })}
                    onToggleFeatured={() => handleToggleFeatured(con)}
                    onToggleStatus={() => handleToggleStatus(con)}
                    />
                  ))}
                </div>
                <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
                </div>
              </>
            ) : (
              <>
                <ConsultantTable
                    consultants={paginatedData}
                    onView={(con) => router.push(`/consulting/${con.id}`)}
                    onEdit={(con) => router.push(`/consulting/${con.id}?tab=Edit`)}
                    onDelete={(con) => setDeleteDialog({ open: true, item: con })}
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
          onClose={() => setDeleteDialog({ open: false, item: null })}
          onConfirm={handleDelete}
          title="Delete Consultant"
          description={`Are you sure you want to delete "${deleteDialog.item?.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          isLoading={isDeleting}
          variant="danger"
        />
      </div>
    );
  }

  function ConsultantGridCard({ consultant, index, onView, onEdit, onDelete, onToggleFeatured, onToggleStatus }) {
    const con = consultant;
    const avail = availabilityOptions.find((a) => a.value === con.availability) || availabilityOptions[0];
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="group relative rounded-2xl p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.08)]"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black text-white"
              style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
            >
              {con.name?.charAt(0) || "?"}
            </div>
            {con.verified && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="text-sm font-black text-foreground truncate">{con.name}</p>
              {con.featured && <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium truncate">{con.title}</p>
            <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5">{con.location}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <StatusBadge status={con.status} />
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${avail.color}15`, color: avail.color }}
          >
            {avail.label}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium mb-3">
          <span className="flex items-center gap-1">
            <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {con.rating?.toFixed(1)}
          </span>
          <span>{con.sessionsCompleted} sessions</span>
          <span className="font-black text-foreground">${con.hourlyRate}/hr</span>
        </div>
        {(con.specializations || []).length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {con.specializations.slice(0, 2).map((s) => (
              <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0F69B0]/8 text-[#0F69B0]">{s}</span>
            ))}
            {con.specializations.length > 2 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">
                +{con.specializations.length - 2}
              </span>
            )}
          </div>
        )}
        <div className="text-[10px] text-muted-foreground font-medium mb-3">{formatDate(con.createdAt)}</div>
        <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
          <button onClick={onView} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer" title="View">
            <Eye className="h-3.5 w-3.5 mx-auto" />
          </button>
          <button onClick={onEdit} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer" title="Edit">
            <Edit2 className="h-3.5 w-3.5 mx-auto" />
          </button>
          <button onClick={onToggleFeatured} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer">
            {con.featured ? <StarOff className="h-3.5 w-3.5 mx-auto" /> : <StarIcon className="h-3.5 w-3.5 mx-auto" />}
          </button>
          <button onClick={onDelete} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer" title="Delete">
            <Trash2 className="h-3.5 w-3.5 mx-auto" />
          </button>
        </div>
      </motion.div>
    );
  }