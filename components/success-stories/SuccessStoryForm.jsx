"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Star, ImageIcon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

export default function SuccessStoryForm({ initialData, onSubmit, onCancel, isLoading }) {
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
  const [fullName, setFullName] = useState(getMultiValue("fullNameMultilingual", "fullName"));
  const [companyName, setCompanyName] = useState(getMultiValue("companyNameMultilingual", "companyName"));
  const [story, setStory] = useState(getMultiValue("storyMultilingual", "story"));
  const [location, setLocation] = useState(getMultiValue("locationMultilingual", "location"));
  const [profilePicture, setProfilePicture] = useState(safe.profilePicture || "");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(safe.profilePicture || "");
  const [rating, setRating] = useState(safe.rating ?? 5);
  const [storyDate, setStoryDate] = useState(
    safe.storyDate
      ? new Date(safe.storyDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [displayOrder, setDisplayOrder] = useState(safe.displayOrder ?? 0);
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [errors, setErrors] = useState({});

  const profilePictureRef = useRef(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const hasAtLeastOne = (fieldObj) =>
    LANGUAGES.some((l) => fieldObj[l.code]?.trim() !== "");

  const getFilledCount = (fieldObj) =>
    LANGUAGES.filter((l) => fieldObj[l.code]?.trim() !== "").length;

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleProfilePictureFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePictureFile(file);
    setProfilePicturePreview(URL.createObjectURL(file));
    setProfilePicture("");
    clearErr("profilePicture");
    e.target.value = "";
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture("");
    setProfilePictureFile(null);
    setProfilePicturePreview("");
    if (profilePictureRef.current) profilePictureRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!hasAtLeastOne(fullName)) errs.fullName = t("successStories.fullNameRequired");
    if (!hasAtLeastOne(companyName)) errs.companyName = t("successStories.companyNameRequired");
    if (!hasAtLeastOne(story)) errs.story = t("successStories.storyRequired");
    if (!hasAtLeastOne(location)) errs.location = t("successStories.locationRequired");
    if (!storyDate) errs.storyDate = t("successStories.storyDateRequired");
    if (!profilePictureFile && !profilePicture.trim()) {
      errs.profilePicture = t("successStories.profilePictureRequired");
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const formData = new FormData();

    LANGUAGES.forEach((l) => {
      if (fullName[l.code]?.trim()) formData.append(`fullName[${l.code}]`, fullName[l.code].trim());
      if (companyName[l.code]?.trim()) formData.append(`companyName[${l.code}]`, companyName[l.code].trim());
      if (story[l.code]?.trim()) formData.append(`story[${l.code}]`, story[l.code].trim());
      if (location[l.code]?.trim()) formData.append(`location[${l.code}]`, location[l.code].trim());
    });

    formData.append("rating", String(rating));
    formData.append("storyDate", storyDate);
    formData.append("displayOrder", String(displayOrder));
    formData.append("isActive", String(isActive));

    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile, profilePictureFile.name);
    } else if (profilePicture && !profilePicture.startsWith("blob:")) {
      formData.append("profilePicture", profilePicture);
    }

    onSubmit(formData);
  };

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err
        ? "border-red-400"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const displayImage = profilePicturePreview || profilePicture;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Person Information */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />
          {t("successStories.personInformation")}
        </h3>

        {/* Language Tabs */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#0F69B0]" />
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("categories.languageContent")}
            </label>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.06]">
            {LANGUAGES.map((lang) => {
              const isFilled = !!fullName[lang.code]?.trim();
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
            {" "}({getFilledCount(fullName)}/3 {t("categories.filled")})
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.fullName")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input
                  type="text"
                  value={fullName[lang.code]}
                  onChange={(e) => { setFullName((prev) => ({ ...prev, [lang.code]: e.target.value })); clearErr("fullName"); }}
                  placeholder={t("successStories.fullNamePlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={inputClass(errors.fullName)}
                />
              </div>
            ))}
            {errors.fullName && <p className="text-[11px] text-red-500 font-semibold">{errors.fullName}</p>}
          </div>

          {/* Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.companyName")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input
                  type="text"
                  value={companyName[lang.code]}
                  onChange={(e) => { setCompanyName((prev) => ({ ...prev, [lang.code]: e.target.value })); clearErr("companyName"); }}
                  placeholder={t("successStories.companyNamePlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={inputClass(errors.companyName)}
                />
              </div>
            ))}
            {errors.companyName && <p className="text-[11px] text-red-500 font-semibold">{errors.companyName}</p>}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.locationLabel")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input
                  type="text"
                  value={location[lang.code]}
                  onChange={(e) => { setLocation((prev) => ({ ...prev, [lang.code]: e.target.value })); clearErr("location"); }}
                  placeholder={t("successStories.locationPlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={inputClass(errors.location)}
                />
              </div>
            ))}
            {errors.location && <p className="text-[11px] text-red-500 font-semibold">{errors.location}</p>}
          </div>

          {/* Profile Picture */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.profilePictureUrl")} <span className="text-red-500">*</span>
            </label>
            <input
              ref={profilePictureRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isLoading}
              onChange={handleProfilePictureFileChange}
            />
            {!displayImage ? (
              <button
                type="button"
                onClick={() => profilePictureRef.current?.click()}
                disabled={isLoading}
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                  errors.profilePicture
                    ? "border-red-400 bg-red-50/50 dark:bg-red-900/10"
                    : "border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02]"
                )}
              >
                <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                  <ImageIcon className="h-7 w-7 text-muted-foreground/30" />
                </div>
                <span className="text-xs font-bold text-muted-foreground">Click to select profile picture</span>
                <span className="text-[10px] text-muted-foreground/60">PNG, JPG, WEBP up to 5MB</span>
              </button>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
                <div className="shrink-0">
                  <img
                    src={displayImage}
                    alt="Profile preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-white dark:border-white/[0.1] shadow-md"
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {profilePictureFile?.name || "Current profile image"}
                  </p>
                  {profilePictureFile && (
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      {(profilePictureFile.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <button type="button" onClick={() => profilePictureRef.current?.click()} disabled={isLoading} className="text-[11px] font-bold text-[#0F69B0] hover:underline cursor-pointer disabled:opacity-60">Change</button>
                    <span className="text-muted-foreground/30">·</span>
                    <button type="button" onClick={handleRemoveProfilePicture} disabled={isLoading} className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer disabled:opacity-60">Remove</button>
                  </div>
                </div>
              </div>
            )}
            {errors.profilePicture && <p className="text-[11px] text-red-500 font-semibold">{errors.profilePicture}</p>}
          </div>
        </div>

        {/* Translation Status */}
        <div className="mt-4 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("categories.translationStatus")}</p>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => {
              const hasN = !!fullName[lang.code]?.trim();
              const hasC = !!companyName[lang.code]?.trim();
              const hasL = !!location[lang.code]?.trim();
              const hasS = !!story[lang.code]?.trim();
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer",
                    activeLang === lang.code ? "border-[#0F69B0]/40 bg-[#0F69B0]/[0.04]" : "border-gray-200 dark:border-white/[0.06] hover:border-[#0F69B0]/20"
                  )}
                >
                  <span className={cn("text-xs font-black", activeLang === lang.code ? "text-[#0F69B0]" : "text-foreground")}>{lang.label}</span>
                  <div className="flex items-center gap-0.5">
                    <span className={cn("h-1.5 w-1.5 rounded-full", hasN ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")} />
                    <span className={cn("h-1.5 w-1.5 rounded-full", hasC ? "bg-blue-500" : "bg-gray-300 dark:bg-white/20")} />
                    <span className={cn("h-1.5 w-1.5 rounded-full", hasL ? "bg-purple-500" : "bg-gray-300 dark:bg-white/20")} />
                    <span className={cn("h-1.5 w-1.5 rounded-full", hasS ? "bg-amber-500" : "bg-gray-300 dark:bg-white/20")} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 flex-wrap text-[10px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t("successStories.fullName")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{t("successStories.companyName")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-purple-500" />{t("successStories.locationLabel")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t("successStories.successStoryLabel")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/20" />{t("categories.empty")}</span>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("successStories.storySection")}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-3.5 w-3.5 text-[#0F69B0]" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {currentLangObj.fullLabel}
          </span>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.successStoryLabel")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <textarea
                  value={story[lang.code]}
                  onChange={(e) => { setStory((prev) => ({ ...prev, [lang.code]: e.target.value })); clearErr("story"); }}
                  rows={5}
                  placeholder={t("successStories.successStoryPlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={cn(inputClass(errors.story), "resize-none")}
                />
              </div>
            ))}
            {errors.story && <p className="text-[11px] text-red-500 font-semibold">{errors.story}</p>}
          </div>
        </div>
      </div>

      {/* Rating and Settings */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t("successStories.ratingAndSettings")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("successStories.ratingLabel")}</label>
            <div className="flex items-center gap-1 p-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04]">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)} disabled={isLoading} className="p-1 cursor-pointer disabled:opacity-60">
                  <Star className={cn("h-6 w-6 transition-colors", s <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-white/20")} />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-foreground">{rating}/5</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("successStories.storyDate")} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={storyDate}
              onChange={(e) => { setStoryDate(e.target.value); clearErr("storyDate"); }}
              disabled={isLoading}
              className={inputClass(errors.storyDate)}
            />
            {errors.storyDate && <p className="text-[11px] text-red-500 font-semibold">{errors.storyDate}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("successStories.displayOrder")}</label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              min={0}
              disabled={isLoading}
              className={inputClass()}
            />
          </div>

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
              <p className="text-sm font-bold text-foreground">{t("successStories.activeLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{isActive ? t("successStories.visibleToUsers") : t("successStories.hidden")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <X className="h-4 w-4" />{t("successStories.cancel")}
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{t("successStories.saving")}</>
          ) : (
            <><Save className="h-4 w-4" />{safe.id || safe._id ? t("successStories.update") : t("successStories.create")}</>
          )}
        </button>
      </div>
    </motion.form>
  );
}