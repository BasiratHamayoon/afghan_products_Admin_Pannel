"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

export default function SectionForm({ initialData, onSubmit, onCancel, isLoading }) {
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
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [isArchived, setIsArchived] = useState(safe.isArchived ?? false);
  const [errors, setErrors] = useState({});

  const hasAtLeastOneName = () =>
    LANGUAGES.some((l) => name[l.code]?.trim() !== "");

  const getFilledCount = (fieldObj) =>
    LANGUAGES.filter((l) => fieldObj[l.code]?.trim() !== "").length;

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!hasAtLeastOneName()) {
      errs.name = t("sections.sectionNameRequired");
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      sortOrder,
      isActive,
      isArchived,
    };

    LANGUAGES.forEach((l) => {
      if (name[l.code]?.trim()) {
        payload[`name[${l.code}]`] = name[l.code].trim();
      }
      if (description[l.code]?.trim()) {
        payload[`description[${l.code}]`] = description[l.code].trim();
      }
    });

    onSubmit(payload);
  };

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
                const isFilled = !!name[lang.code]?.trim();
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
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          isActive ? "bg-[#0F69B0]" : "bg-emerald-500"
                        )}
                      />
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
              {t("sections.sectionNameLabel")} <span className="text-red-500">*</span>
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
                  placeholder={t("sections.sectionNamePlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
                    errors.name
                      ? "border-red-400 focus:border-red-500"
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
              {t("sections.descriptionLabel")}
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
                  placeholder={t("sections.descriptionPlaceholder")}
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
                    <span
                      className={cn(
                        "text-xs font-black",
                        activeLang === lang.code ? "text-[#0F69B0]" : "text-foreground"
                      )}
                    >
                      {lang.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full", hasName ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")} />
                      <span className={cn("h-1.5 w-1.5 rounded-full", hasDesc ? "bg-blue-500" : "bg-gray-300 dark:bg-white/20")} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {t("categories.name")}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                {t("categories.descriptionLabel")}
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
                {t("categories.empty")}
              </span>
            </div>
          </div>

          {/* Sort Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("sections.sortOrderLabel")}
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
        </div>

        {/* Right Column */}
        <div className="space-y-5">

          {/* Active Toggle */}
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
              <span
                className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                  isActive ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">
                {t("sections.activeSectionLabel")}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {t("sections.activeSectionDesc")}
              </p>
            </div>
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
              <p className="text-sm font-bold text-foreground">
                {t("sections.archiveSectionLabel")}
              </p>
              <p className="text-[11px] text-muted-foreground font-medium">
                {t("sections.archiveSectionDesc")}
              </p>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-4 rounded-xl border border-[#0F69B0]/20 bg-[#0F69B0]/[0.03]">
            <p className="text-xs font-black text-[#0F69B0] mb-2">
              {t("categories.translationGuide")}
            </p>
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
            {t("sections.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("sections.saving")}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {safe.id || safe._id
                ? t("sections.updateSection")
                : t("sections.createSection")}
            </>
          )}
        </button>
      </div>
    </motion.form>
  );
}