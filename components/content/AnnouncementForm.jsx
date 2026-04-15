"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { announcementTypeOptions, targetAudienceOptions, priorityOptions } from "@/data/dummyContent";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "scheduled", label: "Scheduled" },
];

export default function AnnouncementForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safe = initialData && typeof initialData === "object" ? initialData : {};
  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "announcement",
    status: "active",
    priority: "medium",
    targetAudience: "all",
    isPinned: false,
    startDate: "",
    endDate: "",
    author: { name: "Admin Team" },
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
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Title <span className="text-red-500">*</span></label>
        <input type="text" value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Announcement title..." className={inputClass(errors.title)} />
        {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">Content <span className="text-red-500">*</span></label>
        <textarea value={form.content} onChange={(e) => handleChange("content", e.target.value)} placeholder="Write the announcement content here..." rows={6} className={cn(inputClass(errors.content), "resize-none")} />
        {errors.content && <p className="text-[11px] text-red-500 font-semibold">{errors.content}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Type</label>
          <select value={form.type} onChange={(e) => handleChange("type", e.target.value)} className={selectClass}>
            {announcementTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
          <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className={selectClass}>
            {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Priority</label>
          <select value={form.priority} onChange={(e) => handleChange("priority", e.target.value)} className={selectClass}>
            {priorityOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Target Audience</label>
          <select value={form.targetAudience} onChange={(e) => handleChange("targetAudience", e.target.value)} className={selectClass}>
            {targetAudienceOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Author / Team</label>
          <input type="text" value={form.author?.name || ""} onChange={(e) => handleChange("author", { ...form.author, name: e.target.value })} placeholder="e.g. Admin Team" className={inputClass(false)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">Start Date</label>
          <input type="datetime-local" value={form.startDate ? form.startDate.slice(0, 16) : ""} onChange={(e) => handleChange("startDate", e.target.value)} className={inputClass(false)} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-foreground uppercase tracking-widest">End Date</label>
          <input type="datetime-local" value={form.endDate ? form.endDate.slice(0, 16) : ""} onChange={(e) => handleChange("endDate", e.target.value)} className={inputClass(false)} />
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
        <button type="button" onClick={() => handleChange("isPinned", !form.isPinned)}
          className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0", form.isPinned ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}>
          <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", form.isPinned ? "translate-x-5" : "translate-x-0")} />
        </button>
        <div>
          <p className="text-sm font-bold text-foreground">Pin Announcement</p>
          <p className="text-[11px] text-muted-foreground font-medium">Show this announcement at the top of the list</p>
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
          {isLoading ? "Saving..." : safe.id ? "Update Announcement" : "Create Announcement"}
        </button>
      </div>
    </motion.form>
  );
}