"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Loader2, XCircle,
  HelpCircle, Calendar, FileText,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchHelpCenterById, deleteHelpCenter, clearHelpCenterByIdCache, fetchHelpCenter } from "@/store/actions/helpCenterActions";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function DetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [itemData, setItemData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMountedRef = useRef(true);
  const fetchedRef = useRef(false);

  useEffect(() => { isMountedRef.current = true; return () => { isMountedRef.current = false; }; }, []);

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;
    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchHelpCenterById(id));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) setItemData(res.data);
        else setNotFound(true);
      } catch { if (isMountedRef.current) setNotFound(true); }
      finally { if (isMountedRef.current) setIsFetching(false); }
    };
    load();
  }, [id, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!itemData?.id) { setDeleteDialog(false); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteHelpCenter(itemData.id));
      if (res?.success) {
        toast.success(t("helpCenter.deletedSuccessfully"));
        clearHelpCenterByIdCache(itemData.id);
        dispatch(fetchHelpCenter());
        router.push("/help-center");
      } else toast.error(res?.message || t("helpCenter.failedToDelete"));
    } catch { toast.error(t("helpCenter.somethingWentWrong")); }
    finally { setIsDeleting(false); setDeleteDialog(false); }
  };

  if (isFetching) return <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" /></div>;

  if (notFound || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><XCircle className="h-8 w-8 text-red-500" /></div>
        <h2 className="text-lg font-black text-foreground">{t("helpCenter.notFound")}</h2>
        <button onClick={() => router.push("/help-center")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("helpCenter.back")}
        </button>
      </div>
    );
  }

  const fields = [
    { label: t("helpCenter.headerTitleField"), value: itemData.headerTitle || "—", icon: FileText },
    { label: t("helpCenter.headerSubtitleField"), value: itemData.headerSubtitle || "—", icon: FileText },
    { label: t("helpCenter.heroTitleField"), value: itemData.heroTitle || "—", icon: FileText },
    { label: t("helpCenter.supportTitleField"), value: itemData.supportTitle || "—", icon: FileText },
    { label: t("helpCenter.statusField"), value: itemData.isActive ? t("helpCenter.active") : t("helpCenter.inactive"), icon: HelpCircle, isStatus: true },
    { label: t("helpCenter.createdField"), value: formatDate(itemData.createdAt), icon: Calendar },
    { label: t("helpCenter.updatedField"), value: formatDate(itemData.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("helpCenter.helpCenterDetail")} description={itemData.headerTitle || ""}>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/help-center")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
            <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("helpCenter.back")}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push(`/help-center/add?edit=${id}`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" />{t("helpCenter.edit")}
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(15,105,176,0.1)" }}>
            <HelpCircle className="h-10 w-10 text-[#0F69B0]" />
          </div>
          <h3 className="text-lg font-black text-foreground">{itemData.headerTitle}</h3>
          <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full mt-3", itemData.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
            {itemData.isActive ? t("helpCenter.active") : t("helpCenter.inactive")}
          </span>
          <div className="grid grid-cols-3 gap-2 mt-4 w-full">
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-center"><p className="text-lg font-black">{itemData.faqs?.length || 0}</p><p className="text-[9px] font-bold text-muted-foreground uppercase">{t("helpCenter.faqs")}</p></div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-center"><p className="text-lg font-black">{itemData.categories?.length || 0}</p><p className="text-[9px] font-bold text-muted-foreground uppercase">{t("helpCenter.categories")}</p></div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-center"><p className="text-lg font-black">{itemData.contactOptions?.length || 0}</p><p className="text-[9px] font-bold text-muted-foreground uppercase">{t("helpCenter.contactOptions")}</p></div>
          </div>
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button onClick={() => router.push(`/help-center/add?edit=${id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] cursor-pointer border border-[#0F69B0]/20">
              <Edit2 className="h-3.5 w-3.5" />{t("helpCenter.edit")}
            </button>
            <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40">
              <Trash2 className="h-3.5 w-3.5" />{t("helpCenter.delete")}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
          <h3 className="text-sm font-black text-foreground mb-5">{t("helpCenter.information")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}><Icon className="h-4 w-4 text-[#0F69B0]" /></div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{f.label}</p>
                    {f.isStatus ? (
                      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg", itemData.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", itemData.isActive ? "bg-emerald-500" : "bg-gray-400")} />{f.value}
                      </span>
                    ) : <p className="text-sm font-bold text-foreground break-all">{f.value}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          {itemData.heroDescription && (
            <div className="mt-4 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("helpCenter.heroDescriptionField")}</p>
              <p className="text-sm text-foreground font-medium leading-relaxed">{itemData.heroDescription}</p>
            </div>
          )}
          {itemData.supportDescription && (
            <div className="mt-4 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("helpCenter.supportDescriptionField")}</p>
              <p className="text-sm text-foreground font-medium leading-relaxed">{itemData.supportDescription}</p>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={t("helpCenter.deleteHelpCenterTitle")}
        description={`${t("helpCenter.deleteHelpCenterDesc")} "${itemData?.headerTitle}"${t("helpCenter.deleteHelpCenterSuffix")}`}
        confirmLabel={t("helpCenter.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

export default function HelpCenterDetailPage() {
  return <Suspense fallback={null}><DetailContent /></Suspense>;
}