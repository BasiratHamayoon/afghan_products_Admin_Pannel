"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Archive, ArchiveRestore,
  Package, XCircle, LayoutDashboard, Loader2,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductDetail from "@/components/products/ProductDetails";
import ProductForm from "@/components/products/ProductForm";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchProductBySlug,
  fetchProductById,
  editProduct,
  deleteProduct,
  archiveProduct,
  unarchiveProduct,
  toggleProductStatus,
  clearProductSlugCache,
} from "@/store/actions/productsActions";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "edit", label: "Edit Product", icon: Edit2 },
];

export default function ProductDetailPage() {
  const params = useParams();
  const slugOrId = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedProduct: product, isLoading } = useSelector(
    (state) => state.products
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [archiveDialog, setArchiveDialog] = useState({
    open: false, action: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const fetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!slugOrId) return;

    const fetchKey = slugOrId;
    if (fetchKeyRef.current === fetchKey) return;
    fetchKeyRef.current = fetchKey;

    const load = async () => {
      setNotFound(false);

      const isObjectId = /^[a-f\d]{24}$/i.test(slugOrId);

      let res;
      if (isObjectId) {
        res = await dispatch(fetchProductById(slugOrId));
      } else {
        res = await dispatch(fetchProductBySlug(slugOrId));
      }

      if (!isMountedRef.current) return;
      if (!res?.success) setNotFound(true);
    };

    load();
  }, [slugOrId]);

  const handleUpdate = async (formData) => {
    if (!product?.id) return;
    setIsSaving(true);
    const res = await dispatch(editProduct(product.id, formData));
    setIsSaving(false);
    if (res?.success) {
      toast.success("Product updated!");
      setActiveTab("overview");
      if (product.slug) {
        clearProductSlugCache(product.slug);
        fetchKeyRef.current = null;
        dispatch(fetchProductBySlug(product.slug));
      }
    } else {
      toast.error(res?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!product?.id) return;
    setIsDeleting(true);
    const res = await dispatch(deleteProduct(product.id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Product deleted");
      router.push("/products");
    } else {
      toast.error(res?.message || "Failed to delete");
    }
  };

  const handleArchiveConfirm = async () => {
    if (!product?.id) {
      setArchiveDialog({ open: false, action: null });
      return;
    }
    setIsActioning(true);
    try {
      const fn =
        archiveDialog.action === "archive" ? archiveProduct : unarchiveProduct;
      const res = await dispatch(fn(product.id));
      if (res?.success) {
        toast.success(
          archiveDialog.action === "archive"
            ? "Product archived"
            : "Product unarchived"
        );
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

  const handleToggleStatus = async () => {
    if (!product?.id) return;
    const res = await dispatch(toggleProductStatus(product.id, product.status));
    if (res?.success) {
      toast.success("Status updated");
    } else {
      toast.error(res?.message || "Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">
            Loading product...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || (!isLoading && !product?.id)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">
          Product not found
        </h2>
        <p className="text-sm text-muted-foreground font-medium">
          The product does not exist or has been removed.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>
      </div>
    );
  }

  const thumbnail = product.images?.[0]
    ? getFileUrl(product.images[0])
    : null;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title={product.name || "Product Detail"}
        description={`${product.brand || ""} · ${product.sku || ""}`}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/products")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleToggleStatus}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer",
              product.isActive
                ? "border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
            )}
          >
            {product.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
            {product.isActive ? "Active" : "Inactive"}
          </motion.button>

          {product.isArchived ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                setArchiveDialog({ open: true, action: "unarchive" })
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-emerald-200 dark:border-emerald-800/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer"
            >
              <ArchiveRestore className="h-4 w-4" />
              Unarchive
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                setArchiveDialog({ open: true, action: "archive" })
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-amber-200 dark:border-amber-800/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer"
            >
              <Archive className="h-4 w-4" />
              Archive
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab("edit")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{
              background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
            }}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </motion.button>
        </div>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.06] overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 px-4 shrink-0 border-r border-gray-100 dark:border-white/[0.06]">
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={product.name}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                <Package className="h-4 w-4 text-muted-foreground/50" />
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  product.isArchived
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-emerald-600"
                )}
              >
                {product.isArchived ? "Archived" : "Live"}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full",
                  product.isActive
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-gray-500/10 text-gray-500"
                )}
              >
                {product.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2",
                  activeTab === tab.id
                    ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <ProductDetail product={product} />
              </motion.div>
            )}
            {activeTab === "edit" && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <ProductForm
                  initialData={product}
                  onSubmit={handleUpdate}
                  onCancel={() => setActiveTab("overview")}
                  isLoading={isSaving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        description={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, action: null })}
        onConfirm={handleArchiveConfirm}
        title={
          archiveDialog.action === "archive"
            ? "Archive Product"
            : "Unarchive Product"
        }
        description={`Are you sure you want to ${archiveDialog.action} "${product.name}"?`}
        confirmLabel={
          archiveDialog.action === "archive" ? "Archive" : "Unarchive"
        }
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />
    </div>
  );
}