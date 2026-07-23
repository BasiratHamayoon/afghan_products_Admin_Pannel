"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, Info, RefreshCw, Trash2,
  BarChart3, FileText, Layers, TrendingUp, Edit2, Eye,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatsCard from "@/components/common/StatCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchAboutItems, fetchAboutStats, deleteAboutItem } from "@/store/actions/aboutActions";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { items, isLoading, stats } = useSelector((state) => state.about);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchAboutItems());
    dispatch(fetchAboutStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAboutItems());
    dispatch(fetchAboutStats());
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteAboutItem(item.id));
      if (res?.success) {
        toast.success(t("about.aboutDeleted"));
      } else {
        toast.error(res?.message || t("about.failedToDelete"));
      }
    } catch {
      toast.error(t("about.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const safeItems = Array.isArray(items) ? items : [];
  const aboutItem = safeItems[0] || null;
  const hasContent = !!aboutItem;

  const totalFeatures = aboutItem?.features?.length ?? 0;
  const totalMetrics = aboutItem?.metrics?.length ?? 0;
  const totalWhyChooseUs = aboutItem?.whyChooseUs?.length ?? 0;
  const statsCount = Array.isArray(stats?.stats) ? stats.stats.length : Array.isArray(aboutItem?.stats) ? aboutItem.stats.length : 0;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("about.title")} description={t("about.description")}>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {!hasContent && !isLoading && (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/about/add")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              <Plus className="h-4 w-4" />{t("about.createAbout")}
            </motion.button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("about.features")} value={totalFeatures} icon={Layers} color="rgba(124,58,237,0.08)" index={0} />
        <StatsCard title={t("about.metrics")} value={totalMetrics} icon={TrendingUp} color="rgba(245,158,11,0.08)" index={1} />
        <StatsCard title={t("about.whyChooseUs")} value={totalWhyChooseUs} icon={BarChart3} color="rgba(16,185,129,0.08)" index={2} />
        <StatsCard title={t("about.liveStats")} value={statsCount} icon={FileText} color="rgba(15,105,176,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="p-8">
            <LoadingSpinner size="lg" text={t("about.loadingAboutContent")} className="py-16" />
          </div>
        ) : !hasContent ? (
          <div className="p-8">
            <EmptyState
              icon={Info}
              title={t("about.noAboutContentYet")}
              description={t("about.noAboutContentDesc")}
              action={
                <button onClick={() => router.push("/about/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  <Plus className="h-4 w-4" />{t("about.createAboutContent")}
                </button>
              }
            />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.1)" }}>
                  <span className="text-3xl">📄</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-foreground">{aboutItem.headline || "—"}</h2>
                  {aboutItem.subHeadline && <p className="text-sm text-muted-foreground font-medium mt-0.5">{aboutItem.subHeadline}</p>}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", aboutItem.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
                      {aboutItem.isActive ? t("about.active") : t("about.inactive")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">{t("about.updated")} {formatDate(aboutItem.updatedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button onClick={() => router.push(`/about/${aboutItem.id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20">
                  <Eye className="h-3.5 w-3.5" />{t("about.view")}
                </button>
                <button onClick={() => router.push(`/about/add?edit=${aboutItem.id}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  <Edit2 className="h-3.5 w-3.5" />{t("about.edit")}
                </button>
                <button onClick={() => setDeleteDialog({ open: true, item: aboutItem })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                  <Trash2 className="h-3.5 w-3.5" />{t("about.delete")}
                </button>
              </div>
            </div>

            {aboutItem.description && (
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("about.description")}</p>
                <p className="text-sm text-foreground font-medium leading-relaxed">{aboutItem.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] text-center">
                <p className="text-2xl font-black text-foreground">{totalFeatures}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t("about.features")}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] text-center">
                <p className="text-2xl font-black text-foreground">{totalMetrics}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t("about.metrics")}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] text-center">
                <p className="text-2xl font-black text-foreground">{totalWhyChooseUs}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t("about.whyChooseUs")}</p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] text-center">
                <p className="text-2xl font-black text-foreground">{statsCount}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t("about.liveStats")}</p>
              </div>
            </div>

            {(aboutItem.missionTitle || aboutItem.missionText) && (
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("about.mission")}</p>
                {aboutItem.missionTitle && <p className="text-sm font-black text-foreground mb-1">{aboutItem.missionTitle}</p>}
                {aboutItem.missionText && <p className="text-sm text-muted-foreground font-medium leading-relaxed">{aboutItem.missionText}</p>}
              </div>
            )}

            {(aboutItem.ctaText || aboutItem.ctaButtonText || aboutItem.ctaButtonUrl) && (
              <div className="p-4 rounded-xl border border-amber-100 dark:border-amber-900/20 bg-amber-50/50 dark:bg-amber-900/10">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2">{t("about.callToAction")}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  {aboutItem.ctaText && <p className="text-sm font-bold text-foreground">{aboutItem.ctaText}</p>}
                  {aboutItem.ctaButtonText && <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600">{aboutItem.ctaButtonText}</span>}
                  {aboutItem.ctaButtonUrl && <span className="text-xs text-[#0F69B0] font-medium truncate max-w-[200px]">{aboutItem.ctaButtonUrl}</span>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title={t("about.deleteAboutTitle")}
        description={`${t("about.deleteAboutDesc")} "${deleteDialog.item?.headline}"${t("about.deleteAboutSuffix")}`}
        confirmLabel={t("about.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}