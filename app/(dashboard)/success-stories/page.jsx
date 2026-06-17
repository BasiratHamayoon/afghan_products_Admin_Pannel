"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, Award, X, RefreshCw, CheckCircle, Clock, Star } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SuccessStoriesTable from "@/components/success-stories/SuccessStoriesTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchSuccessStories, deleteSuccessStory, toggleSuccessStoryStatus } from "@/store/actions/successStoriesActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function SuccessStoriesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { stories, isLoading, pagination } = useSelector((state) => state.successStories);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [toggleDialog, setToggleDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab === "active") params.isActive = true;
    else if (tab === "inactive") params.isActive = false;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchSuccessStories(buildParams(1, "", "all")));
  }, [dispatch, buildParams]);

  useEffect(() => {
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, []);

  const triggerFetch = useCallback((page, search, tab) => {
    dispatch(fetchSuccessStories(buildParams(page, search, tab)));
  }, [dispatch, buildParams]);

  const handleTabChange = (tab) => { setActiveTab(tab); setSearchQuery(""); setCurrentPage(1); triggerFetch(1, "", tab); };
  const handleSearchChange = (val) => { setSearchQuery(val); if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); searchDebounceRef.current = setTimeout(() => { setCurrentPage(1); triggerFetch(1, val, activeTab); }, DEBOUNCE_DELAY); };
  const handlePageChange = (page) => { setCurrentPage(page); triggerFetch(page, searchQuery, activeTab); };
  const handleClearSearch = () => { setSearchQuery(""); setCurrentPage(1); triggerFetch(1, "", activeTab); };
  const handleRefresh = () => triggerFetch(currentPage, searchQuery, activeTab);

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteSuccessStory(item.id));
      if (res?.success) toast.success("Story deleted");
      else toast.error(res?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, item: null }); }
  };

  const handleToggleConfirm = async () => {
    const { item } = toggleDialog;
    if (!item?.id) { setToggleDialog({ open: false, item: null }); return; }
    setIsToggling(true);
    try {
      const res = await dispatch(toggleSuccessStoryStatus(item.id));
      if (res?.success) toast.success(item.isActive ? "Deactivated" : "Activated");
      else toast.error(res?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setIsToggling(false); setToggleDialog({ open: false, item: null }); }
  };

  const safeItems = Array.isArray(stories) ? stories : [];
  const total = pagination?.total || safeItems.length;
  const totalPages = pagination?.totalPages || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);
  const tabCounts = { all: safeItems.length, active: safeItems.filter((s) => s.isActive).length, inactive: safeItems.filter((s) => !s.isActive).length };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Success Stories" description="Manage customer success stories and testimonials">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/success-stories/add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Plus className="h-4 w-4" />Add Story
        </motion.button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <StatsCard title="Total" value={total} icon={Award} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Active" value={tabCounts.active} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Inactive" value={tabCounts.inactive} icon={Clock} color="rgba(107,114,128,0.08)" index={2} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)} className={cn("flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2", activeTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]")}>
              {tab.label}
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>{tabCounts[tab.id] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]"><SearchInput value={searchQuery} onChange={handleSearchChange} placeholder="Search stories..." /></div>
            {searchQuery && <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"><X className="h-3.5 w-3.5" />Clear</button>}
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh"><RefreshCw className="h-3.5 w-3.5" /></button>
            <p className="text-[11px] text-muted-foreground font-medium">{safeItems.length} result{safeItems.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? <LoadingSpinner size="lg" text="Loading stories..." className="py-16" /> : safeItems.length === 0 ? (
            <EmptyState icon={Award} title="No success stories found" description={searchQuery ? "Try adjusting your search" : "Create your first success story"} action={
              <div className="flex items-center gap-3 flex-wrap justify-center">
                {searchQuery && <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">Clear Search</button>}
                <button onClick={() => router.push("/success-stories/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><Plus className="h-4 w-4" />Add Story</button>
              </div>
            } />
          ) : (
            <>
              <SuccessStoriesTable items={safeItems} onView={(it) => router.push(`/success-stories/${it.id}`)} onEdit={(it) => router.push(`/success-stories/add?edit=${it.id}`)} onDelete={(it) => setDeleteDialog({ open: true, item: it })} onToggle={(it) => setToggleDialog({ open: true, item: it })} />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} /></div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDeleteConfirm} title="Delete Story" description={deleteDialog.item ? `Delete "${deleteDialog.item.fullName}"'s story? This cannot be undone.` : "Are you sure?"} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
      <ConfirmDialog open={toggleDialog.open} onClose={() => setToggleDialog({ open: false, item: null })} onConfirm={handleToggleConfirm} title={toggleDialog.item?.isActive ? "Deactivate Story" : "Activate Story"} description={toggleDialog.item ? `${toggleDialog.item.isActive ? "Deactivate" : "Activate"} "${toggleDialog.item.fullName}"'s story?` : "Are you sure?"} confirmLabel={toggleDialog.item?.isActive ? "Deactivate" : "Activate"} isLoading={isToggling} variant={toggleDialog.item?.isActive ? "warning" : "primary"} />
    </div>
  );
}