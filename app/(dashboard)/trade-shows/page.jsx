"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, CalendarDays, X, RefreshCw,
  CheckCircle, Clock, Star,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import TradeShowsTable from "@/components/trade-shows/TradeShowsTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchTradeShows, deleteTradeShow } from "@/store/actions/tradeShowsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function TradeShowsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { tradeShows, isLoading, pagination } = useSelector((state) => state.tradeShows);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const TABS = [
    { id: "all", label: t("tradeShows.all") },
    { id: "active", label: t("tradeShows.active") },
    { id: "featured", label: t("tradeShows.featured") },
    { id: "inactive", label: t("tradeShows.inactive") },
  ];

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab === "active") params.isActive = true;
    else if (tab === "inactive") params.isActive = false;
    else if (tab === "featured") params.isFeatured = true;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchTradeShows(buildParams(1, "", "all")));
  }, [dispatch, buildParams]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback((page, search, tab) => {
    dispatch(fetchTradeShows(buildParams(page, search, tab)));
  }, [dispatch, buildParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", tab);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab);
    }, DEBOUNCE_DELAY);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", activeTab);
  };

  const handleRefresh = () => {
    triggerFetch(currentPage, searchQuery, activeTab);
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteTradeShow(item.id));
      if (res?.success) {
        toast.success(t("tradeShows.tradeShowDeleted"));
      } else {
        toast.error(res?.message || t("tradeShows.failedToDelete"));
      }
    } catch {
      toast.error(t("tradeShows.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const safeItems = Array.isArray(tradeShows) ? tradeShows : [];
  const total = pagination?.total || safeItems.length;
  const totalPages = pagination?.totalPages || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: safeItems.length,
    active: safeItems.filter((item) => item.isActive).length,
    featured: safeItems.filter((item) => item.isFeatured).length,
    inactive: safeItems.filter((item) => !item.isActive).length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("tradeShows.title")} description={t("tradeShows.description")}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/trade-shows/add")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <Plus className="h-4 w-4" />
          {t("tradeShows.addTradeShow")}
        </motion.button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("tradeShows.total")} value={total} icon={CalendarDays} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("tradeShows.active")} value={tabCounts.active} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title={t("tradeShows.featured")} value={tabCounts.featured} icon={Star} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title={t("tradeShows.inactive")} value={tabCounts.inactive} icon={Clock} color="rgba(107,114,128,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
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
                {tabCounts[tab.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder={t("tradeShows.searchPlaceholder")} />
            </div>
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />{t("tradeShows.clear")}
              </button>
            )}
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <p className="text-[11px] text-muted-foreground font-medium">
              {safeItems.length} {safeItems.length !== 1 ? t("tradeShows.resultsPlural") : t("tradeShows.results")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("tradeShows.loadingTradeShows")} className="py-16" />
          ) : safeItems.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={t("tradeShows.noTradeShowsFound")}
              description={searchQuery ? t("tradeShows.tryAdjustingSearch") : t("tradeShows.createFirstTradeShow")}
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {searchQuery && (
                    <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                      {t("tradeShows.clearSearch")}
                    </button>
                  )}
                  <button onClick={() => router.push("/trade-shows/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                    <Plus className="h-4 w-4" />{t("tradeShows.addTradeShow")}
                  </button>
                </div>
              }
            />
          ) : (
            <>
              <TradeShowsTable
                items={safeItems}
                onView={(it) => router.push(`/trade-shows/${it.id}`)}
                onEdit={(it) => router.push(`/trade-shows/add?edit=${it.id}`)}
                onDelete={(it) => setDeleteDialog({ open: true, item: it })}
              />
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
        title={t("tradeShows.deleteTradeShow")}
        description={deleteDialog.item ? `${t("tradeShows.deleteTradeShowDesc")} "${deleteDialog.item.title}"${t("tradeShows.deleteTradeShowSuffix")}` : t("tradeShows.areYouSure")}
        confirmLabel={t("tradeShows.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}