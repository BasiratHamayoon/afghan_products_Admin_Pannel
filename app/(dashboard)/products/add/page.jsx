"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, PackagePlus } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductForm from "@/components/products/ProductForm";
import { createProduct } from "@/store/actions/productsActions";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function AddProductPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const res = await dispatch(createProduct(formData));
      if (res?.success) {
        toast.success(t("products.productCreated"));
        router.push("/products");
      } else {
        toast.error(res?.message || t("products.failedToCreate"));
      }
    } catch {
      toast.error(t("products.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("products.addNewProduct")} description={t("products.addNewProductDesc")}>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => router.push("/products")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
          <ArrowLeft className="h-4 w-4 rtl-mirror" />{t("products.back")}
        </motion.button>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6">
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <PackagePlus className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{t("products.productInformation")}</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("products.fillInDetails")}</p>
          </div>
        </div>
        <ProductForm onSubmit={handleSubmit} onCancel={() => router.push("/products")} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}