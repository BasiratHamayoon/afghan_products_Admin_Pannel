"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, FolderPlus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import CategoryForm from "@/components/categories/CategoryForm";
import { createCategory } from "@/store/actions/categoriesActions";
import toast from "react-hot-toast";

export default function AddCategoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const parentId = searchParams.get("parentId");

  const handleSubmit = async (data) => {
    setIsLoading(true);
    const res = await dispatch(createCategory({
      ...data,
      parentId: parentId || data.parentId,
      level: parentId ? 2 : data.level,
    }));
    setIsLoading(false);
    if (res?.success) {
      toast.success("Category created successfully!");
      router.push("/categories");
    } else {
      toast.error("Failed to create category");
    }
  };

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title="Add New Category"
        description="Create a new product category or subcategory"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/categories")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Categories
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(15,105,176,0.1)" }}
          >
            <FolderPlus className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">Category Information</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Fill in the details below to create a new category
            </p>
          </div>
        </div>

        <CategoryForm
          initialData={parentId ? { level: 2, parentId } : {}}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/categories")}
          isLoading={isLoading}
        />
      </motion.div>
    </div>
  );
}