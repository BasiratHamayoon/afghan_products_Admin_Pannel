"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, RefreshCw, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/helpers";
import FileUpload from "@/components/common/FileUpload";
import { dummyCategories } from "@/data/dummyCategories";

const statusOptions = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function ProductForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "",
    comparePrice: "", sku: "", stock: "", lowStockThreshold: 10,
    category: "", categoryId: "", subCategory: "", brand: "",
    seller: "", status: "pending", featured: false,
    images: [], thumbnail: "", tags: [], weight: "",
    dimensions: { length: "", width: "", height: "" },
    ...safe,
  });

  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(!safe.slug);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, autoSlug]);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const setDim = (key, value) => {
    setForm((prev) => ({ ...prev, dimensions: { ...prev.dimensions, [key]: value } }));
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      set("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag) => set("tags", form.tags.filter((t) => t !== tag));

  const addImage = (url) => {
    if (url && !form.images.includes(url)) {
      const newImages = [...form.images, url];
      set("images", newImages);
      if (!form.thumbnail) set("thumbnail", url);
    }
  };

  const removeImage = (url) => {
    const newImages = form.images.filter((img) => img !== url);
    set("images", newImages);
    if (form.thumbnail === url) set("thumbnail", newImages[0] || "");
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Product name is required";
    if (!form.price || isNaN(form.price)) errs.price = "Valid price is required";
    if (!form.sku?.trim()) errs.sku = "SKU is required";
    if (form.stock === "" || isNaN(form.stock)) errs.stock = "Stock quantity is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ ...form, price: Number(form.price), comparePrice: Number(form.comparePrice) || 0, stock: Number(form.stock) });
  };

  const inputClass = (field) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
    errors[field]
      ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
      : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Product Name *</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Samsung Galaxy S24 Ultra" className={inputClass("name")} />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Slug</label>
            <div className="relative">
              <input type="text" value={form.slug} onChange={(e) => { setAutoSlug(false); set("slug", e.target.value); }} placeholder="e.g. samsung-galaxy-s24-ultra" className={cn(inputClass("slug"), "pr-10")} />
              <button type="button" onClick={() => { setAutoSlug(true); set("slug", generateSlug(form.name)); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F69B0] cursor-pointer transition-colors" title="Auto-generate">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe this product..." rows={4} className={cn(inputClass("description"), "resize-none")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Price (AFN) *</label>
              <input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="0" min="0" className={inputClass("price")} />
              {errors.price && <p className="text-[11px] text-red-500 font-semibold">{errors.price}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Compare Price</label>
              <input type="number" value={form.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} placeholder="0" min="0" className={inputClass("comparePrice")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">SKU *</label>
              <input type="text" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="e.g. SAM-S24U-256" className={inputClass("sku")} />
              {errors.sku && <p className="text-[11px] text-red-500 font-semibold">{errors.sku}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Brand</label>
              <input type="text" value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Samsung" className={inputClass("brand")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Stock *</label>
              <input type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} placeholder="0" min="0" className={inputClass("stock")} />
              {errors.stock && <p className="text-[11px] text-red-500 font-semibold">{errors.stock}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Low Stock Alert</label>
              <input type="number" value={form.lowStockThreshold} onChange={(e) => set("lowStockThreshold", e.target.value)} placeholder="10" min="0" className={inputClass("lowStockThreshold")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={cn(inputClass("category"), "cursor-pointer")}>
                <option value="">Select category</option>
                {(dummyCategories || []).map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={cn(inputClass("status"), "cursor-pointer")}>
                {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Seller</label>
            <input type="text" value={form.seller} onChange={(e) => set("seller", e.target.value)} placeholder="e.g. TechHub Kabul" className={inputClass("seller")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Type a tag and press Enter"
                className={cn(inputClass(), "flex-1")}
              />
              <button type="button" onClick={addTag} className="px-4 py-3 rounded-xl text-sm font-bold text-white cursor-pointer shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0F69B0]/10 text-[#0F69B0]">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="cursor-pointer hover:text-red-500 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Product Images</label>
            <FileUpload value="" onChange={addImage} label="Upload product image" />
            {form.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                    <img src={img} alt={`Product ${i + 1}`} className="h-20 w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <button type="button" onClick={() => set("thumbnail", img)} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer", img === form.thumbnail ? "bg-yellow-400 text-white" : "bg-white/80 text-foreground")}>
                        {img === form.thumbnail ? "★ Main" : "Set Main"}
                      </button>
                      <button type="button" onClick={() => removeImage(img)} className="h-6 w-6 rounded-full bg-red-500 flex items-center justify-center cursor-pointer">
                        <Trash2 className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Thumbnail URL</label>
            <input type="text" value={form.thumbnail} onChange={(e) => set("thumbnail", e.target.value)} placeholder="https://..." className={inputClass("thumbnail")} />
            {form.thumbnail && (
              <div className="mt-2 h-20 w-20 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                <img src={form.thumbnail} alt="Thumbnail" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Weight (kg)</label>
            <input type="number" value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="0.00" min="0" step="0.01" className={inputClass("weight")} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Dimensions (cm)</label>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={form.dimensions?.length || ""} onChange={(e) => setDim("length", e.target.value)} placeholder="Length" className={inputClass()} />
              <input type="number" value={form.dimensions?.width || ""} onChange={(e) => setDim("width", e.target.value)} placeholder="Width" className={inputClass()} />
              <input type="number" value={form.dimensions?.height || ""} onChange={(e) => setDim("height", e.target.value)} placeholder="Height" className={inputClass()} />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set("featured", !form.featured)}
                className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer shrink-0", form.featured ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}
              >
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", form.featured ? "translate-x-5" : "translate-x-0")} />
              </button>
              <div>
                <p className="text-sm font-bold text-foreground">Featured Product</p>
                <p className="text-[11px] text-muted-foreground font-medium">Show on homepage and featured sections</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : safe.id ? "Update Product" : "Create Product"}
        </button>
      </div>
    </motion.form>
  );
}