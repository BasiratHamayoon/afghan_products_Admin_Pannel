"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Star, X, List, Grid3X3, Eye, EyeOff, MessageSquare } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ReviewTable from "@/components/reviews/ReviewTable";
import ReviewCard from "@/components/reviews/ReviewCard";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchReviews, toggleReviewVisibilityAction, deleteReviewAction } from "@/store/actions/reviewsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function ReviewsPage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { reviews, isLoading, pagination } = useSelector((state) => state.reviews);

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetched = useRef(false);

  const TABS = [
    { id: "all", label: t("reviews.allReviews") },
    { id: "visible", label: t("reviews.visible") },
    { id: "hidden", label: t("reviews.hidden") },
  ];

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search && search.trim()) params.search = search.trim();
    if (tab === "visible") params.isVisible = true;
    else if (tab === "hidden") params.isVisible = false;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchReviews(buildParams(1, "", "all")));
  }, [dispatch, buildParams]);

  const triggerFetch = useCallback((page, search, tab) => {
    dispatch(fetchReviews(buildParams(page, search, tab)));
  }, [dispatch, buildParams]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", tab);
  }, [triggerFetch]);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab);
    }, DEBOUNCE_DELAY);
  }, [activeTab, triggerFetch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab);
  }, [searchQuery, activeTab, triggerFetch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", activeTab);
  }, [activeTab, triggerFetch]);

  const handleToggleVisibility = useCallback(async (review) => {
    if (!review?.id) return;
    const wasVisible = review.isVisible;
    const res = await dispatch(toggleReviewVisibilityAction(review.id));
    if (res?.success) {
      toast.success(wasVisible ? t("reviews.reviewHidden") : t("reviews.reviewShown"));
    } else {
      toast.error(t("reviews.failedToUpdateVisibility"));
    }
  }, [dispatch, t]);

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteReviewAction(item.id));
      if (res?.success) {
        toast.success(t("reviews.reviewDeleted"));
      } else {
        toast.error(t("reviews.failedToDelete"));
      }
    } catch {
      toast.error(t("reviews.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const filteredReviews = (() => {
    if (activeTab === "visible") return safeReviews.filter((r) => r.isVisible);
    if (activeTab === "hidden") return safeReviews.filter((r) => !r.isVisible);
    return safeReviews;
  })();

  const allCount = safeReviews.length;
  const visibleCount = safeReviews.filter((r) => r.isVisible).length;
  const hiddenCount = safeReviews.filter((r) => !r.isVisible).length;
  const tabCounts = { all: allCount, visible: visibleCount, hidden: hiddenCount };

  const totalPages = pagination?.totalPages || Math.ceil(filteredReviews.length / PAGE_LIMIT) || 1;
  const total = pagination?.total || filteredReviews.length;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const avgRating = allCount > 0
    ? (safeReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allCount).toFixed(1)
    : "0.0";

  const commonProps = {
    onToggleVisibility: handleToggleVisibility,
    onDelete: (item) => setDeleteDialog({ open: true, item }),
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("reviews.title")} description={t("reviews.description")}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04]">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-black text-foreground">{avgRating}</span>
            <span className="text-xs text-muted-foreground font-medium">{t("reviews.avgRating")}</span>
          </div>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("reviews.totalReviews")} value={allCount} icon={MessageSquare} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("reviews.visible")} value={visibleCount} icon={Eye} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title={t("reviews.hidden")} value={hiddenCount} icon={EyeOff} color="rgba(239,68,68,0.08)" index={2} />
        <StatsCard title={t("reviews.avgRatingStat")} value={avgRating} icon={Star} color="rgba(245,158,11,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.06] overflow-x-auto scrollbar-thin">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2",
                activeTab === tab.id
                  ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              )}
            >
              {tab.label}
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder={t("reviews.searchPlaceholder")} />
            </div>
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />{t("reviews.clear")}
              </button>
            )}
            <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("table")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("grid")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {filteredReviews.length} {filteredReviews.length !== 1 ? t("reviews.resultsPlural") : t("reviews.results")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("reviews.loadingReviews")} className="py-16" />
          ) : filteredReviews.length === 0 ? (
            <EmptyState
              icon={Star}
              title={t("reviews.noReviewsFound")}
              description={
                searchQuery ? t("reviews.tryAdjustingSearch")
                  : activeTab === "hidden" ? t("reviews.noHiddenReviews")
                  : activeTab === "visible" ? t("reviews.noVisibleReviews")
                  : t("reviews.noReviewsYet")
              }
              action={searchQuery ? (
                <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  {t("reviews.clearSearch")}
                </button>
              ) : null}
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredReviews.map((item, i) => (
                  <ReviewCard key={item.id} item={item} index={i} {...commonProps} />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <ReviewTable items={filteredReviews} {...commonProps} />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title={t("reviews.deleteReview")}
        description={deleteDialog.item ? `${t("reviews.deleteReviewDesc")} "${deleteDialog.item.userName}"${t("reviews.deleteReviewSuffix")}` : t("reviews.areYouSure")}
        confirmLabel={t("reviews.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}