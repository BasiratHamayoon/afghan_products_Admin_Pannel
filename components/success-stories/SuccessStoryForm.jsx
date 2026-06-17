"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SuccessStoryForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const [fullName, setFullName] = useState(safe.fullName || "");
  const [companyName, setCompanyName] = useState(safe.companyName || "");
  const [profilePicture, setProfilePicture] = useState(safe.profilePicture || "");
  const [rating, setRating] = useState(safe.rating ?? 5);
  const [story, setStory] = useState(safe.story || "");
  const [location, setLocation] = useState(safe.location || "");
  const [storyDate, setStoryDate] = useState(
    safe.storyDate ? new Date(safe.storyDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [displayOrder, setDisplayOrder] = useState(safe.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [errors, setErrors] = useState({});

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!companyName.trim()) errs.companyName = "Company name is required";
    if (!profilePicture.trim()) errs.profilePicture = "Profile picture URL is required";
    if (!story.trim()) errs.story = "Story is required";
    if (!location.trim()) errs.location = "Location is required";
    if (!storyDate) errs.storyDate = "Story date is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      fullName: fullName.trim(),
      companyName: companyName.trim(),
      profilePicture: profilePicture.trim(),
      rating,
      story: story.trim(),
      location: location.trim(),
      storyDate,
      displayOrder,
      isActive,
    };

    onSubmit(payload);
  };

  const inputClass = (err) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
    err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-8">
      {/* ─── Person Info ─────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />Person Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={fullName} onChange={(e) => { setFullName(e.target.value); clearErr("fullName"); }} placeholder="e.g. Ahmad Khan" disabled={isLoading} className={inputClass(errors.fullName)} />
            {errors.fullName && <p className="text-[11px] text-red-500 font-semibold">{errors.fullName}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Company Name <span className="text-red-500">*</span></label>
            <input type="text" value={companyName} onChange={(e) => { setCompanyName(e.target.value); clearErr("companyName"); }} placeholder="e.g. Afghan Exports Ltd" disabled={isLoading} className={inputClass(errors.companyName)} />
            {errors.companyName && <p className="text-[11px] text-red-500 font-semibold">{errors.companyName}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Profile Picture URL <span className="text-red-500">*</span></label>
            <input type="text" value={profilePicture} onChange={(e) => { setProfilePicture(e.target.value); clearErr("profilePicture"); }} placeholder="https://..." disabled={isLoading} className={inputClass(errors.profilePicture)} />
            {errors.profilePicture && <p className="text-[11px] text-red-500 font-semibold">{errors.profilePicture}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Location <span className="text-red-500">*</span></label>
            <input type="text" value={location} onChange={(e) => { setLocation(e.target.value); clearErr("location"); }} placeholder="e.g. Kabul, Afghanistan" disabled={isLoading} className={inputClass(errors.location)} />
            {errors.location && <p className="text-[11px] text-red-500 font-semibold">{errors.location}</p>}
          </div>
        </div>
      </div>

      {/* ─── Story ───────────────────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Story
        </h3>
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Success Story <span className="text-red-500">*</span></label>
            <textarea value={story} onChange={(e) => { setStory(e.target.value); clearErr("story"); }} rows={5} placeholder="Tell the success story..." disabled={isLoading} className={cn(inputClass(errors.story), "resize-none")} />
            {errors.story && <p className="text-[11px] text-red-500 font-semibold">{errors.story}</p>}
          </div>
        </div>
      </div>

      {/* ─── Rating & Settings ───────────────────────────────── */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />Rating & Settings
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Rating */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Rating</label>
            <div className="flex items-center gap-1 p-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04]">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  disabled={isLoading}
                  className="p-1 cursor-pointer disabled:opacity-60"
                >
                  <Star className={cn("h-6 w-6 transition-colors", s <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-white/20")} />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-foreground">{rating}/5</span>
            </div>
          </div>

          {/* Story Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Story Date <span className="text-red-500">*</span></label>
            <input type="date" value={storyDate} onChange={(e) => { setStoryDate(e.target.value); clearErr("storyDate"); }} disabled={isLoading} className={inputClass(errors.storyDate)} />
            {errors.storyDate && <p className="text-[11px] text-red-500 font-semibold">{errors.storyDate}</p>}
          </div>

          {/* Display Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Display Order</label>
            <input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} min={0} disabled={isLoading} className={inputClass()} />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button type="button" onClick={() => setIsActive(!isActive)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}>
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div><p className="text-sm font-bold text-foreground">Active</p><p className="text-[11px] text-muted-foreground font-medium">{isActive ? "Visible to users" : "Hidden"}</p></div>
          </div>
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"><X className="h-4 w-4" />Cancel</button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />{safe.id || safe._id ? "Update" : "Create"}</>}
        </button>
      </div>
    </motion.form>
  );
}