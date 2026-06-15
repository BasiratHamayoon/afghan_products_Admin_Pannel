"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Loader2, XCircle,
  Calendar, FileText, Layers, Target,
  MousePointerClick, TrendingUp, Hash, CheckCircle,
  XIcon,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchAboutById,
  deleteAboutItem,
  clearAboutByIdCache,
  fetchAboutItems,
} from "@/store/actions/aboutActions";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

function DetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [itemData, setItemData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMountedRef = useRef(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;

    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchAboutById(id));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) {
          setItemData(res.data);
        } else {
          setNotFound(true);
        }
      } catch {
        if (isMountedRef.current) setNotFound(true);
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [id, dispatch]);

  const handleDeleteConfirm = async () => {
    if (!itemData?.id) {
      setDeleteDialog(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteAboutItem(itemData.id));
      if (res?.success) {
        toast.success("About content deleted");
        clearAboutByIdCache(itemData.id);
        dispatch(fetchAboutItems());
        router.push("/about");
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setDeleteDialog(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading about content...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">
          About content not found
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          The content does not exist or has been deleted.
        </p>
        <button
          onClick={() => router.push("/about")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>
    );
  }

  const renderSection = (title, icon, items, renderItem, colorClass = "bg-[#0F69B0]") => {
    const Icon = icon;
    if (!items || items.length === 0) return null;
    return (
      <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={cn("h-4 w-4", colorClass)} />
          <h3 className="text-sm font-black text-foreground">{title}</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F69B0]/10 text-[#0F69B0]">
            {items.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {items.map((item, i) => renderItem(item, i))}
        </div>
      </div>
    );
  };

  const detailFields = [
    {
      label: "Headline",
      value: itemData.headline || "—",
      icon: FileText,
    },
    {
      label: "Sub Headline",
      value: itemData.subHeadline || "—",
      icon: FileText,
    },
    {
      label: "Mission Title",
      value: itemData.missionTitle || "—",
      icon: Target,
    },
    {
      label: "CTA Text",
      value: itemData.ctaText || "—",
      icon: MousePointerClick,
    },
    {
      label: "CTA Button",
      value: itemData.ctaButtonText || "—",
      icon: MousePointerClick,
    },
    {
      label: "Status",
      value: itemData.isActive ? "Active" : "Inactive",
      icon: Hash,
      isStatus: true,
    },
    {
      label: "Created",
      value: formatDate(itemData.createdAt),
      icon: Calendar,
    },
    {
      label: "Updated",
      value: formatDate(itemData.updatedAt),
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="About Detail"
        description={itemData.headline || ""}
      >
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/about")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/about/add?edit=${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{
              background:
                "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
            }}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div
            className="h-20 w-20 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(15,105,176,0.1)" }}
          >
            <span className="text-4xl">📄</span>
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">
            {itemData.headline}
          </h3>
          {itemData.subHeadline && (
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {itemData.subHeadline}
            </p>
          )}

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <span
              className={cn(
                "text-[11px] font-bold px-3 py-1 rounded-full",
                itemData.isActive
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-gray-500/10 text-gray-500"
              )}
            >
              {itemData.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 w-full">
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-center">
              <p className="text-lg font-black text-foreground">
                {itemData.features?.length || 0}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Features
              </p>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-center">
              <p className="text-lg font-black text-foreground">
                {itemData.metrics?.length || 0}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Metrics
              </p>
            </div>
            <div className="p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] text-center">
              <p className="text-lg font-black text-foreground">
                {itemData.whyChooseUs?.length || 0}
              </p>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                Why Us
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button
              onClick={() => router.push(`/about/add?edit=${id}`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => setDeleteDialog(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </motion.div>

        {/* Right — Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-5"
        >
          {/* Info fields */}
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
            <h3 className="text-sm font-black text-foreground mb-5">
              About Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {detailFields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div
                    key={field.label}
                    className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(15,105,176,0.08)" }}
                    >
                      <FieldIcon className="h-4 w-4 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        {field.label}
                      </p>
                      {field.isStatus ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg",
                            itemData.isActive
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-gray-500/10 text-gray-500"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              itemData.isActive
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                            )}
                          />
                          {field.value}
                        </span>
                      ) : (
                        <p className="text-sm font-bold text-foreground break-all">
                          {field.value}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          {itemData.description && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <h3 className="text-sm font-black text-foreground mb-4">
                Description
              </h3>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                  {itemData.description}
                </p>
              </div>
            </div>
          )}

          {/* Mission */}
          {itemData.missionText && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-black text-foreground">
                  Mission
                </h3>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-sm text-foreground font-medium leading-relaxed whitespace-pre-wrap">
                  {itemData.missionText}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Full width sections */}
      <div className="space-y-5">
        {/* Metrics */}
        {renderSection(
          "Metrics",
          TrendingUp,
          itemData.metrics,
          (m, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/30 dark:bg-white/[0.01]"
            >
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {m.label || "—"}
              </p>
              <p className="text-2xl font-black text-foreground mt-1">
                {m.value || "—"}
              </p>
            </div>
          ),
          "text-amber-600"
        )}

        {/* Features */}
        {renderSection(
          "Features",
          Layers,
          itemData.features,
          (f, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/30 dark:bg-white/[0.01]"
            >
              <div className="flex items-center gap-2 mb-2">
                {f.icon && (
                  <span className="text-xs font-bold text-[#0F69B0] bg-[#0F69B0]/10 px-2 py-0.5 rounded-md">
                    {f.icon}
                  </span>
                )}
                <p className="text-sm font-bold text-foreground">
                  {f.title || "—"}
                </p>
              </div>
              {f.description && (
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {f.description}
                </p>
              )}
            </div>
          ),
          "text-purple-600"
        )}

        {/* Why Choose Us */}
        {renderSection(
          "Why Choose Us",
          Hash,
          itemData.whyChooseUs,
          (w, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/30 dark:bg-white/[0.01]"
            >
              <div className="flex items-center gap-2 mb-2">
                {w.icon && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded-md">
                    {w.icon}
                  </span>
                )}
                <p className="text-sm font-bold text-foreground">
                  {w.title || "—"}
                </p>
              </div>
              {w.description && (
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {w.description}
                </p>
              )}
            </div>
          ),
          "text-rose-600"
        )}

        {/* CTA */}
        {(itemData.ctaText ||
          itemData.ctaButtonText ||
          itemData.ctaButtonUrl) && (
          <div className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-amber-100 dark:border-amber-900/20 shadow-[0_2px_12px_rgba(245,158,11,0.06)]">
            <div className="flex items-center gap-2 mb-4">
              <MousePointerClick className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-black text-foreground">
                Call to Action
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/30 dark:bg-white/[0.01]">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  CTA Text
                </p>
                <p className="text-sm font-bold text-foreground">
                  {itemData.ctaText || "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/30 dark:bg-white/[0.01]">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Button Text
                </p>
                <p className="text-sm font-bold text-foreground">
                  {itemData.ctaButtonText || "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/30 dark:bg-white/[0.01]">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Button URL
                </p>
                <p className="text-sm font-bold text-[#0F69B0] break-all">
                  {itemData.ctaButtonUrl || "—"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete About Content"
        description={`Are you sure you want to permanently delete "${itemData?.headline}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

export default function AboutDetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailContent />
    </Suspense>
  );
}