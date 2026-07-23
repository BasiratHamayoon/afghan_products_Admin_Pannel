"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Save, X, Plus, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/fileUrl";
import {
  loadCategoryOptions,
  loadSubCategoryOptions,
  loadProductTypeOptions,
} from "@/store/actions/selectActions";
import { clearSubCategoryOptions, clearProductTypeOptions } from "@/store/slices/selectSlice";
import { useTranslation } from "react-i18next";

const UNIT_OPTIONS = [
  "piece", "kg", "gram", "liter", "meter",
  "box", "pack", "dozen", "set", "pair",
];

export default function ProductForm({ initialData, onSubmit, onCancel, isLoading }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const {
    categoryOptions, categoryOptionsLoading,
    subCategoryOptions, subCategoryOptionsLoading,
    productTypeOptions, productTypeOptionsLoading,
  } = useSelector((state) => state.select);

  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const [name, setName] = useState(safe.name || "");
  const [description, setDescription] = useState(safe.description || "");
  const [sku, setSku] = useState(safe.sku || "");
  const [barcode, setBarcode] = useState(safe.barcode || "");
  const [sellingPrice, setSellingPrice] = useState(safe.sellingPrice ?? "");
  const [purchasePrice, setPurchasePrice] = useState(safe.purchasePrice ?? "");
  const [stock, setStock] = useState(safe.stock ?? "");
  const [minStock, setMinStock] = useState(safe.minStock ?? "");
  const [brand, setBrand] = useState(safe.brand || "");
  const [unit, setUnit] = useState(safe.unit || "");
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [isArchived, setIsArchived] = useState(safe.isArchived ?? false);
  const [categoryId, setCategoryId] = useState(safe.categoryId || "");
  const [subCategoryId, setSubCategoryId] = useState(safe.subCategoryId || "");
  const [productTypeId, setProductTypeId] = useState(safe.productTypeId || "");
  const [attributesStr, setAttributesStr] = useState(
    safe.attributes ? (typeof safe.attributes === "string" ? safe.attributes : JSON.stringify(safe.attributes, null, 2)) : ""
  );
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(
    Array.isArray(safe.images) ? safe.images.map((img) => ({ url: getFileUrl(img), existing: true, name: img })) : []
  );
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => { dispatch(loadCategoryOptions()); }, [dispatch]);

  useEffect(() => {
    if (!categoryId) { dispatch(clearSubCategoryOptions()); return; }
    dispatch(loadSubCategoryOptions(categoryId));
  }, [categoryId, dispatch]);

  useEffect(() => {
    if (!subCategoryId) { dispatch(clearProductTypeOptions()); return; }
    dispatch(loadProductTypeOptions(subCategoryId));
  }, [subCategoryId, dispatch]);

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newPreviews = files.map((file) => ({ url: URL.createObjectURL(file), existing: false, file, name: file.name }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setImageFiles((prev) => [...prev, ...files]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index) => {
    const removed = imagePreviews[index];
    if (!removed.existing) {
      const nonExistingBefore = imagePreviews.slice(0, index).filter((p) => !p.existing).length;
      setImageFiles((prev) => prev.filter((_, i) => i !== nonExistingBefore));
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = t("products.productNameRequired");
    if (!categoryId) errs.categoryId = t("products.categoryRequired");
    if (!subCategoryId) errs.subCategoryId = t("products.subcategoryRequired");
    if (!productTypeId) errs.productTypeId = t("products.productTypeRequired");
    if (!sellingPrice || isNaN(Number(sellingPrice))) errs.sellingPrice = t("products.sellingPriceRequired");
    if (!unit.trim()) errs.unit = t("products.unitRequired");
    if (attributesStr.trim()) {
      try { JSON.parse(attributesStr); } catch { errs.attributes = t("products.invalidJson"); }
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const formData = new FormData();
    formData.append("categoryId", categoryId);
    formData.append("subCategoryId", subCategoryId);
    formData.append("productTypeId", productTypeId);
    formData.append("name", name.trim());
    if (description.trim()) formData.append("description", description.trim());
    if (sku.trim()) formData.append("sku", sku.trim());
    if (barcode.trim()) formData.append("barcode", barcode.trim());
    formData.append("sellingPrice", String(Number(sellingPrice)));
    if (purchasePrice !== "") formData.append("purchasePrice", String(Number(purchasePrice)));
    if (stock !== "") formData.append("stock", String(Number(stock)));
    if (minStock !== "") formData.append("minStock", String(Number(minStock)));
    if (brand.trim()) formData.append("brand", brand.trim());
    formData.append("unit", unit.trim());
    formData.append("isActive", String(isActive));
    formData.append("isArchived", String(isArchived));
    if (attributesStr.trim()) formData.append("attributes", attributesStr.trim());
    imageFiles.forEach((file) => formData.append("images", file));
    const existingImages = imagePreviews.filter((p) => p.existing).map((p) => p.name);
    existingImages.forEach((img) => formData.append("existingImages", img));
    onSubmit(formData);
  };

  const fieldClass = (field) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const selectClass = (field) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-[#0f1420] text-foreground cursor-pointer disabled:opacity-60",
      errors[field] ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40"
    );

  const loadingField = (label) => (
    <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04]">
      <Loader2 className="h-4 w-4 animate-spin text-[#0F69B0]" />
      <span className="text-sm text-muted-foreground font-medium">{t("products.loading")} {label}...</span>
    </div>
  );

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("products.categoryLabel")} <span className="text-red-500">*</span>
            </label>
            {categoryOptionsLoading ? loadingField(t("products.loadingCategories")) : (
              <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(""); setProductTypeId(""); if (errors.categoryId) setErrors((p) => ({ ...p, categoryId: "" })); }} disabled={isLoading} className={selectClass("categoryId")}>
                <option value="">{t("products.selectCategory")}</option>
                {categoryOptions.map((c) => (<option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>))}
              </select>
            )}
            {errors.categoryId && <p className="text-[11px] text-red-500 font-semibold">{errors.categoryId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("products.subcategory")} <span className="text-red-500">*</span>
            </label>
            {subCategoryOptionsLoading ? loadingField(t("products.loadingSubcategories")) : (
              <select value={subCategoryId} onChange={(e) => { setSubCategoryId(e.target.value); setProductTypeId(""); if (errors.subCategoryId) setErrors((p) => ({ ...p, subCategoryId: "" })); }} disabled={isLoading || !categoryId} className={selectClass("subCategoryId")}>
                <option value="">{!categoryId ? t("products.selectCategoryFirst") : subCategoryOptions.length === 0 ? t("products.noSubcategories") : t("products.selectSubcategory")}</option>
                {subCategoryOptions.map((s) => (<option key={s.id || s._id} value={s.id || s._id}>{s.name}</option>))}
              </select>
            )}
            {errors.subCategoryId && <p className="text-[11px] text-red-500 font-semibold">{errors.subCategoryId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("products.productType")} <span className="text-red-500">*</span>
            </label>
            {productTypeOptionsLoading ? loadingField(t("products.loadingProductTypes")) : (
              <select value={productTypeId} onChange={(e) => { setProductTypeId(e.target.value); if (errors.productTypeId) setErrors((p) => ({ ...p, productTypeId: "" })); }} disabled={isLoading || !subCategoryId} className={selectClass("productTypeId")}>
                <option value="">{!subCategoryId ? t("products.selectSubcategoryFirst") : productTypeOptions.length === 0 ? t("products.noProductTypes") : t("products.selectProductType")}</option>
                {productTypeOptions.map((pt) => (<option key={pt.id || pt._id} value={pt.id || pt._id}>{pt.name}</option>))}
              </select>
            )}
            {errors.productTypeId && <p className="text-[11px] text-red-500 font-semibold">{errors.productTypeId}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("products.productName")} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((p) => ({ ...p, name: "" })); }} placeholder={t("products.productNamePlaceholder")} disabled={isLoading} className={fieldClass("name")} />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.description")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("products.descriptionPlaceholder")} rows={4} disabled={isLoading} className={cn(fieldClass("description"), "resize-none")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.sku")}</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t("products.skuPlaceholder")} disabled={isLoading} className={fieldClass("sku")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.barcode")}</label>
              <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder={t("products.barcodePlaceholder")} disabled={isLoading} className={fieldClass("barcode")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("products.sellingPrice")} <span className="text-red-500">*</span>
              </label>
              <input type="number" value={sellingPrice} onChange={(e) => { setSellingPrice(e.target.value); if (errors.sellingPrice) setErrors((p) => ({ ...p, sellingPrice: "" })); }} placeholder="0" min="0" step="0.01" disabled={isLoading} className={fieldClass("sellingPrice")} />
              {errors.sellingPrice && <p className="text-[11px] text-red-500 font-semibold">{errors.sellingPrice}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.purchasePrice")}</label>
              <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="0" min="0" step="0.01" disabled={isLoading} className={fieldClass("purchasePrice")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.stockLabel")}</label>
              <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="0" min="0" disabled={isLoading} className={fieldClass("stock")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.minStock")}</label>
              <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="0" min="0" disabled={isLoading} className={fieldClass("minStock")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.brand")}</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={t("products.brandPlaceholder")} disabled={isLoading} className={fieldClass("brand")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                {t("products.unit")} <span className="text-red-500">*</span>
              </label>
              <select value={unit} onChange={(e) => { setUnit(e.target.value); if (errors.unit) setErrors((p) => ({ ...p, unit: "" })); }} disabled={isLoading} className={selectClass("unit")}>
                <option value="">{t("products.selectUnit")}</option>
                {UNIT_OPTIONS.map((u) => (<option key={u} value={u}>{u}</option>))}
              </select>
              {errors.unit && <p className="text-[11px] text-red-500 font-semibold">{errors.unit}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("products.attributes")} <span className="text-muted-foreground font-medium normal-case tracking-normal">{t("products.attributesJson")}</span>
            </label>
            <textarea value={attributesStr} onChange={(e) => { setAttributesStr(e.target.value); if (errors.attributes) setErrors((p) => ({ ...p, attributes: "" })); }} placeholder={`{"color": "black", "size": "XL"}`} rows={4} disabled={isLoading} className={cn(fieldClass("attributes"), "resize-none font-mono text-xs")} />
            {errors.attributes && <p className="text-[11px] text-red-500 font-semibold">{errors.attributes}</p>}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("products.productImages")}</label>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageAdd} className="hidden" id="product-images-upload" />

            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imagePreviews.map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] aspect-square">
                    <img src={img.url} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => handleRemoveImage(i)} disabled={isLoading} className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center cursor-pointer">
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    {img.existing && (
                      <div className="absolute bottom-1 start-1 text-[8px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded">
                        {t("products.existing")}
                      </div>
                    )}
                  </div>
                ))}
                <label htmlFor="product-images-upload" className={cn("aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all", isLoading ? "opacity-60 cursor-not-allowed" : "border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02]")}>
                  <Plus className="h-6 w-6 text-muted-foreground/50 mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground">{t("products.addMore")}</span>
                </label>
              </div>
            ) : (
              <label htmlFor="product-images-upload" className={cn("flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed transition-all cursor-pointer", isLoading ? "opacity-60 cursor-not-allowed border-gray-200 dark:border-white/[0.08]" : "border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02]")}>
                <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mb-3">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-bold text-muted-foreground">{t("products.clickToUpload")}</p>
                <p className="text-[11px] text-muted-foreground/60 font-medium mt-1">{t("products.uploadFormats")}</p>
              </label>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
              <button type="button" onClick={() => setIsActive(!isActive)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}>
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
              </button>
              <div>
                <p className="text-sm font-bold text-foreground">{t("products.activeProduct")}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{t("products.activeProductDesc")}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
              <button type="button" onClick={() => setIsArchived(!isArchived)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isArchived ? "bg-amber-500" : "bg-gray-300 dark:bg-white/20")}>
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isArchived ? "translate-x-5" : "translate-x-0")} />
              </button>
              <div>
                <p className="text-sm font-bold text-foreground">{t("products.archiveProductLabel")}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{t("products.archiveProductDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <X className="h-4 w-4" />
            {t("products.cancel")}
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{t("products.saving")}</>
          ) : (
            <><Save className="h-4 w-4" />{safe.id || safe._id ? t("products.updateProduct") : t("products.createProduct")}</>
          )}
        </button>
      </div>
    </motion.form>
  );
}