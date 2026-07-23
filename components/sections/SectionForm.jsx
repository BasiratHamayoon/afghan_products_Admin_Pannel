"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function SectionForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation();
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const [name, setName] = useState(safe.name || "");
  const [description, setDescription] = useState(safe.description || "");
  const [sortOrder, setSortOrder] = useState(safe.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [isArchived, setIsArchived] = useState(safe.isArchived ?? false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = t("sections.sectionNameRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      sortOrder,
      isActive,
      isArchived,
    });
  };

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("sections.sectionNameLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }}
              placeholder={t("sections.sectionNamePlaceholder")}
              disabled={isLoading}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
                errors.name ? "border-red-400 focus:border-red-500" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
              )}
            />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("sections.descriptionLabel")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("sections.descriptionPlaceholder")}
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("sections.sortOrderLabel")}</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={0}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              disabled={isLoading}
              className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}
            >
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{t("sections.activeSectionLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{t("sections.activeSectionDesc")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsArchived(!isArchived)}
              disabled={isLoading}
              className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isArchived ? "bg-amber-500" : "bg-gray-300 dark:bg-white/20")}
            >
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isArchived ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{t("sections.archiveSectionLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{t("sections.archiveSectionDesc")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <X className="h-4 w-4" />{t("sections.cancel")}
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />{t("sections.saving")}</>
            : <><Save className="h-4 w-4" />{safe.id || safe._id ? t("sections.updateSection") : t("sections.createSection")}</>
          }
        </button>
      </div>
    </motion.form>
  );
}