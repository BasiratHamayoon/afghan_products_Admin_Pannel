"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, ImageIcon, Upload, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/fileUrl";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

export default function BannerForm({ initialData, onSubmit, onCancel, isLoading }) {
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

  const POSITIONS = [
    { value: "HOME_TOP", label: t("banners.positionHomeTop") },
    { value: "HOME_MIDDLE", label: t("banners.positionHomeMiddle") },
    { value: "HOME_BOTTOM", label: t("banners.positionHomeBottom") },
    { value: "CATEGORY_TOP", label: t("banners.positionCategoryTop") },
    { value: "PRODUCT_TOP", label: t("banners.positionProductTop") },
    { value: "SIDEBAR", label: t("banners.positionSidebar") },
  ];

  const MEDIA_TYPES = [
    { value: "IMAGE", label: t("banners.mediaImage") },
    { value: "VIDEO", label: t("banners.mediaVideo") },
  ];

  const LINK_TYPES = [
    { value: "none", label: t("banners.linkNone") },
    { value: "product", label: t("banners.linkProduct") },
    { value: "category", label: t("banners.linkCategory") },
    { value: "subcategory", label: t("banners.linkSubcategory") },
    { value: "producttype", label: t("banners.linkProductType") },
    { value: "external", label: t("banners.linkExternal") },
  ];

  const [activeLang, setActiveLang] = useState("en");
  const [title, setTitle] = useState(getMultiValue("titleMultilingual", "title"));
  const [subtitle, setSubtitle] = useState(getMultiValue("subtitleMultilingual", "subtitle"));
  const [position, setPosition] = useState(safe.position || "HOME_TOP");
  const [mediaType, setMediaType] = useState(safe.mediaType || "IMAGE");
  const [linkType, setLinkType] = useState(safe.linkType || "none");
  const [linkValue, setLinkValue] = useState(safe.linkValue || "");
  const [sortOrder, setSortOrder] = useState(safe.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [startDate, setStartDate] = useState(
    safe.startDate ? new Date(safe.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    safe.endDate ? new Date(safe.endDate).toISOString().split("T")[0] : ""
  );
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(
    safe.media ? getFileUrl(safe.media) : null
  );
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const hasAtLeastOneTitle = () =>
    LANGUAGES.some((l) => title[l.code]?.trim() !== "");

  const getFilledCount = (fieldObj) =>
    LANGUAGES.filter((l) => fieldObj[l.code]?.trim() !== "").length;

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMediaPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!hasAtLeastOneTitle()) errs.title = t("banners.titleRequired");
    if (!position) errs.position = t("banners.positionRequired");
    if (!mediaFile && !safe.media) errs.media = t("banners.mediaRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const formData = new FormData();

    LANGUAGES.forEach((l) => {
      if (title[l.code]?.trim()) {
        formData.append(`title[${l.code}]`, title[l.code].trim());
      }
      if (subtitle[l.code]?.trim()) {
        formData.append(`subtitle[${l.code}]`, subtitle[l.code].trim());
      }
    });

    formData.append("position", position);
    formData.append("mediaType", mediaType);
    formData.append("linkType", linkType);
    formData.append("linkValue", linkValue.trim());
    formData.append("sortOrder", String(sortOrder));
    formData.append("isActive", String(isActive));
    if (startDate) formData.append("startDate", startDate);
    if (endDate) formData.append("endDate", endDate);
    if (mediaFile) formData.append("media", mediaFile);

    onSubmit(formData);
  };

  const inputClass = (err) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
    err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-pointer focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Basic Information with Language Tabs */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />
          {t("banners.basicInformation")}
        </h3>

        <div className="space-y-4">
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
                const isFilled = !!title[lang.code]?.trim();
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
              {" "}({getFilledCount(title)}/3 {t("categories.filled")})
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("banners.titleLabel")} <span className="text-red-500">*</span>
                <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">
                  ({currentLangObj.fullLabel})
                </span>
              </label>
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                  <input
                    type="text"
                    value={title[lang.code]}
                    onChange={(e) => {
                      setTitle((prev) => ({ ...prev, [lang.code]: e.target.value }));
                      clearErr("title");
                    }}
                    placeholder={t("banners.titlePlaceholder")}
                    disabled={isLoading}
                    dir={lang.dir}
                    className={inputClass(errors.title)}
                  />
                </div>
              ))}
              {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("banners.subtitleLabel")}
                <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">
                  ({currentLangObj.fullLabel})
                </span>
              </label>
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                  <input
                    type="text"
                    value={subtitle[lang.code]}
                    onChange={(e) =>
                      setSubtitle((prev) => ({ ...prev, [lang.code]: e.target.value }))
                    }
                    placeholder={t("banners.subtitlePlaceholder")}
                    disabled={isLoading}
                    dir={lang.dir}
                    className={inputClass()}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Translation Status */}
          <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t("categories.translationStatus")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGES.map((lang) => {
                const hasTitle = !!title[lang.code]?.trim();
                const hasSub = !!subtitle[lang.code]?.trim();
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
                      <span className={cn("h-1.5 w-1.5 rounded-full", hasTitle ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")} />
                      <span className={cn("h-1.5 w-1.5 rounded-full", hasSub ? "bg-blue-500" : "bg-gray-300 dark:bg-white/20")} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t("banners.titleLabel")}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{t("banners.subtitleLabel")}</span>
              <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/20" />{t("categories.empty")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Position and Type */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          {t("banners.positionAndType")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("banners.positionLabel")} <span className="text-red-500">*</span>
            </label>
            <select
              value={position}
              onChange={(e) => { setPosition(e.target.value); clearErr("position"); }}
              disabled={isLoading}
              className={cn(selectClass, errors.position && "border-red-400")}
            >
              {POSITIONS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            {errors.position && <p className="text-[11px] text-red-500 font-semibold">{errors.position}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("banners.mediaTypeLabel")}
            </label>
            <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} disabled={isLoading} className={selectClass}>
              {MEDIA_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("banners.sortOrderLabel")}
            </label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
              min={0}
              disabled={isLoading}
              className={inputClass()}
            />
          </div>
        </div>
      </div>

      {/* Link Settings */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {t("banners.linkSettings")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("banners.linkTypeLabel")}
            </label>
            <select value={linkType} onChange={(e) => setLinkType(e.target.value)} disabled={isLoading} className={selectClass}>
              {LINK_TYPES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          {linkType !== "none" && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("banners.linkValueLabel")}
              </label>
              <input
                type="text"
                value={linkValue}
                onChange={(e) => setLinkValue(e.target.value)}
                placeholder={linkType === "external" ? t("banners.linkValueExternalPlaceholder") : t("banners.linkValuePlaceholder")}
                disabled={isLoading}
                className={inputClass()}
              />
            </div>
          )}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t("banners.schedule")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("banners.startDate")}
            </label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={isLoading} className={inputClass()} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("banners.endDate")}
            </label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={isLoading} className={inputClass()} />
          </div>
        </div>
      </div>

      {/* Media and Settings */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("banners.mediaAndSettings")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("banners.bannerMedia")} <span className="text-red-500">*</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="hidden"
              id="banner-media-upload"
            />
            {mediaPreview ? (
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.08] group">
                <img src={mediaPreview} alt="Preview" className="object-cover w-full h-full" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="h-9 w-9 rounded-xl bg-white/90 flex items-center justify-center text-gray-700 hover:bg-white transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handleRemoveMedia} disabled={isLoading} className="h-9 w-9 rounded-xl bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor="banner-media-upload"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                  isLoading ? "opacity-60 cursor-not-allowed border-gray-200" : "border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02]",
                  errors.media && "border-red-400"
                )}
              >
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">{t("banners.clickToUpload")}</p>
                <p className="text-[11px] text-muted-foreground/60 font-medium mt-1">{t("banners.uploadFormats")}</p>
              </label>
            )}
            {errors.media && <p className="text-[11px] text-red-500 font-semibold">{errors.media}</p>}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                disabled={isLoading}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60",
                  isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
                )}
              >
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
              </button>
              <div>
                <p className="text-sm font-bold text-foreground">{t("banners.activeLabel")}</p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {isActive ? t("banners.bannerVisible") : t("banners.bannerHidden")}
                </p>
              </div>
            </div>
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
            <X className="h-4 w-4" />{t("banners.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{t("banners.saving")}</>
          ) : (
            <><Save className="h-4 w-4" />{safe.id || safe._id ? t("banners.update") : t("banners.create")}</>
          )}
        </button>
      </div>
    </motion.form>
  );
}