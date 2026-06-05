"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Archive, ArchiveRestore,
  Loader2, XCircle, FolderTree, Calendar, Hash, FolderOpen,
  Layers, Package,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchCategoryById,
  archiveCategoryAction,
  unarchiveCategoryAction,
  deleteCategoryAction,
} from "@/store/actions/categoriesActions";
import {
  fetchSubCategoryById,
  archiveSubCategoryAction,
  unarchiveSubCategoryAction,
  deleteSubCategoryAction,
} from "@/store/actions/subCategoriesActions";
import {
  fetchProductTypeById,
  archiveProductTypeAction,
  unarchiveProductTypeAction,
  deleteProductTypeAction,
} from "@/store/actions/productTypesActions";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const STATIC_SEGMENTS = ["add", "sub-categories", "product-types"];

const TYPE_CONFIG = {
  category: {
    label: "Category",
    backPath: "/categories",
    fetchFn: fetchCategoryById,
    archiveFn: archiveCategoryAction,
    unarchiveFn: unarchiveCategoryAction,
    deleteFn: deleteCategoryAction,
    emoji: "📦",
  },
  subCategory: {
    label: "Subcategory",
    backPath: "/categories/sub-categories",
    fetchFn: fetchSubCategoryById,
    archiveFn: archiveSubCategoryAction,
    unarchiveFn: unarchiveSubCategoryAction,
    deleteFn: deleteSubCategoryAction,
    emoji: "📁",
  },
  productType: {
    label: "Product Type",
    backPath: "/categories/product-types",
    fetchFn: fetchProductTypeById,
    archiveFn: archiveProductTypeAction,
    unarchiveFn: unarchiveProductTypeAction,
    deleteFn: deleteProductTypeAction,
    emoji: "🏷️",
  },
};

// ─── Module-level cache — survives Strict Mode remount ────────────────────────
// Key: "typeParam:id" → Value: fetched data or "loading"
const _fetchCache = {};

