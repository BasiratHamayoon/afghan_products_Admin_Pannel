"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, FolderOpen, X, List, Grid3X3,
  TrendingUp, FolderTree, BarChart3, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SharedTable from "@/components/categories/SharedTable";
import SharedGridCard from "@/components/categories/SharedGridCard";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchCategories,
  fetchCategoryStats,
  archiveCategoryAction,
  unarchiveCategoryAction,
  deleteCategoryAction,
} from "@/store/actions/categoriesActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { categories, isLoading, pagination, stats } = useSelector((state) => state.categories);

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveDialog, setArchiveDialog] = useState({ open: false, item: null, action: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isActioning, setIsActioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const TABS = [
    { id: "all", label: t("categories.all") },
    { id: "active", label: t("categories.active") },
    { id: "archived", label: t("categories.archived") },
  ];

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab === "active") params.isArchived = false;
    else if (tab === "archived") params.isArchived = true;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories(buildParams(1, "", "all")));
    }
    dispatch(fetchCategoryStats());
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback((page, search, tab) => {
    dispatch(fetchCategories(buildParams(page, search, tab)));
  }, [dispatch, buildParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
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
    triggerFetch(1, "", activeTab);
  };

  const handleRefresh = () => {
    triggerFetch(currentPage, searchQuery, activeTab);
  };

  const handleArchiveConfirm = async () => {
    const { item, action } = archiveDialog;
    if (!item?.id) { setArchiveDialog({ open: false, item: null, action: null }); return; }
    setIsActioning(true);
    try {
      const fn = action === "archive" ? archiveCategoryAction : unarchiveCategoryAction;
      const res = await dispatch(fn(item.id));
      if (res?.success) {
        toast.success(action === "archive" ? t("categories.categoryArchived") : t("categories.categoryUnarchived"));
      } else {
        toast.error(res?.message || t("categories.actionFailed"));
      }
    } catch {
      toast.error(t("categories.somethingWentWrong"));
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, item: null, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id || !item?.slug) {
      setDeleteDialog({ open: false, item: null });
      toast.error(t("categories.missingDataForDeletion"));
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteCategoryAction(item.id, item.slug));
      if (res?.success) {
        toast.success(t("categories.categoryDeleted"));
      } else {
        toast.error(res?.message || t("categories.failedToDelete"));
      }
    } catch {
      toast.error(t("categories.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCategories = (() => {
    if (activeTab === "active") return safeCategories.filter((c) => !c.isArchived);
    if (activeTab === "archived") return safeCategories.filter((c) => c.isArchived);
    return safeCategories;
  })();

  const totalPages = pagination?.totalPages || Math.ceil(filteredCategories.length / PAGE_LIMIT) || 1;
  const total = pagination?.total || filteredCategories.length;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const allCount = safeCategories.length;
  const activeCount = safeCategories.filter((c) => !c.isArchived).length;
  const archivedCount = safeCategories.filter((c) => c.isArchived).length;
  const tabCounts = { all: allCount, active: activeCount, archived: archivedCount };

  const totalFromStats = stats?.total ?? total;
  const activeFromStats = stats?.active ?? activeCount;
  const archivedFromStats = stats?.archived ?? archivedCount;
  const subCategoryCount = stats?.subCategories ?? stats?.totalSubCategories ?? 0;

  const commonCardProps = {
    onView: (it) => router.push(`/categories/${it.id}`),
    onEdit: (it) => router.push(`/categories/add?edit=${it.id}`),
    onArchive: (it) => setArchiveDialog({ open: true, item: it, action: "archive" }),
    onUnarchive: (it) => setArchiveDialog({ open: true, item: it, action: "unarchive" }),
    onDelete: (it) => setDeleteDialog({ open: true, item: it }),
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("categories.title")} description={t("categories.description")}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/categories/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            {t("categories.addCategory")}
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("categories.total")} value={totalFromStats} icon={FolderOpen} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("categories.active")} value={activeFromStats} icon={TrendingUp} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title={t("categories.archived")} value={archivedFromStats} icon={FolderTree} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title={t("categories.subcategories")} value={subCategoryCount} icon={BarChart3} color="rgba(124,58,237,0.08)" index={3} />
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
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder={t("categories.searchPlaceholder")} />
            </div>
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />{t("categories.clear")}
              </button>
            )}
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("table")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("grid")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {filteredCategories.length} {filteredCategories.length !== 1 ? t("categories.resultsPlural") : t("categories.results")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("categories.loadingCategories")} className="py-16" />
          ) : filteredCategories.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title={t("categories.noCategoriesFound")}
              description={
                searchQuery ? t("categories.tryAdjustingSearch")
                  : activeTab === "archived" ? t("categories.noArchivedCategories")
                  : activeTab === "active" ? t("categories.noActiveCategories")
                  : t("categories.createFirstCategory")
              }
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {searchQuery && (
                    <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                      {t("categories.clearSearch")}
                    </button>
                  )}
                  <button onClick={() => router.push("/categories/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                    <Plus className="h-4 w-4" />{t("categories.addCategory")}
                  </button>
                </div>
              }
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredCategories.map((cat, i) => (
                  <SharedGridCard key={cat.id} item={cat} index={i} defaultEmoji="📦" {...commonCardProps} />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <SharedTable items={filteredCategories} extraColumns={[]} {...commonCardProps} />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, item: null, action: null })}
        onConfirm={handleArchiveConfirm}
        title={archiveDialog.action === "archive" ? t("categories.archiveCategory") : t("categories.unarchiveCategory")}
        description={archiveDialog.item ? `${archiveDialog.action === "archive" ? t("categories.archiveDesc") : t("categories.unarchiveDesc")} "${archiveDialog.item.name}"?` : t("categories.areYouSure")}
        confirmLabel={archiveDialog.action === "archive" ? t("categories.archive") : t("categories.unarchive")}
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title={t("categories.deleteCategory")}
        description={deleteDialog.item ? `${t("categories.deleteCategoryDesc")} "${deleteDialog.item.name}"${t("categories.deleteSuffix")}` : t("categories.areYouSure")}
        confirmLabel={t("categories.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}