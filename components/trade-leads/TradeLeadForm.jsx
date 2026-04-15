"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/helpers";
import FileUpload from "@/components/common/FileUpload";
import { dummyCategories } from "@/data/dummyCategories";

const typeOptions = [
  { value: "buy", label: "Buy Lead" },
  { value: "sell", label: "Sell Lead" },
];
const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];
const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];
const unitOptions = ["KG", "Tons", "Units", "Pieces", "Liters", "Meters", "Boxes", "Sets"];

export default function TradeLeadForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safe = initialData && typeof initialData === "object" ? initialData : {};
  const [form, setForm] = useState({
    title: "", slug: "", description: "", type: "buy", status: "pending", featured: false,
    category: "", subCategory: "", quantity: "", unit: "KG",
    budget: "", budgetMin: "", budgetMax: "", currency: "AFN",
    deliveryLocation: "", deliveryTimeline: "", paymentTerms: "",
    requirements: [], images: [], thumbnail: "", tags: [],
    priority: "medium", expiresAt: "",
    ...safe,
  });
  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(!safe.slug);
  const [tagInput, setTagInput] = useState("");
  const [reqInput, setReqInput] = useState("");

  useEffect(() => {
    if (autoSlug && form.title) setForm((p) => ({ ...p, slug: generateSlug(form.title) }));
  }, [form.title, autoSlug]);

  const set = (k, v) => { setForm((p) => ({ ...p, [k]: v })); if (errors[k]) setErrors((p) => ({ ...p, [k]: "" })); };
  const addTag = () => { const t = tagInput.trim().toLowerCase(); if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]); setTagInput(""); };
  const removeTag = (t) => set("tags", form.tags.filter((x) => x !== t));
  const addReq = () => { if (reqInput.trim()) set("requirements", [...form.requirements, reqInput.trim()]); setReqInput(""); };
  const removeReq = (i) => set("requirements", form.requirements.filter((_, idx) => idx !== i));
  const addImage = (url) => { if (url && !form.images.includes(url)) { set("images", [...form.images, url]); if (!form.thumbnail) set("thumbnail", url); } };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = "Title is required";
    if (!form.type) errs.type = "Type is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ ...form, budget: Number(form.budget) || 0, budgetMin: Number(form.budgetMin) || 0, budgetMax: Number(form.budgetMax) || 0 });
  };

  const inputClass = (f) => cn("w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
    errors[f] ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]");

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Title *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Looking for Bulk Pine Nuts" className={inputClass("title")} />
            {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Slug</label>
            <div className="relative">
              <input type="text" value={form.slug} onChange={(e) => { setAutoSlug(false); set("slug", e.target.value); }} placeholder="auto-generated" className={cn(inputClass("slug"), "pr-10")} />
              <button type="button" onClick={() => { setAutoSlug(true); set("slug", generateSlug(form.title)); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F69B0] cursor-pointer"><RefreshCw className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe what you need or offer..." rows={5} className={cn(inputClass("description"), "resize-none")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Type *</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Priority</label>
              <select value={form.priority} onChange={(e) => set("priority", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                <option value="">Select category</option>
                {(dummyCategories || []).map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Budget (AFN)</label>
              <input type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="0" min="0" className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Min Budget</label>
              <input type="number" value={form.budgetMin} onChange={(e) => set("budgetMin", e.target.value)} placeholder="0" min="0" className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Max Budget</label>
              <input type="number" value={form.budgetMax} onChange={(e) => set("budgetMax", e.target.value)} placeholder="0" min="0" className={inputClass()} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Quantity</label>
              <input type="text" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} placeholder="e.g. 500" className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Unit</label>
              <select value={form.unit} onChange={(e) => set("unit", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                {unitOptions.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Images</label>
            <FileUpload value="" onChange={addImage} label="Upload lead images" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Delivery Location</label>
              <input type="text" value={form.deliveryLocation} onChange={(e) => set("deliveryLocation", e.target.value)} placeholder="e.g. Kabul, Afghanistan" className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Delivery Timeline</label>
              <input type="text" value={form.deliveryTimeline} onChange={(e) => set("deliveryTimeline", e.target.value)} placeholder="e.g. Within 30 days" className={inputClass()} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Payment Terms</label>
            <input type="text" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} placeholder="e.g. L/C at sight" className={inputClass()} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Expiry Date</label>
            <input type="datetime-local" value={form.expiresAt ? form.expiresAt.slice(0, 16) : ""} onChange={(e) => set("expiresAt", new Date(e.target.value).toISOString())} className={inputClass()} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Requirements</label>
            <div className="flex gap-2">
              <input type="text" value={reqInput} onChange={(e) => setReqInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addReq(); } }} placeholder="Add a requirement" className={cn(inputClass(), "flex-1")} />
              <button type="button" onClick={addReq} className="px-4 py-3 rounded-xl text-sm font-bold text-white cursor-pointer shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><Plus className="h-4 w-4" /></button>
            </div>
            {form.requirements.length > 0 && (
              <div className="space-y-1 mt-2">
                {form.requirements.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                    <p className="text-xs font-medium text-foreground flex-1">{r}</p>
                    <button type="button" onClick={() => removeReq(i)} className="text-muted-foreground hover:text-red-500 cursor-pointer"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Tags</label>
            <div className="flex gap-2">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} placeholder="Type tag and press Enter" className={cn(inputClass(), "flex-1")} />
              <button type="button" onClick={addTag} className="px-4 py-3 rounded-xl text-sm font-bold text-white cursor-pointer shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}><Plus className="h-4 w-4" /></button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0F69B0]/10 text-[#0F69B0]">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="cursor-pointer hover:text-red-500"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button type="button" onClick={() => set("featured", !form.featured)} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer shrink-0", form.featured ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}>
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", form.featured ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">Featured Lead</p>
              <p className="text-[11px] text-muted-foreground font-medium">Show prominently on the marketplace</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <X className="h-4 w-4" /> Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : safe.id ? "Update Lead" : "Create Lead"}
        </button>
      </div>
    </motion.form>
  );
}