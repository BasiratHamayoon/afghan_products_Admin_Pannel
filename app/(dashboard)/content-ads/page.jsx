"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, Image, Megaphone, FileText, TrendingUp,
  SlidersHorizontal, X, Eye, MousePointer, DollarSign, BarChart2,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import BannerManager from "@/components/content/BannerManager";
import AdManager from "@/components/content/AdManager";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import StatusBadge from "@/components/common/StatusBadge";
import {
  fetchBanners, fetchAnnouncements, fetchBlogs, fetchAds,
  removeBanner, removeAnnouncement, removeBlog, removeAd,
  editBanner, editAnnouncement, editBlog, editAd,
} from "@/store/actions/contentActions";
import {
  dummyContentStats, announcementTypeOptions,
  bannerPositionOptions, blogCategoryOptions, adTypeOptions,
} from "@/data/dummyContent";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { Edit2, Trash2, Star, StarOff, Pin } from "lucide-react";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "scheduled", label: "Scheduled" },
];

const mainTabs = [
  { id: "banners", label: "Banners", icon: Image },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "blogs", label: "Blogs", icon: FileText },
  { id: "ads", label: "Advertisements", icon: TrendingUp },
];

const priorityColors = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };

export default function ContentAdsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { banners, announcements, blogs, ads, isLoading } = useSelector((state) => state.content);
  const [activeTab, setActiveTab] = useState("banners");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchBanners());
    dispatch(fetchAnnouncements());
    dispatch(fetchBlogs());
    dispatch(fetchAds());
  }, [dispatch]);

  const allBanners = Array.isArray(banners) ? banners.filter(Boolean) : [];
  const allAnnouncements = Array.isArray(announcements) ? announcements.filter(Boolean) : [];
  const allBlogs = Array.isArray(blogs) ? blogs.filter(Boolean) : [];
  const allAds = Array.isArray(ads) ? ads.filter(Boolean) : [];

  const activeData =
    activeTab === "banners" ? allBanners
    : activeTab === "announcements" ? allAnnouncements
    : activeTab === "blogs" ? allBlogs
    : allAds;

  const searchFields =
    activeTab === "banners" ? ["title", "description", "link"]
    : activeTab === "announcements" ? ["title", "content", "type"]
    : activeTab === "blogs" ? ["title", "excerpt", "category", "author.name"]
    : ["title", "description", "advertiser.name"];

  const { query, setQuery, results: searched } = useSearch(activeData, searchFields);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { status: "all" });

  const hasActiveFilters = filters.status !== "all" || query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 8);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      let res;
      if (activeTab === "banners") res = await dispatch(removeBanner(id));
      else if (activeTab === "announcements") res = await dispatch(removeAnnouncement(id));
      else if (activeTab === "blogs") res = await dispatch(removeBlog(id));
      else res = await dispatch(removeAd(id));
      if (res?.success) toast.success("Deleted successfully");
      else toast.error("Failed to delete");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, item: null }); }
  };

  const handleToggleStatus = async (item, currentTab) => {
    if (!item?.id) return;
    const newStatus = item.status === "active" ? "inactive" : "active";
    const updated = { ...item, status: newStatus };
    if (currentTab === "banners") await dispatch(editBanner(item.id, updated));
    else if (currentTab === "announcements") await dispatch(editAnnouncement(item.id, updated));
    else if (currentTab === "blogs") await dispatch(editBlog(item.id, updated));
    else await dispatch(editAd(item.id, updated));
    toast.success(`Status changed to ${newStatus}`);
  };

  const handleToggleFeatured = async (item) => {
    if (!item?.id) return;
    const updated = { ...item, featured: !item.featured };
    if (activeTab === "banners") await dispatch(editBanner(item.id, updated));
    else await dispatch(editBlog(item.id, updated));
    toast.success(`${!item.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  const handleTogglePinned = async (item) => {
    if (!item?.id) return;
    await dispatch(editAnnouncement(item.id, { ...item, isPinned: !item.isPinned }));
    toast.success(`${!item.isPinned ? "Pinned" : "Unpinned"} successfully`);
  };

  const stats = dummyContentStats || {};

  const tabCounts = {
    banners: allBanners.length,
    announcements: allAnnouncements.length,
    blogs: allBlogs.length,
    ads: allAds.length,
  };

  const addRoutes = {
    banners: "/content-ads/banners/add",
    announcements: "/content-ads/announcements/add",
    blogs: "/content-ads/blogs/add",
    ads: "/content-ads/ads/add",
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Content & Ads" description="Manage banners, announcements, blogs, and advertisements">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(addRoutes[activeTab])}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add {activeTab === "ads" ? "Ad" : activeTab.slice(0, -1).charAt(0).toUpperCase() + activeTab.slice(0, -1).slice(1)}
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Banners" value={stats.totalBanners || 0} icon={Image} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Published Blogs" value={stats.publishedBlogs || 0} icon={FileText} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Active Ads" value={stats.activeAds || 0} icon={TrendingUp} color="rgba(124,58,237,0.08)" index={2} />
        <StatsCard title="Ad Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="rgba(245,158,11,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setQuery(""); resetFilters(); }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 relative",
                    activeTab === tab.id
                      ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                    activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground"
                  )}>
                    {tabCounts[tab.id]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder={`Search ${activeTab}...`} />
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
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <FilterDropdown label="Status" value={filters.status || "all"} options={statusFilterOptions} onChange={(v) => updateFilter("status", v)} />
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
            <LoadingSpinner size="lg" text="Loading..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={activeTab === "banners" ? Image : activeTab === "announcements" ? Megaphone : activeTab === "blogs" ? FileText : TrendingUp}
              title={`No ${activeTab} found`}
              description={hasActiveFilters ? "Try adjusting your search or filters" : `Create your first ${activeTab.slice(0, -1)} to get started`}
              action={
                <button onClick={() => router.push(addRoutes[activeTab])} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  <Plus className="h-4 w-4" />Add {activeTab.slice(0, -1)}
                </button>
              }
            />
          ) : activeTab === "banners" ? (
            <>
              <BannerManager
                banners={paginatedData}
                onView={(b) => router.push(`/content-ads/banners/${b.id}`)}
                onEdit={(b) => router.push(`/content-ads/banners/${b.id}?tab=Edit`)}
                onDelete={(b) => setDeleteDialog({ open: true, item: b })}
                onToggleStatus={(b) => handleToggleStatus(b, "banners")}
                onToggleFeatured={handleToggleFeatured}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : activeTab === "announcements" ? (
            <>
              <div className="space-y-3">
                {paginatedData.map((ann, i) => (
                  <AnnouncementCard
                    key={ann.id}
                    announcement={ann}
                    index={i}
                    onEdit={() => router.push(`/content-ads/announcements/${ann.id}?tab=Edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: ann })}
                    onToggleStatus={() => handleToggleStatus(ann, "announcements")}
                    onTogglePinned={() => handleTogglePinned(ann)}
                  />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : activeTab === "blogs" ? (
            <>
              <div className="space-y-3">
                {paginatedData.map((blog, i) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    index={i}
                    onView={() => router.push(`/content-ads/blogs/${blog.id}`)}
                    onEdit={(a) => router.push(`/content-ads/ads/${a.id}?tab=Edit`)}
                    onDelete={() => setDeleteDialog({ open: true, item: blog })}
                    onToggleFeatured={() => handleToggleFeatured(blog)}
                  />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <AdManager
                ads={paginatedData}
                onView={(a) => router.push(`/content-ads/ads/${a.id}`)}
                onEdit={(a) => router.push(`/content-ads/ads/${a.id}?tab=Edit`)}
                onDelete={(a) => setDeleteDialog({ open: true, item: a })}
                onToggleStatus={(a) => handleToggleStatus(a, "ads")}
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
        title={`Delete ${activeTab.slice(0, -1)}`}
        description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

function AnnouncementCard({ announcement, index, onEdit, onDelete, onToggleStatus, onTogglePinned }) {
  const ann = announcement;
  const typeOpt = announcementTypeOptions.find((t) => t.value === ann.type);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all shadow-[0_1px_6px_rgba(15,105,176,0.04)] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${typeOpt?.color || "#0F69B0"}15` }}>
          <Megaphone className="h-4 w-4" style={{ color: typeOpt?.color || "#0F69B0" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className="text-sm font-black text-foreground truncate">{ann.title}</h3>
              {ann.isPinned && <Pin className="h-3 w-3 text-[#0F69B0] shrink-0" />}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${typeOpt?.color}15`, color: typeOpt?.color }}>{typeOpt?.label}</span>
              <StatusBadge status={ann.status} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 mb-2">{ann.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium flex-wrap">
              <span>By: <span className="font-bold text-foreground">{ann.author?.name}</span></span>
              <span>{ann.views?.toLocaleString()} views</span>
              <span>{formatDate(ann.startDate)} → {formatDate(ann.endDate)}</span>
              <span className="capitalize" style={{ color: priorityColors[ann.priority] }}>● {ann.priority} priority</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onTogglePinned} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={ann.isPinned ? "Unpin" : "Pin"}>
                <Pin className="h-3.5 w-3.5" />
              </button>
              <button onClick={onEdit} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={onDelete} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BlogCard({ blog, index, onView, onEdit, onDelete, onToggleFeatured }) {
  const statusColors = { published: "#10b981", draft: "#f59e0b", archived: "#6b7280" };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all shadow-[0_1px_6px_rgba(15,105,176,0.04)] overflow-hidden"
    >
      <div className="flex items-start gap-4 p-4">
        <div className="h-16 w-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/[0.04] shrink-0">
          {blog.coverImage ? (
            <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <FileText className="h-5 w-5 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h3 className="text-sm font-black text-foreground truncate">{blog.title}</h3>
                {blog.featured && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">{blog.excerpt}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0F69B0]/8 text-[#0F69B0] capitalize">{blog.category}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize" style={{ background: `${statusColors[blog.status]}15`, color: statusColors[blog.status] }}>{blog.status}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium flex-wrap">
              <span>By: <span className="font-bold text-foreground">{blog.author?.name}</span></span>
              <span>{(blog.views || 0).toLocaleString()} views</span>
              <span>{blog.readTime} min read</span>
              {blog.publishedAt && <span>{formatDate(blog.publishedAt)}</span>}
              <div className="flex flex-wrap gap-1">
                {(blog.tags || []).slice(0, 2).map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-[9px] font-bold">#{t}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={onView} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer">
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button onClick={onEdit} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={onToggleFeatured} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-muted-foreground hover:text-yellow-500 transition-all cursor-pointer">
                {blog.featured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
              </button>
              <button onClick={onDelete} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}