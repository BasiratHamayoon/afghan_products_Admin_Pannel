"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Phone, Loader2, Save, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { addContactOption, updateContactOption, fetchHelpCenter } from "@/store/actions/helpCenterActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function AddContactContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const editId = searchParams.get("edit") || null;
  const isEditMode = !!editId;
  const { contactOptions } = useSelector((state) => state.helpCenter);

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [type, setType] = useState("");
  const [value, setValue] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!editId || !contactOptions?.length) return;
    const co = contactOptions.find((c) => (c._id || c.id) === editId);
    if (co) { setTitle(co.title || ""); setDescription(co.description || ""); setIcon(co.icon || ""); setType(co.type || ""); setValue(co.value || ""); setOrder(co.order ?? 0); setIsActive(co.isActive ?? true); }
  }, [editId, contactOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const errs = {};
    if (!title.trim()) errs.title = t("helpCenter.contactTitleRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const payload = { title: title.trim(), description: description.trim(), icon: icon.trim(), type: type.trim(), value: value.trim(), order, isActive };
    setIsLoading(true);
    try {
      const res = isEditMode ? await dispatch(updateContactOption(editId, payload)) : await dispatch(addContactOption(payload));
      if (res?.success) { toast.success(isEditMode ? t("helpCenter.updated2") : t("helpCenter.created")); dispatch(fetchHelpCenter()); router.push("/help-center"); }
      else toast.error(res?.message || t("helpCenter.failedAction"));
    } catch { toast.error(t("helpCenter.somethingWentWrong")); }
    finally { setIsLoading(false); }
  };

  const inputClass = (err) => cn("w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60", err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]");

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
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}><Phone className="h-5 w-5 text-[#0F69B0]" /></div>
          <h2 className="text-base font-black text-foreground">{pageTitle}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.contactTitleLabel")} <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: "" })); }} placeholder={t("helpCenter.contactTitlePlaceholder")} disabled={isLoading} className={inputClass(errors.title)} />
              {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.iconLabel")}</label>
              <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder={t("helpCenter.contactIconPlaceholder")} disabled={isLoading} className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.typeLabel")}</label>
              <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder={t("helpCenter.typePlaceholder")} disabled={isLoading} className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.valueLabel")}</label>
              <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t("helpCenter.valuePlaceholder")} disabled={isLoading} className={inputClass()} />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("helpCenter.descriptionLabel")}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder={t("helpCenter.descriptionPlaceholder")} disabled={isLoading} className={cn(inputClass(), "resize-none")} />
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