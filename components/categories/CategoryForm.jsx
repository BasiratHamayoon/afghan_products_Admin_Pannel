"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/helpers";
import { validateCategoryForm } from "@/lib/validators";
import FileUpload from "@/components/common/FileUpload";
import { dummyCategories } from "@/data/dummyCategories";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const colorOptions = [
  "#0F69B0", "#7c3aed", "#10b981", "#f59e0b",
  "#ef4444", "#6366f1", "#ec4899", "#06b6d4",
];

const levelOptions = [
  { value: 1, label: "Main Category (Level 1)" },
  { value: 2, label: "Sub Category (Level 2)" },
  { value: 3, label: "Sub Sub Category (Level 3)" },
];

const emojiOptions = [
  "📦", "💻", "👗", "🌾", "🏺", "🏗️", "⚕️",
  "📱", "🥜", "🪑", "🔌", "🎁", "⌚", "💍", "👜",
];

export default function CategoryForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safeInitialData = initialData && typeof initialData === "object" ? initialData : {};

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    icon: "📦",
    image: "",
    color: "#0F69B0",
    status: "active",
    featured: false,
    level: 1,
    parentId: null,
    sortOrder: 1,
    ...safeInitialData,
  });

  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(!safeInitialData.slug);

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, autoSlug]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validateCategoryForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const parentOptions = (dummyCategories || []).filter(
    (c) => c && c.level === form.level - 1 && c.id !== safeInitialData.id
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g. Electronics"
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
                  : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
              )}
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Slug</label>
            <div className="relative">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setAutoSlug(false); handleChange("slug", e.target.value); }}
                placeholder="e.g. electronics"
                className={cn(
                  "w-full px-4 py-3 pr-10 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
                  errors.slug
                    ? "border-red-400"
                    : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
                )}
              />
              <button
                type="button"
                onClick={() => { setAutoSlug(true); handleChange("slug", generateSlug(form.name)); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F69B0] cursor-pointer transition-colors"
                title="Auto-generate slug"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            {errors.slug && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.slug}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe this category..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Level</label>
              <select
                value={form.level}
                onChange={(e) => handleChange("level", Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40"
              >
                {levelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.level > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Parent Category</label>
              <select
                value={form.parentId || ""}
                onChange={(e) => handleChange("parentId", e.target.value || null)}
                className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40"
              >
                <option value="">Select parent category</option>
                {parentOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Sort Order</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => handleChange("sortOrder", Number(e.target.value))}
              min={1}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Category Image</label>
            <FileUpload
              value={form.image}
              onChange={(val) => handleChange("image", val)}
              label="Upload category image"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Icon (Emoji)</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleChange("icon", emoji)}
                  className={cn(
                    "h-10 w-10 rounded-xl text-xl flex items-center justify-center transition-all cursor-pointer border-2",
                    form.icon === emoji
                      ? "border-[#0F69B0] bg-[#0F69B0]/10 scale-110"
                      : "border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/40 bg-white dark:bg-white/[0.04]"
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Color</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((clr) => (
                <button
                  key={clr}
                  type="button"
                  onClick={() => handleChange("color", clr)}
                  className={cn(
                    "h-8 w-8 rounded-xl transition-all cursor-pointer border-2",
                    form.color === clr ? "scale-125 border-white shadow-lg" : "border-transparent"
                  )}
                  style={{ backgroundColor: clr }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => handleChange("featured", !form.featured)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0",
                form.featured ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                  form.featured ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">Featured Category</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                Show on homepage and featured sections
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : safeInitialData.id ? "Update Category" : "Create Category"}
        </button>
      </div>
    </motion.form>
  );
}