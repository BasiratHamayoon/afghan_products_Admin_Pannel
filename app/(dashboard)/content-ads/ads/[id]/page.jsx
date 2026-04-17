"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Edit2, Trash2, Eye, TrendingUp, XCircle, Calendar, Hash, CheckCircle, DollarSign, MousePointer } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import AdForm from "@/components/content/AdForm";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchAdById, removeAd, editAd } from "@/store/actions/contentActions";
import { adTypeOptions, adPlacementOptions } from "@/data/dummyContent";
import { formatDateTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = ["Overview", "Edit"];

function MetricBar({ label, value, max, color }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-xs font-black text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AdDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedAd: ad, isLoading } = useSelector((s) => s.content);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "Overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (id) dispatch(fetchAdById(id)); }, [dispatch, id]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tabs.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  const handleUpdate = async (data) => {
    if (!id) return;
    setIsSaving(true);
    const res = await dispatch(editAd(id, data));
    setIsSaving(false);
    if (res?.success) { toast.success("Ad updated!"); setActiveTab("Overview"); }
    else toast.error("Failed to update ad");
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeAd(id));
    setIsDeleting(false);
    if (res?.success) { toast.success("Ad deleted"); router.push("/content-ads/ads"); }
    else toast.error("Failed to delete");
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner size="lg" text="Loading ad..." /></div>;

  if (!ad || !ad.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><XCircle className="h-8 w-8 text-red-500" /></div>
        <h2 className="text-lg font-black text-foreground">Ad not found</h2>
        <p className="text-sm text-muted-foreground font-medium">The advertisement does not exist or has been deleted.</p>
        <button onClick={() => router.push("/content-ads/ads")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <ArrowLeft className="h-4 w-4" /> Back to Ads
        </button>
      </div>
    );
  }

  const typeOpt = adTypeOptions.find((t) => t.value === ad.type);
  const placementOpt = adPlacementOptions.find((p) => p.value === ad.placement);
  const ctr = ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00";
  const budgetUsedPct = ad.budget ? Math.min((ad.spent / ad.budget) * 100, 100).toFixed(0) : 0;

  return (
    <div>
      <Breadcrumb />
      <PageHeader title={ad.title || "Ad Detail"} description="Manage details for this advertisement">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/content-ads")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
            <Trash2 className="h-4 w-4" /> Delete
          </button>
          <button onClick={() => setActiveTab("Edit")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" /> Edit
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Impressions", value: (ad.impressions || 0).toLocaleString(), icon: Eye, color: "rgba(15,105,176,0.1)", iconColor: "#0F69B0" },
          { label: "Clicks", value: (ad.clicks || 0).toLocaleString(), icon: MousePointer, color: "rgba(124,58,237,0.1)", iconColor: "#7c3aed" },
          { label: "CTR", value: `${ctr}%`, icon: TrendingUp, color: "rgba(16,185,129,0.1)", iconColor: "#10b981" },
          { label: "Budget Used", value: `${budgetUsedPct}%`, icon: DollarSign, color: "rgba(245,158,11,0.1)", iconColor: "#f59e0b" },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col justify-between">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center mb-4" style={{ background: stat.color }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
        <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-white/[0.04]">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer", activeTab === tab ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground")}>
              {tab}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                {ad.image && (
                  <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] mb-6 h-48">
                    <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] mb-5 space-y-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Performance</p>
                  <MetricBar label="Impressions" value={ad.impressions} max={50000} color="#0F69B0" />
                  <MetricBar label="Clicks" value={ad.clicks} max={1000} color="#7c3aed" />
                  <MetricBar label="Conversions" value={ad.conversions} max={100} color="#10b981" />
                  <MetricBar label="Budget Spent" value={ad.spent} max={ad.budget} color="#f59e0b" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Ad ID", value: ad.id, icon: Hash },
                    { label: "Type", value: <span className="text-sm font-bold px-2 py-0.5 rounded-lg" style={{ background: `${typeOpt?.color}15`, color: typeOpt?.color }}>{typeOpt?.label}</span>, icon: TrendingUp },
                    { label: "Placement", value: placementOpt?.label || ad.placement, icon: null },
                    { label: "Status", value: <StatusBadge status={ad.status} />, icon: CheckCircle },
                    { label: "Advertiser", value: ad.advertiser?.name || "—", icon: null },
                    { label: "Email", value: ad.advertiser?.email || "—", icon: null },
                    { label: "Budget", value: `$${ad.budget}`, icon: DollarSign },
                    { label: "Spent", value: `$${ad.spent}`, icon: DollarSign },
                    { label: "CPC", value: `$${ad.cpc}`, icon: DollarSign },
                    { label: "Start Date", value: formatDateTime(ad.startDate), icon: Calendar },
                    { label: "End Date", value: formatDateTime(ad.endDate), icon: Calendar },
                    { label: "Created At", value: formatDateTime(ad.createdAt), icon: Calendar },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                      {item.icon && (
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                          <item.icon className="h-4 w-4 text-[#0F69B0]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                        <div className="text-sm font-bold text-foreground break-all">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {ad.description && (
                  <div className="mt-4 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
                    <p className="text-sm font-medium text-foreground leading-relaxed">{ad.description}</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "Edit" && (
              <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <AdForm initialData={ad} onSubmit={handleUpdate} onCancel={() => setActiveTab("Overview")} isLoading={isSaving} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete} title="Delete Ad" description={`Are you sure you want to delete "${ad.title}"?`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}