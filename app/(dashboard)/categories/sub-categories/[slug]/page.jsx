"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Archive, ArchiveRestore,
  Loader2, XCircle, Calendar, Hash, FolderOpen, Package,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchSubCategoryBySlug,
  archiveSubCategoryAction,
  unarchiveSubCategoryAction,
  deleteSubCategoryAction,
} from "@/store/actions/subCategoriesActions";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const _cache = {};

function SubCategoryDetailContent() {
  const router = useRouter();
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [itemData, setItemData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState({ open: false, action: null });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!slug) { setIsFetching(false); return; }

    if (_cache[slug] && _cache[slug] !== "loading") {
      setItemData(_cache[slug]);
      setIsFetching(false);
      return;
    }

    if (_cache[slug] === "loading") return;
    _cache[slug] = "loading";

    const load = async () => {
      setIsFetching(true);
      setNotFound(false);
      setItemData(null);
      try {
        const res = await dispatch(fetchSubCategoryBySlug(slug));
        if (!isMountedRef.current) return;
        if (res?.success && res.data) {
          _cache[slug] = res.data;
          setItemData(res.data);
        } else {
          delete _cache[slug];
          setNotFound(true);
        }
      } catch {
        if (isMountedRef.current) { delete _cache[slug]; setNotFound(true); }
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [slug, dispatch]);

  const handleArchiveConfirm = async () => {
    if (!itemData?.id) { setArchiveDialog({ open: false, action: null }); return; }
    setIsActioning(true);
    try {
      const fn = archiveDialog.action === "archive" ? archiveSubCategoryAction : unarchiveSubCategoryAction;
      const res = await dispatch(fn(itemData.id));
      if (res?.success) {
        toast.success(archiveDialog.action === "archive" ? t("categories.subcategoryArchived") : t("categories.subcategoryUnarchived"));
        if (slug) delete _cache[slug];
        router.push("/categories/sub-categories");
      } else {
        toast.error(res?.message || t("categories.actionFailed"));
      }
    } catch {
      toast.error(t("categories.somethingWentWrong"));
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemData?.id || !itemData?.slug) {
      toast.error(t("categories.slugNotFound"));
      setDeleteDialog(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteSubCategoryAction(itemData.id, itemData.slug));
      if (res?.success) {
        toast.success(t("categories.subcategoryDeleted"));
        if (slug) delete _cache[slug];
        router.push("/categories/sub-categories");
      } else {
        toast.error(res?.message || t("categories.failedToDelete"));
      }
    } catch {
      toast.error(t("categories.somethingWentWrong"));
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
          <p className="text-sm text-muted-foreground font-medium">{t("categories.loadingSubcategory")}</p>
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
        <h2 className="text-lg font-black text-foreground">{t("categories.subcategoryNotFound")}</h2>
        <p className="text-sm text-muted-foreground font-medium">{t("categories.itemNotFoundDesc")}</p>
        <button
          onClick={() => router.push("/categories/sub-categories")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("categories.back")}
        </button>
      </div>
    );
  }

  const imageUrl = itemData?.image ? getFileUrl(itemData.image) : null;

  const detailFields = [
    { label: t("categories.name"), value: itemData?.name, icon: FolderOpen },
    { label: t("categories.parentCategory"), value: itemData?.categoryName || "—", icon: FolderOpen },
    { label: t("categories.description"), value: itemData?.description || "No description", icon: Package },
    { label: t("categories.slug"), value: itemData?.slug || "—", icon: Hash },
    { label: t("categories.sortOrder"), value: String(itemData?.sortOrder ?? 0), icon: Hash },
    { label: t("categories.status"), value: itemData?.isArchived ? t("categories.archivedStatus") : t("categories.activeStatus"), icon: Archive, isStatus: true },
    { label: t("categories.created"), value: formatDate(itemData?.createdAt), icon: Calendar },
    { label: t("categories.updatedField"), value: formatDate(itemData?.updatedAt), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("categories.subcategoryDetail")} description={itemData?.name || ""}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/categories/sub-categories")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("categories.back")}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push(`/categories/sub-categories/add?edit=${itemData.id}&slug=${itemData.slug || ""}`)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" />{t("categories.edit")}
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center">
          <div className="h-24 w-24 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            {imageUrl ? (<img src={imageUrl} alt={itemData?.name} className="object-cover w-full h-full" />) : (<span className="text-5xl">📁</span>)}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">{itemData?.name}</h3>
          {itemData?.categoryName && (
            <p className="text-xs text-[#0F69B0] font-semibold mb-1">↳ {itemData.categoryName}</p>
          )}
          {itemData?.description && (
            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">{itemData.description}</p>
          )}
          <div className="flex items-center gap-2 mt-4">
            <span className={cn("text-[11px] font-bold px-3 py-1 rounded-full", itemData?.isArchived ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600")}>
              {itemData?.isArchived ? t("categories.archivedStatus") : t("categories.activeStatus")}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button onClick={() => router.push(`/categories/sub-categories/add?edit=${itemData.id}&slug=${itemData.slug || ""}`)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20">
              <Edit2 className="h-3.5 w-3.5" />{t("categories.edit")}
            </button>
            {itemData?.isArchived ? (
              <button onClick={() => setArchiveDialog({ open: true, action: "unarchive" })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800/40">
                <ArchiveRestore className="h-3.5 w-3.5" />{t("categories.unarchive")}
              </button>
            ) : (
              <button onClick={() => setArchiveDialog({ open: true, action: "archive" })} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800/40">
                <Archive className="h-3.5 w-3.5" />{t("categories.archive")}
              </button>
            )}
            <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
              <Trash2 className="h-3.5 w-3.5" />{t("categories.delete")}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
          <h3 className="text-sm font-black text-foreground mb-5">{t("categories.subcategoryInformation")}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {detailFields.map((field) => {
              const FieldIcon = field.icon;
              return (
                <div key={field.label} className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                    <FieldIcon className="h-4 w-4 text-[#0F69B0]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{field.label}</p>
                    {field.isStatus ? (
                      <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg", itemData?.isArchived ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600")}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", itemData?.isArchived ? "bg-amber-500" : "bg-emerald-500")} />
                        {field.value}
                      </span>
                    ) : (
                      <p className="text-sm font-bold text-foreground break-all">{field.value || "—"}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, action: null })}
        onConfirm={handleArchiveConfirm}
        title={archiveDialog.action === "archive" ? t("categories.archiveSubcategory") : t("categories.unarchiveSubcategory")}
        description={`${archiveDialog.action === "archive" ? t("categories.archiveDesc") : t("categories.unarchiveDesc")} "${itemData?.name}"?`}
        confirmLabel={archiveDialog.action === "archive" ? t("categories.archive") : t("categories.unarchive")}
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />
      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={t("categories.deleteSubcategory")}
        description={`${t("categories.deleteSubcategoryDesc")} "${itemData?.name}"${t("categories.deleteSuffix")}`}
        confirmLabel={t("categories.delete")}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

export default function SubCategoryDetailPage() {
  return (
    <Suspense fallback={null}>
      <SubCategoryDetailContent />
    </Suspense>
  );
}