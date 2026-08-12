"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import {
  ArrowLeft, LayoutGrid, Edit2, Package,
  Loader2, CheckCircle, Search, X, AlertCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SectionForm from "@/components/sections/SectionForm";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  createSection,
  fetchSectionByKey,
  editSection,
  manageSectionProducts,
  clearSectionKeyCache,
} from "@/store/actions/sectionsActions";
import { fetchProductSelectList } from "@/store/actions/selectActions";
import { getFileUrl } from "@/lib/fileUrl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function AddEditSectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const mode = searchParams.get("mode") || "create";
  const sectionKey = searchParams.get("key") || null;
  const isEditMode = mode === "edit" && !!sectionKey;
  const isProductsMode = mode === "products" && !!sectionKey;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [sectionData, setSectionData] = useState(null);

  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [isSavingProducts, setIsSavingProducts] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const fetchKeyRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!sectionKey) return;
    if (fetchKeyRef.current === sectionKey) return;
    fetchKeyRef.current = sectionKey;

    const load = async () => {
      setIsFetching(true);
      try {
        const res = await dispatch(fetchSectionByKey(sectionKey));
        if (!isMountedRef.current) return;
        if (res?.success && res?.data) {
          setSectionData(res.data);
          const existingIds = (res.data.products || []).map((p) => p._id || p.id || p);
          setSelectedProductIds(existingIds);
        } else {
          toast.error(t("sections.sectionNotFoundRedirect"));
          router.push("/sections");
        }
      } catch {
        if (isMountedRef.current) {
          toast.error(t("sections.failedToLoadSection"));
          router.push("/sections");
        }
      } finally {
        if (isMountedRef.current) setIsFetching(false);
      }
    };
    load();
  }, [sectionKey, dispatch, router, t]);

  useEffect(() => {
    if (!isProductsMode || productsLoaded) return;
    const load = async () => {
      setLoadingProducts(true);
      const data = await fetchProductSelectList();
      setAllProducts(data);
      setLoadingProducts(false);
      setProductsLoaded(true);
    };
    load();
  }, [isProductsMode, productsLoaded]);

  const handleCreate = async (data) => {
    setIsLoading(true);
    try {
      const res = await dispatch(createSection(data));
      if (res?.success) {
        toast.success(t("sections.sectionCreated"));
        router.push("/sections");
      } else {
        toast.error(res?.message || t("sections.failedToCreateSection"));
      }
    } catch {
      toast.error(t("sections.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    if (!sectionData?.id) return;
    setIsLoading(true);
    try {
      const res = await dispatch(editSection(sectionData.id, data));
      if (res?.success) {
        toast.success(t("sections.sectionUpdated"));
        if (res.data?.key) clearSectionKeyCache(res.data.key);
        router.push("/sections");
      } else {
        toast.error(res?.message || t("sections.failedToUpdateSection"));
      }
    } catch {
      toast.error(t("sections.somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((pid) => pid !== productId) : [...prev, productId]
    );
  };

  const handleSaveProducts = async () => {
    if (!sectionData?.id) return;
    setIsSavingProducts(true);
    try {
      const res = await dispatch(manageSectionProducts(sectionData.id, selectedProductIds));
      if (res?.success) {
        toast.success(t("sections.productsUpdated"));
        if (sectionData.key) clearSectionKeyCache(sectionData.key);
        router.push("/sections");
      } else {
        toast.error(res?.message || t("sections.failedToUpdateProducts"));
      }
    } catch {
      toast.error(t("sections.somethingWentWrong"));
    } finally {
      setIsSavingProducts(false);
    }
  };

  const handleBack = () => { router.push("/sections"); };

  const filteredProducts = allProducts.filter((p) =>
    p.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F69B0]" />
          <p className="text-sm text-muted-foreground font-medium">{t("sections.loadingSectionData")}</p>
        </div>
      </div>
    );
  }

  const title = isProductsMode ? t("sections.manageProductsTitle") : isEditMode ? t("sections.editSectionTitle") : t("sections.addSectionTitle");
  const description = isProductsMode
    ? `${t("sections.manageProductsDesc")} "${sectionData?.name || "section"}"`
    : isEditMode ? t("sections.editSectionDesc") : t("sections.addSectionDesc");
  const TitleIcon = isProductsMode ? Package : isEditMode ? Edit2 : LayoutGrid;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={title} description={description}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 rtl-mirror" />
          {t("sections.back")}
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <TitleIcon className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{description}</p>
          </div>
        </div>

        {isProductsMode ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground font-medium">
                {selectedProductIds.length}{" "}
                {selectedProductIds.length !== 1 ? t("sections.productsSelected") : t("sections.productSelected")}{" "}
                {t("sections.selectedCount")}
              </p>
              <button
                onClick={handleSaveProducts}
                disabled={isSavingProducts}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
              >
                {isSavingProducts ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("sections.saving")}</>
                ) : (
                  <><CheckCircle className="h-3.5 w-3.5" />{t("sections.saveProducts")}</>
                )}
              </button>
            </div>

            {selectedProductIds.length > 0 && (
              <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[#0F69B0]/[0.05] border border-[#0F69B0]/20">
                <AlertCircle className="h-4 w-4 text-[#0F69B0] shrink-0" />
                <p className="text-xs font-semibold text-[#0F69B0]">
                  {selectedProductIds.length}{" "}
                  {selectedProductIds.length !== 1 ? t("sections.productsSelected") : t("sections.productSelected")}{" "}
                  {t("sections.selectedCount")}. {t("sections.clickSaveToApply")}
                </p>
              </div>
            )}

            <div className="relative mb-4">
              <Search className="absolute start-3.5 h-4 w-4 text-muted-foreground/50 pointer-events-none top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder={t("sections.searchProducts")}
                className="w-full ps-10 pe-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch("")}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {loadingProducts ? (
              <LoadingSpinner size="md" text={t("sections.loadingProducts")} className="py-10" />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm font-bold text-foreground mb-1">{t("sections.noProductsFound")}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {productSearch ? t("sections.tryDifferentSearch") : t("sections.noProductsAvailable")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredProducts.map((product) => {
                  const pid = product.id || product._id;
                  const isSelected = selectedProductIds.includes(pid);
                  const imageUrl = product.image ? getFileUrl(product.image) : null;
                  return (
                    <button
                      key={pid}
                      onClick={() => toggleProduct(pid)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-start w-full",
                        isSelected
                          ? "border-[#0F69B0] bg-[#0F69B0]/[0.04]"
                          : "border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/30 bg-gray-50/50 dark:bg-white/[0.02]"
                      )}
                    >
                      <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100 dark:border-white/[0.08] shrink-0 bg-white dark:bg-white/[0.04] flex items-center justify-center">
                        {imageUrl ? (
                          <img src={imageUrl} alt={product.name} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-lg">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-bold truncate", isSelected ? "text-[#0F69B0]" : "text-foreground")}>
                          {product.name}
                        </p>
                        {product.price !== undefined && (
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">AFN {product.price}</p>
                        )}
                      </div>
                      <div className={cn("h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all", isSelected ? "bg-[#0F69B0] border-[#0F69B0]" : "border-gray-300 dark:border-white/20")}>
                        {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {!loadingProducts && filteredProducts.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                <p className="text-xs text-muted-foreground font-medium">
                  {filteredProducts.length} {t("sections.shown")} · {selectedProductIds.length} {t("sections.selectedCount")}
                </p>
                <div className="flex items-center gap-2">
                  {selectedProductIds.length > 0 && (
                    <button
                      onClick={() => setSelectedProductIds([])}
                      className="text-xs font-bold text-red-500 hover:underline cursor-pointer px-2 py-1"
                    >
                      {t("sections.clearAll")}
                    </button>
                  )}
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("sections.cancel")}
                  </button>
                  <button
                    onClick={handleSaveProducts}
                    disabled={isSavingProducts}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    {isSavingProducts ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />{t("sections.saving")}</>
                    ) : (
                      <><CheckCircle className="h-3.5 w-3.5" />{t("sections.saveProducts")}</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <SectionForm
            initialData={isEditMode ? sectionData : {}}
            onSubmit={isEditMode ? handleUpdate : handleCreate}
            onCancel={handleBack}
            isLoading={isLoading}
          />
        )}
      </motion.div>
    </div>
  );
}

export default function AddSectionPage() {
  return (
    <Suspense fallback={null}>
      <AddEditSectionContent />
    </Suspense>
  );
}