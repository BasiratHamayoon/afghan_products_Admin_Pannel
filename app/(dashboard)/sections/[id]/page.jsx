"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Archive, ArchiveRestore,
  Loader2, XCircle, Calendar, Hash, Package,
  LayoutGrid, CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchSectionByKey,
  archiveSectionAction,
  unarchiveSectionAction,
  deleteSectionAction,
  clearSectionKeyCache,
} from "@/store/actions/sectionsActions";
import { formatDate } from "@/lib/helpers";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

function SectionDetailContent() {
  const router = useRouter();
  const { id: keyParam } = useParams();
  const dispatch = useDispatch();

  const [sectionData, setSectionData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState({
    open: false, action: null,
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!keyParam || keyParam === "add") return;
    if (fetchKeyRef.current === keyParam) return;
    fetchKeyRef.current = keyParam;

    const load = async () => {
      setIsFetching(true);
      setNotFound(false);
      setSectionData(null);

      try {
        const res = await dispatch(fetchSectionByKey(keyParam));
        if (!isMountedRef.current) return;

        if (res?.success && res?.data) {
          setSectionData(res.data);
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
  }, [keyParam, dispatch]);

  const handleArchiveConfirm = async () => {
    if (!sectionData?.id) {
      setArchiveDialog({ open: false, action: null });
      return;
    }
    setIsActioning(true);
    try {
      const fn =
        archiveDialog.action === "archive"
          ? archiveSectionAction
          : unarchiveSectionAction;
      const res = await dispatch(fn(sectionData.id));
      if (res?.success) {
        toast.success(
          archiveDialog.action === "archive"
            ? "Section archived"
            : "Section unarchived"
        );
        if (sectionData.key) clearSectionKeyCache(sectionData.key);
        router.push("/sections");
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!sectionData?.id) {
      setDeleteDialog(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteSectionAction(sectionData.id));
      if (res?.success) {
        toast.success("Section deleted");
        if (sectionData.key) clearSectionKeyCache(sectionData.key);
        router.push("/sections");
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
            Loading section...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !sectionData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">
          Section not found
        </h2>
        <button
          onClick={() => router.push("/sections")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sections
        </button>
      </div>
    );
  }

  const productCount =
    sectionData?.products?.length ?? sectionData?.productsCount ?? 0;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Section Detail"
        description={sectionData?.name || ""}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/sections")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              router.push(
                `/sections/add?mode=edit&key=${sectionData.key}`
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{
              background:
                "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
            }}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              router.push(
                `/sections/add?mode=products&key=${sectionData.key}`
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-purple-200 dark:border-purple-800/40 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
          >
            <Package className="h-4 w-4" />
            Manage Products
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Products", value: productCount, icon: Package, color: "rgba(15,105,176,0.08)", iconColor: "#0F69B0" },
          { label: "Status", value: sectionData?.isActive ? "Active" : "Inactive", icon: CheckCircle, color: "rgba(16,185,129,0.08)", iconColor: "#10b981" },
          { label: "Sort Order", value: sectionData?.sortOrder ?? 0, icon: Hash, color: "rgba(124,58,237,0.08)", iconColor: "#7c3aed" },
          { label: "Archive", value: sectionData?.isArchived ? "Archived" : "Live", icon: Archive, color: "rgba(245,158,11,0.08)", iconColor: "#f59e0b" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.color }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
      >
        <h3 className="text-sm font-black text-foreground mb-5">
          Section Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {[
            { label: "Section Name", value: sectionData?.name, icon: LayoutGrid },
            { label: "Key", value: sectionData?.key || "—", icon: Hash },
            { label: "Description", value: sectionData?.description || "No description", icon: Package },
            { label: "Sort Order", value: String(sectionData?.sortOrder ?? 0), icon: Hash },
            { label: "Is Active", value: sectionData?.isActive ? "Yes" : "No", icon: CheckCircle },
            { label: "Is Archived", value: sectionData?.isArchived ? "Yes" : "No", icon: Archive },
            { label: "Products Count", value: String(productCount), icon: Package },
            { label: "Created", value: formatDate(sectionData?.createdAt), icon: Calendar },
            { label: "Updated", value: formatDate(sectionData?.updatedAt), icon: Calendar },
          ].map((field) => {
            const FieldIcon = field.icon;
            return (
              <div
                key={field.label}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
              >
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                  <FieldIcon className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{field.label}</p>
                  <p className="text-sm font-bold text-foreground break-all">{field.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-white/[0.06] flex-wrap">
          <button
            onClick={() => router.push(`/sections/add?mode=edit&key=${sectionData.key}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20"
          >
            <Edit2 className="h-3.5 w-3.5" />Edit Section
          </button>
          <button
            onClick={() => router.push(`/sections/add?mode=products&key=${sectionData.key}`)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer border border-purple-200 dark:border-purple-800/40"
          >
            <Package className="h-3.5 w-3.5" />Manage Products
          </button>
          {sectionData?.isArchived ? (
            <button onClick={() => setArchiveDialog({ open: true, action: "unarchive" })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800/40">
              <ArchiveRestore className="h-3.5 w-3.5" />Unarchive
            </button>
          ) : (
            <button onClick={() => setArchiveDialog({ open: true, action: "archive" })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800/40">
              <Archive className="h-3.5 w-3.5" />Archive
            </button>
          )}
          <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
            <Trash2 className="h-3.5 w-3.5" />Delete
          </button>
        </div>
      </motion.div>

      <ConfirmDialog open={archiveDialog.open} onClose={() => setArchiveDialog({ open: false, action: null })} onConfirm={handleArchiveConfirm} title={archiveDialog.action === "archive" ? "Archive Section" : "Unarchive Section"} description={`Are you sure you want to ${archiveDialog.action} "${sectionData?.name}"?`} confirmLabel={archiveDialog.action === "archive" ? "Archive" : "Unarchive"} isLoading={isActioning} variant={archiveDialog.action === "archive" ? "warning" : "primary"} />
      <ConfirmDialog open={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDeleteConfirm} title="Delete Section" description={`Are you sure you want to permanently delete "${sectionData?.name}"? This cannot be undone.`} confirmLabel="Delete" isLoading={isDeleting} variant="danger" />
    </div>
  );
}

export default function SectionDetailPage() {
  return (
    <Suspense fallback={null}>
      <SectionDetailContent />
    </Suspense>
  );
}