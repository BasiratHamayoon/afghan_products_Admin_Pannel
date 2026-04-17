"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Edit2, Trash2, Eye, Star, XCircle, Calendar, Hash, CheckCircle, Clock, BookOpen } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import BlogEditor from "@/components/content/BlogEditor";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchBlogById, removeBlog, editBlog } from "@/store/actions/contentActions";
import { blogCategoryOptions } from "@/data/dummyContent";
import { formatDateTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = ["Overview", "Edit"];

export default function BlogDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedBlog: blog, isLoading } = useSelector((s) => s.content);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (id) dispatch(fetchBlogById(id)); }, [dispatch, id]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const handleUpdate = async (data) => {
    if (!id) return;
    setIsSaving(true);
    const res = await dispatch(editBlog(id, data));
    setIsSaving(false);
    if (res?.success) { toast.success("Blog post updated!"); setActiveTab("Overview"); }
    else toast.error("Failed to update blog post");
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeBlog(id));
    setIsDeleting(false);
    if (res?.success) { toast.success("Blog post deleted"); router.push("/content-ads/blogs"); }
    else toast.error("Failed to delete");
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading blog post..." /></div>;

  if (!blog || !blog.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><XCircle className="h-8 w-8 text-red-500" /></div>
        <h2 className="text-lg font-black text-foreground">Blog post not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The blog post does not exist or has been deleted.</p>
        <button onClick={() => router.push("/content-ads")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <ArrowLeft className="h-4 w-4" /> Back to Content & ads
        </button>
      </div>
    );
  }

  const catOpt = blogCategoryOptions.find((c) => c.value === blog.category);

  return (
    <div>
      <Breadcrumb />
      <PageHeader title={blog.title || "Blog Detail"} description="Manage details for this blog post">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/content-ads")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button onClick={() => setActiveTab("Edit")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" /> Edit
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { label: "Total Views", value: (blog.views || 0).toLocaleString(), icon: Eye, color: "rgba(15,105,176,0.1)", iconColor: "#0F69B0" },
          { label: "Read Time", value: `${blog.readTime || 0} min`, icon: Clock, color: "rgba(124,58,237,0.1)", iconColor: "#7c3aed" },
          { label: "Featured", value: blog.featured ? "Yes" : "No", icon: Star, color: "rgba(245,158,11,0.1)", iconColor: "#f59e0b" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col justify-between">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.color }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
        <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-white/[0.04]">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer", activeTab === tab ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground")}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {blog.coverImage && (
                  <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] mb-6 h-52">
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] mb-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Excerpt</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">{blog.excerpt}</p>
                </div>

                {(blog.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]">#{tag}</span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Blog ID", value: blog.id, icon: Hash },
                    { label: "Category", value: catOpt?.label || blog.category, icon: BookOpen },
                    { label: "Status", value: <StatusBadge status={blog.status} />, icon: CheckCircle },
                    { label: "Author", value: blog.author?.name || "—", icon: null },
                    { label: "Published At", value: blog.publishedAt ? formatDateTime(blog.publishedAt) : "Not published", icon: Calendar },
                    { label: "Created At", value: formatDateTime(blog.createdAt), icon: Calendar },
                    { label: "Updated At", value: formatDateTime(blog.updatedAt), icon: Calendar },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                      {item.icon && (
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                          <item.icon className="h-4 w-4 text-[#0F69B0]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                        <div className="text-sm font-bold text-foreground break-all">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Content Preview</p>
                  <div className="text-sm font-medium text-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: blog.content || "" }} />
                </div>
              </motion.div>
            )}

            {activeTab === "Edit" && (
              <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <BlogEditor initialData={blog} onSubmit={handleUpdate} onCancel={() => setActiveTab("Overview")} isLoading={isSaving} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} title="Delete Blog Post" description={`Are you sure you want to delete "${blog.title}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}