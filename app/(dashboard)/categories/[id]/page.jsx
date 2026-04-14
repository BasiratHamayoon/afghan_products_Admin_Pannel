"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft, Edit2, Trash2, Package, FolderTree,
  Hash, Globe, CheckCircle, Calendar, Star,
  Plus, XCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import CategoryForm from "@/components/categories/CategoryForm";
import SubCategoryList from "@/components/categories/SubCategoryList";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchCategoryById, removeCategory, editCategory } from "@/store/actions/categoriesActions";
import { dummySubCategories } from "@/data/dummyCategories";
import { formatDateTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = ["Overview", "Edit", "Subcategories"];

export default function CategoryDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedCategory: category, isLoading } = useSelector((state) => state.categories);
  const [activeTab, setActiveTab] = useState("Overview");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCategoryById(id));
    }
  }, [dispatch, id]);

  const subCats = id
    ? (dummySubCategories || []).filter((s) => s && s.parentId === id)
    : [];

  const handleUpdate = async (data) => {
    if (!id) return;
    setIsSaving(true);
    const res = await dispatch(editCategory(id, data));
    setIsSaving(false);
    if (res?.success) {
      toast.success("Category updated successfully!");
      setActiveTab("Overview");
    } else {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    const res = await dispatch(removeCategory(id));
    setIsDeleting(false);
    if (res?.success) {
      toast.success("Category deleted");
      router.push("/categories");
    } else {
      toast.error("Failed to delete category");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading category..." />
      </div>
    );
  }

  if (!category || !category.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-lg font-black text-foreground">Category not found</h2>
        <p className="text-sm text-muted-foreground font-medium">
          The category you are looking for does not exist or has been deleted.
        </p>
        <button
          onClick={() => router.push("/categories")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title={category.name || "Category Detail"}
        description={`Manage details and subcategories for ${category.name || "this category"}`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/categories")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button
            onClick={() => setDeleteDialog(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 dark:border-red-800/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
          <button
            onClick={() => setActiveTab("Edit")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col items-center text-center"
        >
          <div className="relative mb-3">
            {category.image ? (
              <div className="h-20 w-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: category.color ? `${category.color}18` : "rgba(15,105,176,0.08)" }}
              >
                {category.icon || "📦"}
              </div>
            )}
            {category.featured && (
              <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center">
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>
          <h3 className="text-base font-black text-foreground mb-1">{category.name}</h3>
          <p className="text-[11px] text-muted-foreground font-medium mb-3">
            /{category.slug || ""}
          </p>
          <StatusBadge status={category.status || "inactive"} />
          {category.description && (
            <p className="text-xs text-muted-foreground font-medium mt-3 leading-relaxed">
              {category.description}
            </p>
          )}
        </motion.div>

        {[
          {
            label: "Total Products",
            value: (category.productsCount || 0).toLocaleString(),
            icon: Package,
            color: "rgba(15,105,176,0.1)",
            iconColor: "#0F69B0",
          },
          {
            label: "Subcategories",
            value: category.subcategoriesCount || 0,
            icon: FolderTree,
            color: "rgba(124,58,237,0.1)",
            iconColor: "#7c3aed",
          },
          {
            label: "Sort Order",
            value: `#${category.sortOrder || 1}`,
            icon: Hash,
            color: "rgba(16,185,129,0.1)",
            iconColor: "#10b981",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.08 }}
            className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex flex-col justify-between"
          >
            <div
              className="h-11 w-11 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.color }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
      >
        <div className="flex items-center gap-1 p-4 border-b border-gray-50 dark:border-white/[0.04]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer",
                activeTab === tab
                  ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25"
                  : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
              )}
            >
              {tab}
              {tab === "Subcategories" && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-current/20 text-[10px]">
                  {subCats.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {activeTab === "Overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: "Category ID", value: category.id, icon: Hash },
                    { label: "Level", value: `Level ${category.level || 1}`, icon: FolderTree },
                    {
                      label: "Status",
                      value: <StatusBadge status={category.status || "inactive"} />,
                      icon: CheckCircle,
                    },
                    { label: "Featured", value: category.featured ? "Yes" : "No", icon: Star },
                    { label: "Slug", value: `/${category.slug || ""}`, icon: Globe },
                    {
                      label: "Color",
                      value: (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded" style={{ backgroundColor: category.color || "#0F69B0" }} />
                          <span className="font-mono text-xs">{category.color || "#0F69B0"}</span>
                        </div>
                      ),
                      icon: null,
                    },
                    { label: "Created At", value: formatDateTime(category.createdAt), icon: Calendar },
                    { label: "Updated At", value: formatDateTime(category.updatedAt), icon: Calendar },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                    >
                      {item.icon && (
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: "rgba(15,105,176,0.08)" }}
                        >
                          <item.icon className="h-4 w-4 text-[#0F69B0]" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          {item.label}
                        </p>
                        <div className="text-sm font-bold text-foreground break-all">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "Edit" && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <CategoryForm
                  initialData={category}
                  onSubmit={handleUpdate}
                  onCancel={() => setActiveTab("Overview")}
                  isLoading={isSaving}
                />
              </motion.div>
            )}

            {activeTab === "Subcategories" && (
              <motion.div
                key="subcategories"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-foreground">
                    Subcategories ({subCats.length})
                  </h3>
                  <button
                    onClick={() => router.push(`/categories/add?parentId=${id}`)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Subcategory
                  </button>
                </div>
                <SubCategoryList
                  subCategories={subCats}
                  onView={(sub) => sub?.id && router.push(`/categories/${sub.id}`)}
                  onEdit={(sub) => sub?.id && router.push(`/categories/${sub.id}`)}
                  onDelete={(sub) => sub?.name && toast.success(`Delete ${sub.name} coming soon`)}
                  onAdd={() => router.push(`/categories/add?parentId=${id}`)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}