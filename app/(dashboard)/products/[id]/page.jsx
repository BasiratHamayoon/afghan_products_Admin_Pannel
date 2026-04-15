"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, CheckCircle,
  XCircle, Package, AlertTriangle, Star, LayoutDashboard,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductDetail from "@/components/products/ProductDetails";
import ProductForm from "@/components/products/ProductForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import {
  fetchProductById, removeProduct, editProduct,
  approveProduct, rejectProduct,
} from "@/store/actions/productsActions";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "edit", label: "Edit Product", icon: Edit2 },
];

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedProduct: product, isLoading } = useSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleUpdate = async (data) => {
    if (!id) return;
    setIsSaving(true);
    const res = await dispatch(editProduct(id, data));
    setIsSaving(false);
    if (res?.success) { toast.success("Product updated!"); setActiveTab("overview"); }
    else toast.error("Failed to update");
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeProduct(id));
    setIsDeleting(false);
    if (res?.success) { toast.success("Product deleted"); router.push("/products"); }
    else toast.error("Failed to delete");
  };

  const handleApprove = async () => {
    if (!id) return;
    const res = await dispatch(approveProduct(id));
    if (res?.success) toast.success("Product approved");
    else toast.error("Failed to approve");
  };

  const handleReject = async () => {
    if (!id) return;
    const res = await dispatch(rejectProduct(id));
    if (res?.success) toast.success("Product rejected");
    else toast.error("Failed to reject");
  };

  const handleToggleFeatured = async () => {
    if (!product?.id) return;
    await dispatch(editProduct(product.id, { ...product, featured: !product.featured }));
    toast.success(`${!product.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading product..." />
      </div>
    );
  }

  if (!product || !product.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground mb-1">Product not found</h2>
          <p className="text-sm text-muted-foreground font-medium max-w-sm">The product you are looking for does not exist or has been removed.</p>
        </div>
        <button onClick={() => router.push("/products")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <ArrowLeft className="h-4 w-4" />
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title={product.name || "Product Detail"}
        description={`${product.brand || ""} · ${product.sku || ""} · ${product.category || ""}`}
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={() => router.push("/products")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <button onClick={handleToggleFeatured} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors cursor-pointer", product.featured ? "border-yellow-200 dark:border-yellow-800/40 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20" : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
            <Star className={cn("h-4 w-4", product.featured && "fill-yellow-400 text-yellow-400")} />
            <span className="hidden sm:inline">{product.featured ? "Unfeature" : "Feature"}</span>
          </button>
          {(product.status === "pending" || product.status === "reported") && (
            <button onClick={handleApprove} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-green-200 dark:border-green-800/40 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer">
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Approve</span>
            </button>
          )}
          {product.status !== "rejected" && (
            <button onClick={handleReject} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-orange-200 dark:border-orange-800/40 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors cursor-pointer">
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          )}
          <button onClick={() => setDeleteDialog(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
          <button onClick={() => setActiveTab("edit")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center gap-1 p-3 sm:p-4 border-b border-gray-50 dark:border-white/[0.04] overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 mr-4">
            <StatusBadge status={product.status} />
            {product.reportCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
                <AlertTriangle className="h-2.5 w-2.5" />
                {product.reportCount} Reports
              </span>
            )}
          </div>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25"
                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                <ProductDetail product={product} />
              </motion.div>
            )}
            {activeTab === "edit" && (
              <motion.div key="edit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
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
        description={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}