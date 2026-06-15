"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, Image, X, RefreshCw, CheckCircle,
  Clock, Eye, Star,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import BannersTable from "@/components/banners/BannersTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchBanners,
  deleteBanner,
  toggleBannerStatus,
} from "@/store/actions/bannersActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
];

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 20;

export default function BannersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { banners, isLoading, pagination } = useSelector((state) => state.banners);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [toggleDialog, setToggleDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const buildParams = useCallback((page, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (tab === "active") params.isActive = true;
    else if (tab === "inactive") params.isActive = false;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchBanners(buildParams(1, "all")));
  }, [dispatch, buildParams]);

  useEffect(() => {
    return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
  }, []);

  const triggerFetch = useCallback((page, tab) => {
    dispatch(fetchBanners(buildParams(page, tab)));
  }, [dispatch, buildParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
    triggerFetch(1, tab);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    triggerFetch(page, activeTab);
  };

  const handleRefresh = () => triggerFetch(currentPage, activeTab);

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteBanner(item.id));
      if (res?.success) toast.success("Banner deleted");
      else toast.error(res?.message || "Failed to delete");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, item: null }); }
  };

  const handleToggleConfirm = async () => {
    const { item } = toggleDialog;
    if (!item?.id) { setToggleDialog({ open: false, item: null }); return; }
    setIsToggling(true);
    try {
      const res = await dispatch(toggleBannerStatus(item.id));
      if (res?.success) toast.success(item.isActive ? "Banner deactivated" : "Banner activated");
      else toast.error(res?.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setIsToggling(false); setToggleDialog({ open: false, item: null }); }
  };

  const safeItems = Array.isArray(banners) ? banners : [];
  const total = pagination?.total || safeItems.length;
  const totalPages = pagination?.totalPages || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: safeItems.length,
    active: safeItems.filter((b) => b.isActive).length,
    inactive: safeItems.filter((b) => !b.isActive).length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Banners" description="Manage promotional banners across the platform">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/banners/add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Plus className="h-4 w-4" />Add Banner
        </motion.button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        <StatsCard title="Total" value={total} icon={Image} color="rgba(15,105,176,0.08)" index={0} />
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
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh"><RefreshCw className="h-3.5 w-3.5" /></button>
            <p className="text-[11px] text-muted-foreground font-medium">{safeItems.length} result{safeItems.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading banners..." className="py-16" />
          ) : safeItems.length === 0 ? (
            <EmptyState icon={Image} title="No banners found" description="Create your first banner"
              action={
                <button onClick={() => router.push("/banners/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><Plus className="h-4 w-4" />Add Banner</button>
              }
            />
          ) : (
            <>
              <BannersTable
                items={safeItems}
                onView={(it) => router.push(`/banners/${it.id}`)}
                onEdit={(it) => router.push(`/banners/add?edit=${it.id}`)}
                onDelete={(it) => setDeleteDialog({ open: true, item: it })}
                onToggle={(it) => setToggleDialog({ open: true, item: it })}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDeleteConfirm} title="Delete Banner" description={deleteDialog.item ? `Delete "${deleteDialog.item.title}"? This cannot be undone.` : "Are you sure?"} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />

      <ConfirmDialog open={toggleDialog.open} onClose={() => setToggleDialog({ open: false, item: null })} onConfirm={handleToggleConfirm} title={toggleDialog.item?.isActive ? "Deactivate Banner" : "Activate Banner"} description={toggleDialog.item ? `Are you sure you want to ${toggleDialog.item.isActive ? "deactivate" : "activate"} "${toggleDialog.item.title}"?` : "Are you sure?"} confirmLabel={toggleDialog.item?.isActive ? "Deactivate" : "Activate"} isLoading={isToggling} variant={toggleDialog.item?.isActive ? "warning" : "primary"} />
    </div>
  );
}