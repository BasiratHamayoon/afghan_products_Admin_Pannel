"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/helpers";
import FileUpload from "@/components/common/FileUpload";
import { blogCategoryOptions } from "@/data/dummyContent";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

export default function BlogEditor({ initialData, onSubmit, onCancel, isLoading }) {
  const safe = initialData && typeof initialData === "object" ? initialData : {};
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "business",
    tags: [],
    status: "draft",
    featured: false,
    coverImage: "",
    readTime: 5,
    author: { name: "Admin", avatar: null },
    ...safe,
  });
  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(!safe.slug);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (autoSlug && form.title) {
      setForm((p) => ({ ...p, slug: generateSlug(form.title) }));
    }
  }, [form.title, autoSlug]);

  const handleChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleAddTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !(form.tags || []).includes(t)) {
      handleChange("tags", [...(form.tags || []), t]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    handleChange("tags", (form.tags || []).filter((t) => t !== tag));
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = "Title is required";
    if (!form.excerpt?.trim()) errs.excerpt = "Excerpt is required";
    if (!form.content?.trim()) errs.content = "Content is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  const inputClass = (hasErr) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
    hasErr
      ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
      : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40";

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Blog Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Enter blog post title..." className={inputClass(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Slug</label>
            <div className="relative">
              <input type="text" value={form.slug} onChange={(e) => { setAutoSlug(false); handleChange("slug", e.target.value); }} placeholder="auto-generated-slug" className={cn(inputClass(false), "pr-10")} />
              <button type="button" onClick={() => { setAutoSlug(true); handleChange("slug", generateSlug(form.title)); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F69B0] cursor-pointer transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Excerpt <span className="text-red-500">*</span></label>
            <textarea value={form.excerpt} onChange={(e) => handleChange("excerpt", e.target.value)} placeholder="Brief summary of the blog post (shown in listings)..." rows={3} className={cn(inputClass(errors.excerpt), "resize-none")} />
            {errors.excerpt && <p className="text-[11px] text-red-500 font-semibold">{errors.excerpt}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Content <span className="text-red-500">*</span></label>
            <textarea value={form.content} onChange={(e) => handleChange("content", e.target.value)} placeholder="Write the full blog content here. You can use HTML tags for formatting..." rows={14} className={cn(inputClass(errors.content), "resize-none font-mono text-xs")} />
            {errors.content && <p className="text-[11px] text-red-500 font-semibold">{errors.content}</p>}
            <p className="text-[10px] text-muted-foreground font-medium">Supports basic HTML tags for formatting (h2, p, strong, em, ul, li)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Tags</label>
            <div className="flex items-center gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }} placeholder="Add tag and press Enter" className={cn(inputClass(false), "flex-1")} />
              <button type="button" onClick={handleAddTag} className="px-4 py-3 rounded-xl text-xs font-bold text-white cursor-pointer shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                Add
              </button>
            </div>
            {(form.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]">
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Cover Image</label>
            <FileUpload value={form.coverImage} onChange={(val) => handleChange("coverImage", val)} label="Upload cover image" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Category</label>
            <select value={form.category} onChange={(e) => handleChange("category", e.target.value)} className={selectClass}>
              {blogCategoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
            <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className={selectClass}>
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Read Time (min)</label>
            <input type="number" value={form.readTime} onChange={(e) => handleChange("readTime", Number(e.target.value))} min={1} className={inputClass(false)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Author Name</label>
            <input type="text" value={form.author?.name || ""} onChange={(e) => handleChange("author", { ...form.author, name: e.target.value })} placeholder="Author name" className={inputClass(false)} />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button type="button" onClick={() => handleChange("featured", !form.featured)}
              className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0", form.featured ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}>
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", form.featured ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">Featured Post</p>
              <p className="text-[11px] text-muted-foreground font-medium">Show on homepage featured section</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <X className="h-4 w-4" />Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : safe.id ? "Update Post" : "Publish Post"}
        </button>
      </div>
    </motion.form>
  );
}