function DetailContent() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const typeParam = searchParams.get("type") || "category";
  const config = TYPE_CONFIG[typeParam] || TYPE_CONFIG.category;
  const fetchKey = id ? `${typeParam}:${id}` : null;

  const [itemData, setItemData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState({
    open: false, action: null,
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id || !fetchKey || STATIC_SEGMENTS.includes(id)) {
      setIsFetching(false);
      return;
    }

    // ─── Already cached — use cached data immediately ─────────────────────
    if (_fetchCache[fetchKey] && _fetchCache[fetchKey] !== "loading") {
      setItemData(_fetchCache[fetchKey]);
      setIsFetching(false);
      return;
    }

    // ─── Already in progress — skip (Strict Mode double call) ────────────
    if (_fetchCache[fetchKey] === "loading") return;

    // ─── Lock before any await ────────────────────────────────────────────
    _fetchCache[fetchKey] = "loading";

    const load = async () => {
      setIsFetching(true);
      setNotFound(false);
      setItemData(null);

      try {
        const fetchFn = TYPE_CONFIG[typeParam]?.fetchFn;
        if (!fetchFn) {
          if (isMountedRef.current) {
            setNotFound(true);
            setIsFetching(false);
          }
          delete _fetchCache[fetchKey];
          return;
        }

        const res = await dispatch(fetchFn(id));

        if (!isMountedRef.current) return;

        if (res?.success && res.data) {
          _fetchCache[fetchKey] = res.data; // cache the result
          setItemData(res.data);
        } else {
          delete _fetchCache[fetchKey]; // clear on failure — allow retry
          setNotFound(true);
        }
      } catch {
        if (isMountedRef.current) {
          delete _fetchCache[fetchKey];
          setNotFound(true);
        }
      } finally {
        if (isMountedRef.current) {
          setIsFetching(false);
        }
      }
    };

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, typeParam]);

  const handleArchiveConfirm = async () => {
    if (!itemData?.id) {
      setArchiveDialog({ open: false, action: null });
      return;
    }
    setIsActioning(true);
    try {
      const fn =
        archiveDialog.action === "archive"
          ? config.archiveFn
          : config.unarchiveFn;
      const res = await dispatch(fn(itemData.id));
      if (res?.success) {
        toast.success(
          archiveDialog.action === "archive"
            ? `${config.label} archived`
            : `${config.label} unarchived`
        );
        // Clear cache for this item so next visit re-fetches
        if (fetchKey) delete _fetchCache[fetchKey];
        router.push(config.backPath);
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
    if (!itemData?.id) {
      setDeleteDialog(false);
      return;
    }
    if (!itemData?.slug) {
      toast.error("Slug not found, cannot delete");
      setDeleteDialog(false);
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(config.deleteFn(itemData.id, itemData.slug));
      if (res?.success) {
        toast.success(`${config.label} deleted`);
        if (fetchKey) delete _fetchCache[fetchKey];
        router.push(config.backPath);
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

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading {config.label.toLowerCase()}...
          </p>
        </div>
      </div>
    );
  }

  // ─── Not Found ────────────────────────────────────────────────────────────
  if (notFound || !itemData) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">
          {config.label} not found
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          The item does not exist or has been deleted.
        </p>
        <button
          onClick={() => router.push(config.backPath)}
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

  const imageUrl = itemData?.image ? getFileUrl(itemData.image) : null;

  const detailFields = [
    { label: "Name", value: itemData?.name, icon: FolderOpen },
    {
      label: "Description",
      value: itemData?.description || "No description",
      icon: Package,
    },
    { label: "Slug", value: itemData?.slug || "—", icon: Hash },
    {
      label: "Sort Order",
      value: String(itemData?.sortOrder ?? 0),
      icon: Hash,
    },
    {
      label: "Status",
      value: itemData?.isArchived ? "Archived" : "Active",
      icon: Archive,
      isStatus: true,
    },
    {
      label: "Created",
      value: formatDate(itemData?.createdAt),
      icon: Calendar,
    },
    {
      label: "Updated",
      value: formatDate(itemData?.updatedAt),
      icon: Calendar,
    },
  ];

  if (
    typeParam === "category" &&
    itemData?.subCategoryCount !== undefined
  ) {
    detailFields.splice(4, 0, {
      label: "Subcategories",
      value: String(itemData.subCategoryCount),
      icon: FolderTree,
    });
  }

  if (typeParam === "subCategory" && itemData?.categoryName) {
    detailFields.splice(1, 0, {
      label: "Parent Category",
      value: itemData.categoryName,
      icon: FolderOpen,
    });
  }

  if (typeParam === "productType") {
    if (itemData?.categoryName)
      detailFields.splice(1, 0, {
        label: "Category",
        value: itemData.categoryName,
        icon: FolderOpen,
      });
    if (itemData?.subCategoryName)
      detailFields.splice(2, 0, {
        label: "Subcategory",
        value: itemData.subCategoryName,
        icon: Layers,
      });
  }

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title={`${config.label} Detail`}
        description={itemData?.name || ""}
      >
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(config.backPath)}
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
                `/categories/add?type=${typeParam}&edit=${id}`
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
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — Image + Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div className="h-24 w-24 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center mb-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={itemData?.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-5xl">{config.emoji}</span>
            )}
          </div>
          <h3 className="text-lg font-black text-foreground mb-1">
            {itemData?.name}
          </h3>
          {itemData?.description && (
            <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
              {itemData.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-4">
            <span
              className={cn(
                "text-[11px] font-bold px-3 py-1 rounded-full",
                itemData?.isArchived
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-emerald-500/10 text-emerald-600"
              )}
            >
              {itemData?.isArchived ? "Archived" : "Active"}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.06] w-full justify-center flex-wrap">
            <button
              onClick={() =>
                router.push(
                  `/categories/add?type=${typeParam}&edit=${id}`
                )
              }
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </button>
            {itemData?.isArchived ? (
              <button
                onClick={() =>
                  setArchiveDialog({ open: true, action: "unarchive" })
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800/40"
              >
                <ArchiveRestore className="h-3.5 w-3.5" />
                Unarchive
              </button>
            ) : (
              <button
                onClick={() =>
                  setArchiveDialog({ open: true, action: "archive" })
                }
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer border border-amber-200 dark:border-amber-800/40"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
            )}
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
          className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
        >
          <h3 className="text-sm font-black text-foreground mb-5">
            {config.label} Information
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
                          itemData?.isArchived
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-emerald-500/10 text-emerald-600"
                        )}
                      >
                        <span
                          className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            itemData?.isArchived
                              ? "bg-amber-500"
                              : "bg-emerald-500"
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
        </motion.div>
      </div>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, action: null })}
        onConfirm={handleArchiveConfirm}
        title={
          archiveDialog.action === "archive"
            ? `Archive ${config.label}`
            : `Unarchive ${config.label}`
        }
        description={`Are you sure you want to ${archiveDialog.action} "${itemData?.name}"?`}
        confirmLabel={
          archiveDialog.action === "archive" ? "Archive" : "Unarchive"
        }
        isLoading={isActioning}
        variant={
          archiveDialog.action === "archive" ? "warning" : "primary"
        }
      />
      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${config.label}`}
        description={`Are you sure you want to permanently delete "${itemData?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={null}>
      <DetailContent />
    </Suspense>
  );
}