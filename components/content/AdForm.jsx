"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/common/FileUpload";
import { adTypeOptions, adPlacementOptions } from "@/data/dummyContent";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "scheduled", label: "Scheduled" },
];

export default function AdForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safe = initialData && typeof initialData === "object" ? initialData : {};
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    type: "sponsored",
    placement: "homepage",
    status: "active",
    budget: "",
    cpc: "",
    startDate: "",
    endDate: "",
    advertiser: { name: "", email: "" },
    ...safe,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title?.trim()) errs.title = "Title is required";
    if (!form.link?.trim()) errs.link = "Link is required";
    if (!form.budget) errs.budget = "Budget is required";
    if (!form.advertiser?.name?.trim()) errs.advertiserName = "Advertiser name is required";
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
              Ad Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g. Premium Saffron Brand Spotlight"
              className={inputClass(errors.title)}
            />
            {errors.title && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the ad..."
              rows={3}
              className={cn(inputClass(false), "resize-none")}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Destination URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => handleChange("link", e.target.value)}
              placeholder="e.g. /products/saffron"
              className={inputClass(errors.link)}
            />
            {errors.link && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.link}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Ad Type
              </label>
              <select
                value={form.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className={selectClass}
              >
                {adTypeOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Placement
              </label>
              <select
                value={form.placement}
                onChange={(e) => handleChange("placement", e.target.value)}
                className={selectClass}
              >
                {adPlacementOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className={selectClass}
              >
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                CPC ($)
              </label>
              <input
                type="number"
                value={form.cpc}
                onChange={(e) => handleChange("cpc", Number(e.target.value))}
                placeholder="0.00"
                min={0}
                step={0.01}
                className={inputClass(false)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Start Date
              </label>
              <input
                type="datetime-local"
                value={form.startDate ? form.startDate.slice(0, 16) : ""}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={inputClass(false)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                End Date
              </label>
              <input
                type="datetime-local"
                value={form.endDate ? form.endDate.slice(0, 16) : ""}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={inputClass(false)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Ad Image
            </label>
            <FileUpload
              value={form.image}
              onChange={(val) => handleChange("image", val)}
              label="Upload ad image"
            />
          </div>

          <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] space-y-4">
            <p className="text-xs font-black text-foreground uppercase tracking-widest">
              Advertiser Info
            </p>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Advertiser Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.advertiser?.name || ""}
                onChange={(e) =>
                  handleChange("advertiser", { ...form.advertiser, name: e.target.value })
                }
                placeholder="e.g. Afghan Gold Co."
                className={inputClass(errors.advertiserName)}
              />
              {errors.advertiserName && (
                <p className="text-[11px] text-red-500 font-semibold">
                  {errors.advertiserName}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Advertiser Email
              </label>
              <input
                type="email"
                value={form.advertiser?.email || ""}
                onChange={(e) =>
                  handleChange("advertiser", { ...form.advertiser, email: e.target.value })
                }
                placeholder="e.g. info@afghangold.af"
                className={inputClass(false)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              Total Budget (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={form.budget}
              onChange={(e) => handleChange("budget", Number(e.target.value))}
              placeholder="e.g. 500"
              min={0}
              className={inputClass(errors.budget)}
            />
            {errors.budget && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.budget}</p>
            )}
          </div>

          {form.image && (
            <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
              <img
                src={form.image}
                alt="Ad Preview"
                className="w-full h-36 object-cover"
              />
              <p className="text-[10px] text-muted-foreground font-medium text-center py-2">
                Ad Preview
              </p>
            </div>
          )}
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
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : safe.id ? "Update Ad" : "Create Ad"}
        </button>
      </div>
    </motion.form>
  );
}