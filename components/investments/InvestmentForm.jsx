// components/investments/InvestmentForm.jsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/helpers";
import FileUpload from "@/components/common/FileUpload";
import { investmentTypeOptions, riskLevelOptions } from "@/data/dummyInvestments";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const priorityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "AFN", label: "AFN (؋)" },
  { value: "EUR", label: "EUR (€)" },
];

const durationUnitOptions = [
  { value: "months", label: "Months" },
  { value: "years", label: "Years" },
];

export default function InvestmentForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safeInitial = initialData && typeof initialData === "object" ? initialData : {};

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    type: "agriculture",
    status: "pending",
    priority: "medium",
    featured: false,
    image: "",
    category: "",
    location: "",
    currency: "USD",
    targetAmount: 0,
    roi: 0,
    minInvestment: 0,
    maxInvestment: 0,
    duration: 12,
    durationUnit: "months",
    riskLevel: "medium",
    startDate: "",
    endDate: "",
    tags: [],
    investor: { name: "", email: "", phone: "" },
    manager: { name: "", email: "" },
    ...safeInitial,
  });

  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(!safeInitial.slug);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (autoSlug && form.title) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.title) }));
    }
  }, [form.title, autoSlug]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleNestedChange = (parent, key, value) => {
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }));
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !form.tags.includes(tag)) {
      handleChange("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag) => {
    handleChange("tags", form.tags.filter((t) => t !== tag));
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = "Title is required";
    if (!form.description?.trim()) errs.description = "Description is required";
    if (!form.location?.trim()) errs.location = "Location is required";
    if (form.targetAmount <= 0) errs.targetAmount = "Target amount must be greater than 0";
    if (form.roi < 0) errs.roi = "ROI cannot be negative";
    if (form.minInvestment < 0) errs.minInvestment = "Min investment cannot be negative";
    if (form.maxInvestment < form.minInvestment) errs.maxInvestment = "Max must be >= Min";
    if (form.duration <= 0) errs.duration = "Duration must be greater than 0";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const inputClass = (hasError) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
      hasError
        ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40";

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
              Investment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Afghan Saffron Export Initiative"
              className={inputClass(errors.title)}
            />
            {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Slug</label>
            <div className="relative">
              <input
                type="text"
                value={form.slug}
                onChange={(e) => { setAutoSlug(false); handleChange("slug", e.target.value); }}
                placeholder="auto-generated-slug"
                className={inputClass(false) + " pr-10"}
              />
              <button
                type="button"
                onClick={() => { setAutoSlug(true); handleChange("slug", generateSlug(form.title)); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F69B0] cursor-pointer transition-colors"
                title="Auto-generate slug"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe this investment opportunity..."
              rows={4}
              className={cn(inputClass(errors.description), "resize-none")}
            />
            {errors.description && <p className="text-[11px] text-red-500 font-semibold">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Type</label>
              <select value={form.type} onChange={(e) => handleChange("type", e.target.value)} className={selectClass}>
                {investmentTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
              <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className={selectClass}>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Priority</label>
              <select value={form.priority} onChange={(e) => handleChange("priority", e.target.value)} className={selectClass}>
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Risk Level</label>
              <select value={form.riskLevel} onChange={(e) => handleChange("riskLevel", e.target.value)} className={selectClass}>
                {riskLevelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="e.g. Herat, Afghanistan"
              className={inputClass(errors.location)}
            />
            {errors.location && <p className="text-[11px] text-red-500 font-semibold">{errors.location}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="e.g. Agriculture"
              className={inputClass(false)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Tags</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                placeholder="Add a tag and press Enter"
                className={inputClass(false) + " flex-1"}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-3 rounded-xl text-xs font-bold text-white cursor-pointer shrink-0"
                style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Investment Image</label>
            <FileUpload
              value={form.image}
              onChange={(val) => handleChange("image", val)}
              label="Upload investment image"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Currency</label>
              <select value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} className={selectClass}>
                {currencyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Target Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.targetAmount}
                onChange={(e) => handleChange("targetAmount", Number(e.target.value))}
                min={0}
                className={inputClass(errors.targetAmount)}
              />
              {errors.targetAmount && <p className="text-[11px] text-red-500 font-semibold">{errors.targetAmount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Min Investment</label>
              <input
                type="number"
                value={form.minInvestment}
                onChange={(e) => handleChange("minInvestment", Number(e.target.value))}
                min={0}
                className={inputClass(errors.minInvestment)}
              />
              {errors.minInvestment && <p className="text-[11px] text-red-500 font-semibold">{errors.minInvestment}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Max Investment</label>
              <input
                type="number"
                value={form.maxInvestment}
                onChange={(e) => handleChange("maxInvestment", Number(e.target.value))}
                min={0}
                className={inputClass(errors.maxInvestment)}
              />
              {errors.maxInvestment && <p className="text-[11px] text-red-500 font-semibold">{errors.maxInvestment}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Expected ROI (%)
              </label>
              <input
                type="number"
                value={form.roi}
                onChange={(e) => handleChange("roi", Number(e.target.value))}
                min={0}
                className={inputClass(errors.roi)}
              />
              {errors.roi && <p className="text-[11px] text-red-500 font-semibold">{errors.roi}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Duration
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => handleChange("duration", Number(e.target.value))}
                  min={1}
                  className={cn(inputClass(errors.duration), "flex-1")}
                />
                <select value={form.durationUnit} onChange={(e) => handleChange("durationUnit", e.target.value)} className={cn(selectClass, "w-28")}>
                  {durationUnitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              {errors.duration && <p className="text-[11px] text-red-500 font-semibold">{errors.duration}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Start Date</label>
              <input
                type="date"
                value={form.startDate ? form.startDate.split("T")[0] : ""}
                onChange={(e) => handleChange("startDate", e.target.value ? new Date(e.target.value).toISOString() : "")}
                className={inputClass(false)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">End Date</label>
              <input
                type="date"
                value={form.endDate ? form.endDate.split("T")[0] : ""}
                onChange={(e) => handleChange("endDate", e.target.value ? new Date(e.target.value).toISOString() : "")}
                className={inputClass(false)}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.02] space-y-4">
            <p className="text-xs font-black text-foreground uppercase tracking-widest">Investor Info</p>
            <input
              type="text"
              value={form.investor?.name || ""}
              onChange={(e) => handleNestedChange("investor", "name", e.target.value)}
              placeholder="Investor Name"
              className={inputClass(false)}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="email"
                value={form.investor?.email || ""}
                onChange={(e) => handleNestedChange("investor", "email", e.target.value)}
                placeholder="Email"
                className={inputClass(false)}
              />
              <input
                type="text"
                value={form.investor?.phone || ""}
                onChange={(e) => handleNestedChange("investor", "phone", e.target.value)}
                placeholder="Phone"
                className={inputClass(false)}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.02] space-y-4">
            <p className="text-xs font-black text-foreground uppercase tracking-widest">Manager Info</p>
            <input
              type="text"
              value={form.manager?.name || ""}
              onChange={(e) => handleNestedChange("manager", "name", e.target.value)}
              placeholder="Manager Name"
              className={inputClass(false)}
            />
            <input
              type="email"
              value={form.manager?.email || ""}
              onChange={(e) => handleNestedChange("manager", "email", e.target.value)}
              placeholder="Email"
              className={inputClass(false)}
            />
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
              <p className="text-sm font-bold text-foreground">Featured Investment</p>
              <p className="text-[11px] text-muted-foreground font-medium">
                Highlight on homepage and investor dashboard
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
          {isLoading ? "Saving..." : safeInitial.id ? "Update Investment" : "Create Investment"}
        </button>
      </div>
    </motion.form>
  );
}