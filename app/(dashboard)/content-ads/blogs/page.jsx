"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Eye, Star, FileText, SlidersHorizontal, X, Edit2, Trash2, Clock } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import StatusBadge from "@/components/common/StatusBadge";
import { fetchBlogs, removeBlog, editBlog } from "@/store/actions/contentActions";
import { blogCategoryOptions } from "@/data/dummyContent";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const categoryFilterOptions = [
  { value: "all", label: "All Categories" },
  ...blogCategoryOptions.map((c) => ({ value: c.value, label: c.label })),
];

export default function BlogsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { blogs, isLoading } = useSelector((state) => state.content);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { dispatch(fetchBlogs()); }, [dispatch]);

  const all = Array.isArray(blogs) ? blogs.filter(Boolean) : [];
  const { query, setQuery, results: searched } = useSearch(all, ["title", "excerpt", "category", "author.name"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { status: "all", category: "all" });
  const hasActiveFilters = filters.status !== "all" || filters.category !== "all" || query.trim() !== "";
  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 8);

  const handleDelete = async () => {
    const id = deleteDialog?.item?.id;
    if (!id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    const res = await dispatch(removeBlog(id));
    setIsDeleting(false);
    if (res?.success) toast.success("Blog post deleted");
    else toast.error("Failed to delete");
    setDeleteDialog({ open: false, item: null });
  };

  const handleToggleFeatured = async (blog) => {
    await dispatch(editBlog(blog.id, { ...blog, featured: !blog.featured }));
    toast.success(`${!blog.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  const publishedCount = all.filter((b) => b.status === "published").length;
  const featuredCount = all.filter((b) => b.featured).length;
  const totalViews = all.reduce((acc, b) => acc + (b.views || 0), 0);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Blog Posts" description="Manage articles, guides, and blog content">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/content-ads/blogs/add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Plus className="h-4 w-4" /> New Post
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Posts" value={all.length} icon={BookOpen} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Published" value={publishedCount} icon={FileText} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Featured" value={featuredCount} icon={Star} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} color="rgba(124,58,237,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search blog posts..." />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap", showFilters || hasActiveFilters ? "border-[#0F69B0] bg-[#0F69B0]/8 text-[#0F69B0]" : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/30 hover:text-[#0F69B0]")}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {hasActiveFilters && <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>}
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <FilterDropdown label="Status" value={filters.status || "all"} options={statusFilterOptions} onChange={(v) => updateFilter("status", v)} />
                  <FilterDropdown label="Category" value={filters.category || "all"} options={categoryFilterOptions} onChange={(v) => updateFilter("category", v)} />
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
            <LoadingSpinner size="lg" text="Loading blog posts..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState icon={BookOpen} title="No blog posts found" description={hasActiveFilters ? "Try adjusting your search or filters" : "Write your first blog post"}
              action={<button onClick={() => router.push("/content-ads/blogs/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><Plus className="h-4 w-4" />New Post</button>}
            />
          ) : (
            <>
              <div className="space-y-3">
                {paginatedData.map((blog, i) => {
                  const catOpt = blogCategoryOptions.find((c) => c.value === blog.category);
                  return (
                    <motion.div key={blog.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="group rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all shadow-[0_1px_6px_rgba(15,105,176,0.04)] overflow-hidden">
                      <div className="flex items-start gap-4 p-4">
                        <div className="h-20 w-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/[0.04] shrink-0 border border-gray-100 dark:border-white/[0.06]">
                          {blog.coverImage ? (
                            <img src={blog.coverImage} alt={blog.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center"><BookOpen className="h-6 w-6 text-muted-foreground/30" /></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <h3 className="text-sm font-black text-foreground truncate">{blog.title}</h3>
                                {blog.featured && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />}
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(15,105,176,0.08)", color: "#0F69B0" }}>{catOpt?.label || blog.category}</span>
                                <StatusBadge status={blog.status} />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => router.push(`/content-ads/blogs/${blog.id}`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="View"><Eye className="h-3.5 w-3.5" /></button>
                              <button onClick={() => router.push(`/content-ads/blogs/${blog.id}`)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit"><Edit2 className="h-3.5 w-3.5" /></button>
                              <button onClick={() => handleToggleFeatured(blog)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-muted-foreground hover:text-yellow-500 transition-all cursor-pointer" title={blog.featured ? "Unfeature" : "Feature"}><Star className={cn("h-3.5 w-3.5", blog.featured && "fill-yellow-400 text-yellow-400")} /></button>
                              <button onClick={() => setDeleteDialog({ open: true, item: blog })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 mb-2 leading-relaxed">{blog.excerpt}</p>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium flex-wrap">
                            <span>By: <span className="font-bold text-foreground">{blog.author?.name}</span></span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{blog.readTime} min read</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{(blog.views || 0).toLocaleString()} views</span>
                            {blog.publishedAt && <span>{formatDate(blog.publishedAt)}</span>}
                            {(blog.tags || []).slice(0, 3).map((tag) => (
                              <span key={tag} className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/[0.06] text-[9px] font-bold">#{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, item: null })} onConfirm={handleDelete} title="Delete Blog Post" description={`Are you sure you want to delete "${deleteDialog.item?.title}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}