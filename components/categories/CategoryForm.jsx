"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, ImageIcon, Upload, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/fileUrl";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

export default function CategoryForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation();
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const getMultiValue = (multiKey, flatKey) => {
    if (safe[multiKey] && typeof safe[multiKey] === "object") {
      return {
        en: safe[multiKey].en || "",
        fa: safe[multiKey].fa || "",
        ps: safe[multiKey].ps || "",
      };
    }
    if (safe[flatKey] && typeof safe[flatKey] === "object") {
      return {
        en: safe[flatKey].en || "",
        fa: safe[flatKey].fa || "",
        ps: safe[flatKey].ps || "",
      };
    }
    const flat = typeof safe[flatKey] === "string" ? safe[flatKey] : "";
    return { en: flat, fa: "", ps: "" };
  };

  const [activeLang, setActiveLang] = useState("en");
  const [name, setName] = useState(getMultiValue("nameMultilingual", "name"));
  const [description, setDescription] = useState(getMultiValue("descriptionMultilingual", "description"));
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

  const hasAtLeastOneName = () =>
    LANGUAGES.some((l) => name[l.code]?.trim() !== "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!hasAtLeastOneName()) {
      errs.name = t("categories.categoryNameRequired");
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const formData = new FormData();

    LANGUAGES.forEach((l) => {
      if (name[l.code]?.trim()) {
        formData.append(`name[${l.code}]`, name[l.code].trim());
      }
      if (description[l.code]?.trim()) {
        formData.append(`description[${l.code}]`, description[l.code].trim());
      }
    });

    formData.append("sortOrder", String(sortOrder));
    formData.append("isArchived", String(isArchived));
    if (imageFile) formData.append("image", imageFile);
    onSubmit(formData);
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const getFilledCount = (fieldObj) =>
    LANGUAGES.filter((l) => fieldObj[l.code]?.trim() !== "").length;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">

          {/* Language Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0F69B0]" />
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("categories.languageContent")}
              </label>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.06]">
              {LANGUAGES.map((lang) => {
                const nameVal = name[lang.code]?.trim();
                const isFilled = !!nameVal;
                const isActive = activeLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      isActive
                        ? "bg-white dark:bg-white/[0.12] text-[#0F69B0] shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{lang.label}</span>
                    {isFilled && (
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isActive ? "bg-[#0F69B0]" : "bg-emerald-500")} />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-muted-foreground font-medium">
              {currentLangObj.fullLabel} · {t("categories.atLeastOneLangRequired")}
              {" "}({getFilledCount(name)}/3 {t("categories.filled")})
            </p>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("categories.categoryName")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">
                ({currentLangObj.fullLabel})
              </span>
            </label>
            {LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className={cn(activeLang === lang.code ? "block" : "hidden")}
              >
                <input
                  type="text"
                  value={name[lang.code]}
                  onChange={(e) => {
                    setName((prev) => ({ ...prev, [lang.code]: e.target.value }));
                    if (errors.name) setErrors((p) => ({ ...p, name: "" }));
                  }}
                  placeholder={t(`categories.categoryNamePlaceholder_${lang.code}`) !== `categories.categoryNamePlaceholder_${lang.code}`
                    ? t(`categories.categoryNamePlaceholder_${lang.code}`)
                    : t("categories.categoryNamePlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
                    errors.name
                      ? "border-red-400"
                      : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
                  )}
                />
              </div>
            ))}
            {errors.name && (
              <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("categories.descriptionLabel")}
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">
                ({currentLangObj.fullLabel})
              </span>
            </label>
            {LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                className={cn(activeLang === lang.code ? "block" : "hidden")}
              >
                <textarea
                  value={description[lang.code]}
                  onChange={(e) =>
                    setDescription((prev) => ({ ...prev, [lang.code]: e.target.value }))
                  }
                  placeholder={t("categories.descriptionPlaceholder")}
                  rows={4}
                  disabled={isLoading}
                  dir={lang.dir}
                  className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none disabled:opacity-60"
                />
              </div>
            ))}
          </div>

          {/* Translation Status */}
          <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t("categories.translationStatus")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => {
                const hasName = !!name[lang.code]?.trim();
                const hasDesc = !!description[lang.code]?.trim();
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer",
                      activeLang === lang.code
                        ? "border-[#0F69B0]/40 bg-[#0F69B0]/[0.04]"
                        : "border-gray-200 dark:border-white/[0.06] hover:border-[#0F69B0]/20"
                    )}
                  >
                    <span className={cn("text-xs font-black", activeLang === lang.code ? "text-[#0F69B0]" : "text-foreground")}>
                      {lang.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full", hasName ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")} title={t("categories.name")} />
                      <span className={cn("h-1.5 w-1.5 rounded-full", hasDesc ? "bg-blue-500" : "bg-gray-300 dark:bg-white/20")} title={t("categories.description")} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t("categories.name")}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{t("categories.descriptionLabel")}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/20" />{t("categories.empty")}</span>
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("categories.sortOrder")}
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={0}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
            />
          </div>

          {/* Archive Toggle */}
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => setIsArchived(!isArchived)}
              disabled={isLoading}
              className={cn(
                "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60",
                isArchived ? "bg-amber-500" : "bg-gray-300 dark:bg-white/20"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                  isArchived ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{t("categories.archiveCategoryLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{t("categories.archiveCategoryDesc")}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Image */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("categories.categoryImage")}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="category-image-upload"
            />
            {imagePreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.08] group">
                <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-xl bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-xl bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="category-image-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                  isLoading
                    ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-white/[0.08]"
                    : "border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02]"
                )}
              >
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">{t("categories.clickToUpload")}</p>
                <p className="text-[11px] text-muted-foreground/60 font-medium mt-1">{t("categories.uploadFormats")}</p>
              </label>
            )}
          </div>

          {/* Quick Guide */}
          <div className="p-4 rounded-xl border border-[#0F69B0]/20 bg-[#0F69B0]/[0.03]">
            <p className="text-xs font-black text-[#0F69B0] mb-2">{t("categories.translationGuide")}</p>
            <ul className="space-y-1.5">
              <li className="text-[11px] text-muted-foreground font-medium flex items-start gap-1.5">
                <span className="text-[#0F69B0] shrink-0 mt-0.5">1.</span>
                {t("categories.guideStep1")}
              </li>
              <li className="text-[11px] text-muted-foreground font-medium flex items-start gap-1.5">
                <span className="text-[#0F69B0] shrink-0 mt-0.5">2.</span>
                {t("categories.guideStep2")}
              </li>
              <li className="text-[11px] text-muted-foreground font-medium flex items-start gap-1.5">
                <span className="text-[#0F69B0] shrink-0 mt-0.5">3.</span>
                {t("categories.guideStep3")}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            {t("categories.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{t("categories.saving")}</>
          ) : (
            <><Save className="h-4 w-4" />{safe.id || safe._id ? t("categories.updateCategory") : t("categories.createCategory")}</>
          )}
        </button>
      </div>
    </motion.form>
  );
}