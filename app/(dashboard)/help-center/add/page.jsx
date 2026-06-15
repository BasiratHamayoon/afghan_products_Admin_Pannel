"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, HelpCircle, Loader2, Save, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { createHelpCenter, updateHelpCenter, fetchHelpCenterById, fetchHelpCenter } from "@/store/actions/helpCenterActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

function AddHelpCenterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const editId = searchParams.get("edit") || null;
  const isEditMode = !!editId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  const [headerTitle, setHeaderTitle] = useState("");
  const [headerSubtitle, setHeaderSubtitle] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [supportTitle, setSupportTitle] = useState("");
  const [supportDescription, setSupportDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const fetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

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
          setHeaderTitle(d.headerTitle || "");
          setHeaderSubtitle(d.headerSubtitle || "");
          setHeroTitle(d.heroTitle || "");
          setHeroDescription(d.heroDescription || "");
          setHeroImage(d.heroImage || "");
          setSupportTitle(d.supportTitle || "");
          setSupportDescription(d.supportDescription || "");
          setIsActive(d.isActive ?? true);
        } else { toast.error("Failed to load"); }
      } catch { if (isMountedRef.current) toast.error("Something went wrong"); }
      finally { if (isMountedRef.current) setIsFetching(false); }
    };
    load();
  }, [editId, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const errs = {};
    if (!headerTitle.trim()) errs.headerTitle = "Header title is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      headerTitle: headerTitle.trim(),
      headerSubtitle: headerSubtitle.trim(),
      heroTitle: heroTitle.trim(),
      heroDescription: heroDescription.trim(),
      heroImage: heroImage.trim(),
      supportTitle: supportTitle.trim(),
      supportDescription: supportDescription.trim(),
      isActive,
    };

    setIsLoading(true);
    try {
      const res = isEditMode
        ? await dispatch(updateHelpCenter(editId, payload))
        : await dispatch(createHelpCenter(payload));
      if (res?.success) {
        toast.success(isEditMode ? "Updated!" : "Created!");
        dispatch(fetchHelpCenter());
        router.push("/help-center");
      } else { toast.error(res?.message || "Failed"); }
    } catch { toast.error("Something went wrong"); }
    finally { setIsLoading(false); }
  };

  if (isFetching) {
    return <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" /></div>;
  }

  const inputClass = (err) => cn("w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60", err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]");
  const title = isEditMode ? "Edit Help Center" : "Create Help Center";

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={title} description="Manage help center main content">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/help-center")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4" />Back
        </motion.button>
      </PageHeader>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}><HelpCircle className="h-5 w-5 text-[#0F69B0]" /></div>
          <div><h2 className="text-base font-black text-foreground">{title}</h2></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Header Title <span className="text-red-500">*</span></label>
              <input type="text" value={headerTitle} onChange={(e) => { setHeaderTitle(e.target.value); if (errors.headerTitle) setErrors((p) => ({ ...p, headerTitle: "" })); }} placeholder="e.g. Help Center" disabled={isLoading} className={inputClass(errors.headerTitle)} />
              {errors.headerTitle && <p className="text-[11px] text-red-500 font-semibold">{errors.headerTitle}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Header Subtitle</label>
              <input type="text" value={headerSubtitle} onChange={(e) => setHeaderSubtitle(e.target.value)} placeholder="Subtitle" disabled={isLoading} className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Hero Title</label>
              <input type="text" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} placeholder="Hero title" disabled={isLoading} className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Hero Image URL</label>
              <input type="text" value={heroImage} onChange={(e) => setHeroImage(e.target.value)} placeholder="https://..." disabled={isLoading} className={inputClass()} />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Hero Description</label>
              <textarea value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} rows={3} placeholder="Describe..." disabled={isLoading} className={cn(inputClass(), "resize-none")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Support Title</label>
              <input type="text" value={supportTitle} onChange={(e) => setSupportTitle(e.target.value)} placeholder="Need more help?" disabled={isLoading} className={inputClass()} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Support Description</label>
              <textarea value={supportDescription} onChange={(e) => setSupportDescription(e.target.value)} rows={2} disabled={isLoading} className={cn(inputClass(), "resize-none")} />
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] lg:col-span-2">
              <button type="button" onClick={() => setIsActive(!isActive)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}>
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
              </button>
              <div><p className="text-sm font-bold text-foreground">Active</p><p className="text-[11px] text-muted-foreground font-medium">{isActive ? "Visible" : "Hidden"}</p></div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button type="button" onClick={() => router.push("/help-center")} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60"><X className="h-4 w-4" />Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><Save className="h-4 w-4" />{isEditMode ? "Update" : "Create"}</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function AddHelpCenterPage() {
  return <Suspense fallback={null}><AddHelpCenterContent /></Suspense>;
}