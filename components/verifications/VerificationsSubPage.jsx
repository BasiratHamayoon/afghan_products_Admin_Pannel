"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Shield, SlidersHorizontal, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import VerificationTable from "@/components/verifications/VerificationTable";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ExportButton from "@/components/common/ExportButton";
import { fetchVerifications, approveVerification } from "@/store/actions/verificationsActions";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "seller", label: "Seller" },
  { value: "identity", label: "Identity" },
  { value: "business", label: "Business" },
];

const priorityOptions = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "scoreHigh", label: "Score: High to Low" },
  { value: "scoreLow", label: "Score: Low to High" },
];

export default function VerificationsSubPage({ status, title, description }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { verifications, isLoading } = useSelector((state) => state.verifications);
  const { user } = useSelector((state) => state.auth);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    dispatch(fetchVerifications());
  }, [dispatch]);

  const safeVerifications = Array.isArray(verifications) ? verifications.filter(Boolean) : [];
  const statusFiltered = useMemo(() => safeVerifications.filter((v) => v.status === status), [safeVerifications, status]);

  const { query, setQuery, results: searched } = useSearch(statusFiltered, ["userName", "userEmail", "type"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { type: "all", priority: "all" });

  const sorted = useMemo(() => {
    const arr = [...filteredData];
    switch (sortBy) {
      case "oldest": return arr.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
      case "scoreHigh": return arr.sort((a, b) => (b.score || 0) - (a.score || 0));
      case "scoreLow": return arr.sort((a, b) => (a.score || 0) - (b.score || 0));
      default: return arr.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }
  }, [filteredData, sortBy]);

  const hasActiveFilters = filters.type !== "all" || filters.priority !== "all" || query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(sorted, 10);

  const handleApprove = async (ver) => {
    if (!ver?.id) return;
    const res = await dispatch(approveVerification(ver.id, user?.name || "Admin"));
    if (res?.success) toast.success(`${ver.userName} approved`);
    else toast.error("Failed to approve");
  };

  const handleView = (ver) => { if (ver?.id) router.push(`/verifications/${ver.id}`); };
  const handleReject = (ver) => { if (ver?.id) router.push(`/verifications/${ver.id}`); };

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader title={title} description={`${statusFiltered.length} ${description}`}>
        <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={(v) => { setQuery(v); goToPage(1); }} placeholder="Search applicant name, email..." />
            </div>
            <FilterDropdown label="Sort" value={sortBy} options={sortOptions} onChange={(v) => { setSortBy(v); goToPage(1); }} />
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
                <div className="flex items-center gap-2 flex-wrap pt-3">
                  <FilterDropdown label="Type" value={filters.type || "all"} options={typeOptions} onChange={(v) => { updateFilter("type", v); goToPage(1); }} />
                  <FilterDropdown label="Priority" value={filters.priority || "all"} options={priorityOptions} onChange={(v) => { updateFilter("priority", v); goToPage(1); }} />
                  {hasActiveFilters && (
                    <button onClick={() => { resetFilters(); setQuery(""); goToPage(1); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40 transition-colors">
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground font-medium ml-auto">{sorted.length} results</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading..." className="py-16" />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={`No ${status} verifications`}
              description={hasActiveFilters ? "Try adjusting your filters" : `No ${status} verifications yet`}
              action={
                hasActiveFilters ? (
                  <button onClick={() => { resetFilters(); setQuery(""); goToPage(1); }} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
                    Clear Filters
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <VerificationTable verifications={paginatedData} onView={handleView} onApprove={handleApprove} onReject={handleReject} />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}