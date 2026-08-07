"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, ImageIcon, Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/fileUrl";
import { useTranslation } from "react-i18next";

export default function CategoryForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t, i18n } = useTranslation();
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const currentLang = i18n.language || "en";

  const getNameValue = () => {
    if (!safe.nameMultilingual && !safe.name) return "";
    if (safe.nameMultilingual && typeof safe.nameMultilingual === "object") {
      return safe.nameMultilingual[currentLang] || safe.nameMultilingual.en || safe.nameMultilingual.fa || safe.nameMultilingual.ps || "";
    }
    if (safe.name && typeof safe.name === "object") {
      return safe.name[currentLang] || safe.name.en || safe.name.fa || safe.name.ps || "";
    }
    return typeof safe.name === "string" ? safe.name : "";
  };

  const getDescriptionValue = () => {
    if (!safe.descriptionMultilingual && !safe.description) return "";
    if (safe.descriptionMultilingual && typeof safe.descriptionMultilingual === "object") {
      return safe.descriptionMultilingual[currentLang] || safe.descriptionMultilingual.en || safe.descriptionMultilingual.fa || safe.descriptionMultilingual.ps || "";
    }
    if (safe.description && typeof safe.description === "object") {
      return safe.description[currentLang] || safe.description.en || safe.description.fa || safe.description.ps || "";
    }
    return typeof safe.description === "string" ? safe.description : "";
  };

  const [name, setName] = useState(getNameValue());
  const [description, setDescription] = useState(getDescriptionValue());
  const [sortOrder, setSortOrder] = useState(safe.sortOrder ?? 0);
  const [isArchived, setIsArchived] = useState(safe.isArchived ?? false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(safe.image ? getFileUrl(safe.image) : null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = t("categories.categoryNameRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const lang = currentLang === "ps" ? "ps" : currentLang === "fa" ? "fa" : "en";

    const formData = new FormData();
    formData.append(`name[${lang}]`, name.trim());
    formData.append(`description[${lang}]`, description.trim());
    formData.append("sortOrder", String(sortOrder));
    formData.append("isArchived", String(isArchived));
    if (imageFile) formData.append("image", imageFile);
    onSubmit(formData);
  };

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("categories.categoryName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }}
              placeholder={t("categories.categoryNamePlaceholder")}
              disabled={isLoading}
              dir={currentLang === "fa" || currentLang === "ps" ? "rtl" : "ltr"}
              className={cn(
                "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
                errors.name ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
              )}
            />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("categories.descriptionLabel")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("categories.descriptionPlaceholder")}
              rows={4}
              disabled={isLoading}
              dir={currentLang === "fa" || currentLang === "ps" ? "rtl" : "ltr"}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("categories.sortOrder")}</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={0}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
            />
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
              <p className="text-sm font-bold text-foreground">{t("categories.archiveCategoryLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{t("categories.archiveCategoryDesc")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("categories.categoryImage")}</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="category-image-upload" />
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.08] group">
                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="h-9 w-9 rounded-xl bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handleRemoveImage} disabled={isLoading} className="h-9 w-9 rounded-xl bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label htmlFor="category-image-upload" className={cn("flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer", isLoading ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-white/[0.08]" : "border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02]")}>
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">{t("categories.clickToUpload")}</p>
                <p className="text-[11px] text-muted-foreground/60 font-medium mt-1">{t("categories.uploadFormats")}</p>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <X className="h-4 w-4" />{t("categories.cancel")}
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          {isLoading ? (<><Loader2 className="h-4 w-4 animate-spin" />{t("categories.saving")}</>) : (<><Save className="h-4 w-4" />{safe.id || safe._id ? t("categories.updateCategory") : t("categories.createCategory")}</>)}
        </button>
      </div>
    </motion.form>
  );
}