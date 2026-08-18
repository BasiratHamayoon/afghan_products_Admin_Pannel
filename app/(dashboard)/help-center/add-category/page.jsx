"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, FolderOpen, Loader2, Save, X, Globe } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { addHelpCategory, updateHelpCategory, fetchHelpCenter } from "@/store/actions/helpCenterActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

function AddCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const editId = searchParams.get("edit") || null;
  const isEditMode = !!editId;
  const { categories } = useSelector((state) => state.helpCenter);

  const [isLoading, setIsLoading] = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const [title, setTitle] = useState({ en: "", fa: "", ps: "" });
  const [description, setDescription] = useState({ en: "", fa: "", ps: "" });
  const [icon, setIcon] = useState("");
  const [link, setLink] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const hasAtLeastOne = (fieldObj) =>
    LANGUAGES.some((l) => fieldObj[l.code]?.trim() !== "");

  const getFilledCount = (fieldObj) =>
    LANGUAGES.filter((l) => fieldObj[l.code]?.trim() !== "").length;

  const getFieldValue = (item, multiKey, flatKey, lang) => {
    if (!item) return "";
    if (item[multiKey] && typeof item[multiKey] === "object") {
      return item[multiKey][lang] || item[multiKey].en || item[multiKey].fa || item[multiKey].ps || "";
    }
    if (item[flatKey] && typeof item[flatKey] === "object") {
      return item[flatKey][lang] || item[flatKey].en || item[flatKey].fa || item[flatKey].ps || "";
    }
    return typeof item[flatKey] === "string" ? item[flatKey] : "";
  };

  useEffect(() => {
    if (!editId || !categories?.length) return;
    const cat = categories.find((c) => (c._id || c.id) === editId);
    if (cat) {
      const t_ = { en: "", fa: "", ps: "" };
      const d = { en: "", fa: "", ps: "" };
      LANGUAGES.forEach((lang) => {
        t_[lang.code] = getFieldValue(cat, "titleMultilingual", "title", lang.code);
        d[lang.code] = getFieldValue(cat, "descriptionMultilingual", "description", lang.code);
      });
      setTitle(t_);
      setDescription(d);
      setIcon(cat.icon || "");
      setLink(cat.link || "");
      setOrder(cat.order ?? 0);
      setIsActive(cat.isActive ?? true);
    }
  }, [editId, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!hasAtLeastOne(title)) errs.title = t("helpCenter.categoryTitleRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const titlePayload = {};
    const descPayload = {};
    LANGUAGES.forEach((l) => {
      if (title[l.code]?.trim()) titlePayload[l.code] = title[l.code].trim();
      if (description[l.code]?.trim()) descPayload[l.code] = description[l.code].trim();
    });

    const payload = { title: titlePayload, order, isActive };
    if (Object.keys(descPayload).length > 0) payload.description = descPayload;
    if (icon.trim()) payload.icon = icon.trim();
    if (link.trim()) payload.link = link.trim();

    setIsLoading(true);
    try {
      const res = isEditMode
        ? await dispatch(updateHelpCategory(editId, payload))
        : await dispatch(addHelpCategory(payload));

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

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const pageTitle = isEditMode ? t("helpCenter.editCategoryTitle") : t("helpCenter.addCategoryTitle");

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={pageTitle} description={t("helpCenter.categoryFormDesc")}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/help-center")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
          <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("helpCenter.back")}
        </motion.button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <FolderOpen className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <h2 className="text-base font-black text-foreground">{pageTitle}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Language Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#0F69B0]" />
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("categories.languageContent")}</label>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.06]">
              {LANGUAGES.map((lang) => {
                const isFilled = !!title[lang.code]?.trim();
                const isActive = activeLang === lang.code;
                return (
                  <button key={lang.code} type="button" onClick={() => setActiveLang(lang.code)}
                    className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer", isActive ? "bg-white dark:bg-white/[0.12] text-[#0F69B0] shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    <span>{lang.label}</span>
                    {isFilled && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isActive ? "bg-[#0F69B0]" : "bg-emerald-500")} />}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {currentLangObj.fullLabel} · {t("categories.atLeastOneLangRequired")} ({getFilledCount(title)}/3 {t("categories.filled")})
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("helpCenter.categoryTitleLabel")} <span className="text-red-500">*</span>
                <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
              </label>
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                  <input
                    type="text"
                    value={title[lang.code]}
                    onChange={(e) => { setTitle((prev) => ({ ...prev, [lang.code]: e.target.value })); if (errors.title) setErrors((p) => ({ ...p, title: "" })); }}
                    placeholder={t("helpCenter.categoryTitlePlaceholder")}
                    disabled={isLoading}
                    dir={lang.dir}
                    className={inputClass(errors.title)}
                  />
                </div>
              ))}
              {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.iconLabel")}</label>
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder={t("helpCenter.iconPlaceholder")} disabled={isLoading} className={inputClass()} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.linkLabel") || "Link"}</label>
              <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/category/electronics" disabled={isLoading} className={inputClass()} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.orderLabel")}</label>
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={0} disabled={isLoading} className={inputClass()} />
            </div>

            {/* Description */}
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("helpCenter.descriptionLabel")}
                <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
              </label>
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                  <textarea
                    value={description[lang.code]}
                    onChange={(e) => setDescription((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                    rows={3}
                    placeholder={t("helpCenter.descriptionPlaceholder")}
                    disabled={isLoading}
                    dir={lang.dir}
                    className={cn(inputClass(), "resize-none")}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] lg:col-span-2">
              <button type="button" onClick={() => setIsActive(!isActive)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}>
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
              </button>
              <p className="text-sm font-bold text-foreground">{t("helpCenter.activeLabel")}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button type="button" onClick={() => router.push("/help-center")} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground cursor-pointer disabled:opacity-60">
              <X className="h-4 w-4" />{t("helpCenter.cancelLabel")}
            </button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("helpCenter.savingLabel")}</> : <><Save className="h-4 w-4" />{isEditMode ? t("helpCenter.updateCategoryBtn") : t("helpCenter.addCategoryBtn")}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AddCategoryPage() {
  return <Suspense fallback={null}><AddCategoryContent /></Suspense>;
}