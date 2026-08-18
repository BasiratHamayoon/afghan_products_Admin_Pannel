"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Phone, Loader2, Save, X, Globe } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { addContactOption, updateContactOption, fetchHelpCenter } from "@/store/actions/helpCenterActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

const CONTACT_TYPES = ["call", "email", "whatsapp", "other"];

function AddContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const editId = searchParams.get("edit") || null;
  const isEditMode = !!editId;
  const { contactOptions } = useSelector((state) => state.helpCenter);

  const [isLoading, setIsLoading] = useState(false);
  const [activeLang, setActiveLang] = useState("en");
  const [label, setLabel] = useState({ en: "", fa: "", ps: "" });
  const [icon, setIcon] = useState("");
  const [type, setType] = useState("call");
  const [value, setValue] = useState("");
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
    if (!editId || !contactOptions?.length) return;
    const co = contactOptions.find((c) => (c._id || c.id) === editId);
    if (co) {
      const l = { en: "", fa: "", ps: "" };
      LANGUAGES.forEach((lang) => {
        l[lang.code] = getFieldValue(co, "labelMultilingual", "label", lang.code);
      });
      setLabel(l);
      setIcon(co.icon || "");
      setType(co.type || "call");
      setValue(co.value || "");
      setOrder(co.order ?? 0);
      setIsActive(co.isActive ?? true);
    }
  }, [editId, contactOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!hasAtLeastOne(label)) errs.label = t("helpCenter.contactTitleRequired");
    if (!type) errs.type = t("helpCenter.typeRequired") || "Type is required";
    if (!value.trim()) errs.value = t("helpCenter.valueRequired") || "Value is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const labelPayload = {};
    LANGUAGES.forEach((l) => {
      if (label[l.code]?.trim()) labelPayload[l.code] = label[l.code].trim();
    });

    const payload = { label: labelPayload, type, value: value.trim(), order, isActive };
    if (icon.trim()) payload.icon = icon.trim();

    setIsLoading(true);
    try {
      const res = isEditMode
        ? await dispatch(updateContactOption(editId, payload))
        : await dispatch(addContactOption(payload));

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

  const pageTitle = isEditMode ? t("helpCenter.editContactTitle") : t("helpCenter.addContactTitle");

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={pageTitle} description={t("helpCenter.contactFormDesc")}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/help-center")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
          <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("helpCenter.back")}
        </motion.button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <Phone className="h-5 w-5 text-[#0F69B0]" />
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
                const isFilled = !!label[lang.code]?.trim();
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
              {currentLangObj.fullLabel} · {t("categories.atLeastOneLangRequired")} ({getFilledCount(label)}/3 {t("categories.filled")})
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("helpCenter.contactTitleLabel")} <span className="text-red-500">*</span>
                <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
              </label>
              {LANGUAGES.map((lang) => (
                <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                  <input
                    type="text"
                    value={label[lang.code]}
                    onChange={(e) => { setLabel((prev) => ({ ...prev, [lang.code]: e.target.value })); if (errors.label) setErrors((p) => ({ ...p, label: "" })); }}
                    placeholder={t("helpCenter.contactTitlePlaceholder")}
                    disabled={isLoading}
                    dir={lang.dir}
                    className={inputClass(errors.label)}
                  />
                </div>
              ))}
              {errors.label && <p className="text-[11px] text-red-500 font-semibold">{errors.label}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.iconLabel")}</label>
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder={t("helpCenter.contactIconPlaceholder")} disabled={isLoading} className={inputClass()} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("helpCenter.typeLabel")} <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => { setType(e.target.value); if (errors.type) setErrors((p) => ({ ...p, type: "" })); }}
                disabled={isLoading}
                className={cn("w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground cursor-pointer disabled:opacity-60", errors.type ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40")}
              >
                {CONTACT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct.charAt(0).toUpperCase() + ct.slice(1)}</option>
                ))}
              </select>
              {errors.type && <p className="text-[11px] text-red-500 font-semibold">{errors.type}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("helpCenter.valueLabel")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => { setValue(e.target.value); if (errors.value) setErrors((p) => ({ ...p, value: "" })); }}
                placeholder={t("helpCenter.valuePlaceholder")}
                disabled={isLoading}
                className={inputClass(errors.value)}
              />
              {errors.value && <p className="text-[11px] text-red-500 font-semibold">{errors.value}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.orderLabel")}</label>
              <input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} min={0} disabled={isLoading} className={inputClass()} />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
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
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />{t("helpCenter.savingLabel")}</> : <><Save className="h-4 w-4" />{isEditMode ? t("helpCenter.updateContactBtn") : t("helpCenter.addContactBtn")}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AddContactPage() {
  return <Suspense fallback={null}><AddContactContent /></Suspense>;
}