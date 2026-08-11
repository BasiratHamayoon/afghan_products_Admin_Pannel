"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, LayoutGrid, X, List, Grid3X3,
  TrendingUp, Package, Layers, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SectionTable from "@/components/sections/SectionTable";
import SectionGridCard from "@/components/sections/SectionGridCard";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchSections,
  archiveSectionAction,
  unarchiveSectionAction,
  deleteSectionAction,
} from "@/store/actions/sectionsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function SectionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { sections, isLoading, pagination } = useSelector((state) => state.sections);

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
    { id: "all", label: t("sections.all") },
    { id: "active", label: t("sections.active") },
    { id: "archived", label: t("sections.archived") },
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
    if (!sections || sections.length === 0) {
      dispatch(fetchSections(buildParams(1, "", "all")));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback((page, search, tab) => {
    dispatch(fetchSections(buildParams(page, search, tab)));
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
    if (!item?.id) {
      setArchiveDialog({ open: false, item: null, action: null });
      return;
    }
    setIsActioning(true);
    try {
      const fn = action === "archive" ? archiveSectionAction : unarchiveSectionAction;
      const res = await dispatch(fn(item.id));
      if (res?.success) {
        toast.success(
          action === "archive"
            ? t("sections.sectionArchived")
            : t("sections.sectionUnarchived")
        );
      } else {
        toast.error(res?.message || t("sections.actionFailed"));
      }
    } catch {
      toast.error(t("sections.somethingWentWrong"));
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, item: null, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) {
      setDeleteDialog({ open: false, item: null });
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteSectionAction(item.id));
      if (res?.success) {
        toast.success(t("sections.sectionDeleted"));
      } else {
        toast.error(res?.message || t("sections.failedToDelete"));
      }
    } catch {
      toast.error(t("sections.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const safeSections = Array.isArray(sections) ? sections : [];

  const filteredItems = (() => {
    if (activeTab === "active") return safeSections.filter((s) => !s.isArchived);
    if (activeTab === "archived") return safeSections.filter((s) => s.isArchived);
    return safeSections;
  })();

  const totalPages = pagination?.totalPages || Math.ceil(filteredItems.length / PAGE_LIMIT) || 1;
  const total = pagination?.total || filteredItems.length;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const allCount = safeSections.length;
  const activeCount = safeSections.filter((s) => !s.isArchived).length;
  const archivedCount = safeSections.filter((s) => s.isArchived).length;
  const tabCounts = { all: allCount, active: activeCount, archived: archivedCount };

  const commonProps = {
    onView: (it) => router.push(`/sections/${it.key || it.id}`),
    onEdit: (it) => router.push(`/sections/add?mode=edit&key=${it.key}`),
    onManageProducts: (it) => router.push(`/sections/add?mode=products&key=${it.key}`),
    onArchive: (it) => setArchiveDialog({ open: true, item: it, action: "archive" }),
    onUnarchive: (it) => setArchiveDialog({ open: true, item: it, action: "unarchive" }),
    onDelete: (it) => setDeleteDialog({ open: true, item: it }),
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("sections.title")} description={t("sections.description")}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/sections/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            {t("sections.addSection")}
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("sections.total")} value={allCount} icon={LayoutGrid} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("sections.active")} value={activeCount} icon={TrendingUp} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title={t("sections.archived")} value={archivedCount} icon={Layers} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title={t("sections.shown")} value={filteredItems.length} icon={Package} color="rgba(124,58,237,0.08)" index={3} />
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
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t("sections.searchPlaceholder")}
              />
            </div>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
              >
                <X className="h-3.5 w-3.5" />
                {t("sections.clear")}
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode("table")}
                className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              {filteredItems.length}{" "}
              {filteredItems.length !== 1 ? t("sections.resultsPlural") : t("sections.results")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("sections.loadingSections")} className="py-16" />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={LayoutGrid}
              title={t("sections.noSectionsFound")}
              description={
                searchQuery
                  ? t("sections.tryAdjustingSearch")
                  : activeTab === "archived"
                  ? t("sections.noArchivedSections")
                  : activeTab === "active"
                  ? t("sections.noActiveSections")
                  : t("sections.createFirstSection")
              }
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {searchQuery && (
                    <button
                      onClick={handleClearSearch}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      {t("sections.clearSearch")}
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/sections/add")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    <Plus className="h-4 w-4" />
                    {t("sections.addSection")}
                  </button>
                </div>
              }
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredItems.map((item, i) => (
                  <SectionGridCard key={item.id} item={item} index={i} {...commonProps} />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <SectionTable items={filteredItems} {...commonProps} />
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
        title={archiveDialog.action === "archive" ? t("sections.archiveSection") : t("sections.unarchiveSection")}
        description={
          archiveDialog.item
            ? `${archiveDialog.action === "archive" ? t("sections.archiveDesc") : t("sections.unarchiveDesc")} "${archiveDialog.item.name}"?`
            : t("sections.areYouSure")
        }
        confirmLabel={archiveDialog.action === "archive" ? t("sections.archive") : t("sections.unarchive")}
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title={t("sections.deleteSection")}
        description={
          deleteDialog.item
            ? `${t("sections.deleteSectionDesc")} "${deleteDialog.item.name}"${t("sections.deleteSuffix")}`
            : t("sections.areYouSure")
        }
        confirmLabel={t("sections.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}