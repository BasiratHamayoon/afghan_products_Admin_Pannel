"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, HelpCircle, Loader2, Save, X, Globe } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import {
  createHelpCenter,
  updateHelpCenter,
  fetchHelpCenterById,
  fetchHelpCenter,
} from "@/store/actions/helpCenterActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

function AddHelpCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const editId = searchParams.get("edit") || null;
  const isEditMode = !!editId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const [headerTitle, setHeaderTitle] = useState({ en: "", fa: "", ps: "" });
  const [headerSubtitle, setHeaderSubtitle] = useState({ en: "", fa: "", ps: "" });
  const [heroTitle, setHeroTitle] = useState({ en: "", fa: "", ps: "" });
  const [heroDescription, setHeroDescription] = useState({ en: "", fa: "", ps: "" });
  const [heroImage, setHeroImage] = useState("");
  const [supportTitle, setSupportTitle] = useState({ en: "", fa: "", ps: "" });
  const [supportDescription, setSupportDescription] = useState({ en: "", fa: "", ps: "" });
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const hasAtLeastOne = (fieldObj) =>
    LANGUAGES.some((l) => fieldObj[l.code]?.trim() !== "");

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const getMultiValue = (item, multiKey, flatKey) => {
    const result = { en: "", fa: "", ps: "" };
    if (!item) return result;
    LANGUAGES.forEach((lang) => {
      if (item[multiKey] && typeof item[multiKey] === "object") {
        result[lang.code] = item[multiKey][lang.code] || "";
      } else if (item[flatKey] && typeof item[flatKey] === "object") {
        result[lang.code] = item[flatKey][lang.code] || "";
      } else if (typeof item[flatKey] === "string" && lang.code === "en") {
        result[lang.code] = item[flatKey];
      }
    });
    return result;
  };

  useEffect(() => {
    if (!editId) return;
    const key = `hc:${editId}`;
    if (fetchKeyRef.current === key) return;
    fetchKeyRef.current = key;

    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchHelpCenterById(editId));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) {
          const d = res.data;
          setHeaderTitle(getMultiValue(d, "headerTitleMultilingual", "headerTitle"));
          setHeaderSubtitle(getMultiValue(d, "headerSubtitleMultilingual", "headerSubtitle"));
          setHeroTitle(getMultiValue(d, "heroTitleMultilingual", "heroTitle"));
          setHeroDescription(getMultiValue(d, "heroDescriptionMultilingual", "heroDescription"));
          setHeroImage(d.heroImage || "");
          setSupportTitle(getMultiValue(d, "supportTitleMultilingual", "supportTitle"));
          setSupportDescription(getMultiValue(d, "supportDescriptionMultilingual", "supportDescription"));
          setIsActive(d.isActive ?? true);
        } else {
          toast.error(t("helpCenter.failedAction"));
        }
      } catch {
        if (isMountedRef.current) toast.error(t("helpCenter.somethingWentWrong"));
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [editId, dispatch, t]);

  const buildMultiPayload = (fieldObj) => {
    const payload = {};
    LANGUAGES.forEach((l) => {
      if (fieldObj[l.code]?.trim()) payload[l.code] = fieldObj[l.code].trim();
    });
    return Object.keys(payload).length > 0 ? payload : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!hasAtLeastOne(headerTitle)) errs.headerTitle = t("helpCenter.headerTitleRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = { isActive };

    const ht = buildMultiPayload(headerTitle);
    if (ht) payload.headerTitle = ht;
    const hs = buildMultiPayload(headerSubtitle);
    if (hs) payload.headerSubtitle = hs;
    const hTitle = buildMultiPayload(heroTitle);
    if (hTitle) payload.heroTitle = hTitle;
    const hDesc = buildMultiPayload(heroDescription);
    if (hDesc) payload.heroDescription = hDesc;
    if (heroImage.trim()) payload.heroImage = heroImage.trim();
    const sTitle = buildMultiPayload(supportTitle);
    if (sTitle) payload.supportTitle = sTitle;
    const sDesc = buildMultiPayload(supportDescription);
    if (sDesc) payload.supportDescription = sDesc;

    setIsLoading(true);
    try {
      const res = isEditMode
        ? await dispatch(updateHelpCenter(editId, payload))
        : await dispatch(createHelpCenter(payload));

      if (res?.success) {
        toast.success(isEditMode ? t("helpCenter.updated2") : t("helpCenter.created"));
        dispatch(fetchHelpCenter());
        router.push("/help-center");
      } else {
        toast.error(res?.message || t("helpCenter.failedAction"));
      }
    } catch {
      toast.error(t("helpCenter.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
      </div>
    );
  }

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const title = isEditMode ? t("helpCenter.editHelpCenterTitle") : t("helpCenter.addHelpCenterTitle");

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={title} description={t("helpCenter.helpCenterFormDesc")}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/help-center")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 rtl-mirror" />
          {t("helpCenter.back")}
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <HelpCircle className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

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
                const isFilled = !!headerTitle[lang.code]?.trim();
                const isActive = activeLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setActiveLang(lang.code)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
                      isActive ? "bg-white dark:bg-white/[0.12] text-[#0F69B0] shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{lang.label}</span>
                    {isFilled && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isActive ? "bg-[#0F69B0]" : "bg-emerald-500")} />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {currentLangObj.fullLabel} · {t("categories.atLeastOneLangRequired")}
            </p>
          </div>

          {/* Header Section */}
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />
              {t("helpCenter.headerTitleLabel")}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("helpCenter.headerTitleLabel")} <span className="text-red-500">*</span>
                  <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
                </label>
                {LANGUAGES.map((lang) => (
                  <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                    <input
                      type="text"
                      value={headerTitle[lang.code]}
                      onChange={(e) => { setHeaderTitle((prev) => ({ ...prev, [lang.code]: e.target.value })); if (errors.headerTitle) setErrors((p) => ({ ...p, headerTitle: "" })); }}
                      placeholder={t("helpCenter.headerTitlePlaceholder")}
                      disabled={isLoading}
                      dir={lang.dir}
                      className={inputClass(errors.headerTitle)}
                    />
                  </div>
                ))}
                {errors.headerTitle && <p className="text-[11px] text-red-500 font-semibold">{errors.headerTitle}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("helpCenter.headerSubtitleLabel")}
                  <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
                </label>
                {LANGUAGES.map((lang) => (
                  <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                    <input
                      type="text"
                      value={headerSubtitle[lang.code]}
                      onChange={(e) => setHeaderSubtitle((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                      placeholder={t("helpCenter.headerSubtitlePlaceholder")}
                      disabled={isLoading}
                      dir={lang.dir}
                      className={inputClass()}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
              {t("helpCenter.heroTitleLabel")}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("helpCenter.heroTitleLabel")}
                  <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
                </label>
                {LANGUAGES.map((lang) => (
                  <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                    <input
                      type="text"
                      value={heroTitle[lang.code]}
                      onChange={(e) => setHeroTitle((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                      placeholder={t("helpCenter.heroTitlePlaceholder")}
                      disabled={isLoading}
                      dir={lang.dir}
                      className={inputClass()}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("helpCenter.heroImageLabel")}
                </label>
                <input
                  type="text"
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  placeholder={t("helpCenter.heroImagePlaceholder")}
                  disabled={isLoading}
                  className={inputClass()}
                />
              </div>

              <div className="space-y-1.5 lg:col-span-2">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("helpCenter.heroDescriptionLabel")}
                  <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
                </label>
                {LANGUAGES.map((lang) => (
                  <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                    <textarea
                      value={heroDescription[lang.code]}
                      onChange={(e) => setHeroDescription((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                      rows={3}
                      placeholder={t("helpCenter.heroDescriptionPlaceholder")}
                      disabled={isLoading}
                      dir={lang.dir}
                      className={cn(inputClass(), "resize-none")}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {t("helpCenter.supportTitleLabel")}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("helpCenter.supportTitleLabel")}
                  <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
                </label>
                {LANGUAGES.map((lang) => (
                  <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                    <input
                      type="text"
                      value={supportTitle[lang.code]}
                      onChange={(e) => setSupportTitle((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                      placeholder={t("helpCenter.supportTitlePlaceholder")}
                      disabled={isLoading}
                      dir={lang.dir}
                      className={inputClass()}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  {t("helpCenter.supportDescriptionLabel")}
                  <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
                </label>
                {LANGUAGES.map((lang) => (
                  <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                    <textarea
                      value={supportDescription[lang.code]}
                      onChange={(e) => setSupportDescription((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                      rows={3}
                      disabled={isLoading}
                      dir={lang.dir}
                      className={cn(inputClass(), "resize-none")}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Toggle */}
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
              <p className="text-sm font-bold text-foreground">{t("helpCenter.activeLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{isActive ? t("helpCenter.visibleLabel") : t("helpCenter.hiddenLabel")}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => router.push("/help-center")}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60"
            >
              <X className="h-4 w-4" />{t("helpCenter.cancelLabel")}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{t("helpCenter.savingLabel")}</>
              ) : (
                <><Save className="h-4 w-4" />{isEditMode ? t("helpCenter.updateLabel") : t("helpCenter.createLabel")}</>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AddHelpCenterPage() {
  return (
    <Suspense fallback={null}>
      <AddHelpCenterContent />
    </Suspense>
  );
}