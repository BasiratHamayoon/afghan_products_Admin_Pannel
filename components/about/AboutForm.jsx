"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function ArraySection({ title, items, setItems, fields, disabled }) {
  const { t } = useTranslation();

  const addItem = () => {
    const newItem = {};
    fields.forEach((f) => {
      if (f.key === "order") newItem[f.key] = items.length;
      else if (f.key === "isActive") newItem[f.key] = true;
      else newItem[f.key] = "";
    });
    setItems([...items, newItem]);
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [key]:
        key === "isActive"
          ? value === "true" || value === true
          : key === "order"
          ? Number(value)
          : value,
    };
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-foreground uppercase tracking-widest">
          {title}
        </label>
        <button
          type="button"
          onClick={addItem}
          disabled={disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20 disabled:opacity-60"
        >
          <Plus className="h-3 w-3" />
          {t("about.addItem")}
        </button>
      </div>

      {items.length === 0 && (
        <p className="text-xs text-muted-foreground font-medium py-3 text-center border border-dashed border-gray-200 dark:border-white/[0.08] rounded-xl">
          {t("about.noItemsYet")}
        </p>
      )}

      {items.map((item, index) => (
        <div
          key={index}
          className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t("about.item")} {index + 1}
            </span>
            <button
              type="button"
              onClick={() => removeItem(index)}
              disabled={disabled}
              className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div
                key={field.key}
                className={cn("space-y-1", field.fullWidth && "sm:col-span-2")}
              >
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {field.label}
                </label>

                {field.key === "isActive" ? (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => updateItem(index, "isActive", !item.isActive)}
                      disabled={disabled}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60",
                        item.isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                          item.isActive ? "translate-x-5" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground">
                      {item.isActive ? t("about.activeStatus") : t("about.inactiveStatus")}
                    </span>
                  </div>
                ) : field.select ? (
                  <select
                    value={item[field.key] || ""}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-pointer focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
                  >
                    <option value="">Select {field.label}...</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === "number" ? (
                  <input
                    type="number"
                    value={item[field.key] ?? ""}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
                  />
                ) : field.textarea ? (
                  <textarea
                    value={item[field.key] || ""}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    rows={2}
                    disabled={disabled}
                    placeholder={field.placeholder || ""}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-text resize-none placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
                  />
                ) : (
                  <input
                    type="text"
                    value={item[field.key] || ""}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    placeholder={field.placeholder || ""}
                    disabled={disabled}
                    className="w-full px-3 py-2 rounded-lg text-xs font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "en";
  const isRTL = currentLang === "fa" || currentLang === "ps";
  const lang = currentLang === "ps" ? "ps" : currentLang === "fa" ? "fa" : "en";

  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const getFieldValue = (multiKey, flatKey) => {
    if (safe[multiKey] && typeof safe[multiKey] === "object") {
      return safe[multiKey][currentLang] || safe[multiKey].en || safe[multiKey].fa || safe[multiKey].ps || "";
    }
    if (safe[flatKey] && typeof safe[flatKey] === "object") {
      return safe[flatKey][currentLang] || safe[flatKey].en || safe[flatKey].fa || safe[flatKey].ps || "";
    }
    return typeof safe[flatKey] === "string" ? safe[flatKey] : "";
  };

  const getArrayItemDisplayValue = (item, multiKey, flatKey) => {
    if (item[multiKey] && typeof item[multiKey] === "object") {
      return item[multiKey][currentLang] || item[multiKey].en || item[multiKey].fa || item[multiKey].ps || "";
    }
    if (item[flatKey] && typeof item[flatKey] === "object") {
      return item[flatKey][currentLang] || item[flatKey].en || item[flatKey].fa || item[flatKey].ps || "";
    }
    return typeof item[flatKey] === "string" ? item[flatKey] : "";
  };

  const normalizeArrayForForm = (arr, multiFields) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => {
      const result = { ...item };
      multiFields.forEach(({ key, multiKey }) => {
        result[key] = getArrayItemDisplayValue(item, multiKey, key);
      });
      return result;
    });
  };

  const STAT_TYPE_OPTIONS = [
    { value: "static", label: "Static" },
    { value: "dynamic", label: "Dynamic" },
  ];

  const STAT_SOURCE_OPTIONS = [
    { value: "manual", label: "Manual" },
    { value: "users", label: "Users" },
    { value: "trades", label: "Trades" },
    { value: "tradeVolume", label: "Trade Volume" },
    { value: "partners", label: "Partners" },
    { value: "products", label: "Products" },
    { value: "orders", label: "Orders" },
    { value: "revenue", label: "Revenue" },
  ];

  const [headline, setHeadline] = useState(getFieldValue("headlineMultilingual", "headline"));
  const [subHeadline, setSubHeadline] = useState(getFieldValue("subHeadlineMultilingual", "subHeadline"));
  const [description, setDescription] = useState(getFieldValue("descriptionMultilingual", "description"));
  const [missionTitle, setMissionTitle] = useState(getFieldValue("missionTitleMultilingual", "missionTitle"));
  const [missionText, setMissionText] = useState(getFieldValue("missionTextMultilingual", "missionText"));
  const [ctaText, setCtaText] = useState(getFieldValue("ctaTextMultilingual", "ctaText"));
  const [ctaButtonText, setCtaButtonText] = useState(getFieldValue("ctaButtonTextMultilingual", "ctaButtonText"));
  const [ctaButtonUrl, setCtaButtonUrl] = useState(safe.ctaButtonUrl || "");
  const [isActive, setIsActive] = useState(safe.isActive ?? true);

  const [metrics, setMetrics] = useState(
    normalizeArrayForForm(safe.metrics || [], [
      { key: "label", multiKey: "labelMultilingual" },
      { key: "value", multiKey: "valueMultilingual" },
    ])
  );
  const [features, setFeatures] = useState(
    normalizeArrayForForm(safe.features || [], [
      { key: "title", multiKey: "titleMultilingual" },
      { key: "description", multiKey: "descriptionMultilingual" },
    ])
  );
  const [whyChooseUs, setWhyChooseUs] = useState(
    normalizeArrayForForm(safe.whyChooseUs || [], [
      { key: "title", multiKey: "titleMultilingual" },
      { key: "description", multiKey: "descriptionMultilingual" },
    ])
  );
  const [stats, setStats] = useState(
    normalizeArrayForForm(safe.stats || [], [
      { key: "label", multiKey: "labelMultilingual" },
      { key: "value", multiKey: "valueMultilingual" },
    ])
  );

  const [errors, setErrors] = useState({});

  const buildMultilingual = (value) => ({ [lang]: value.trim() || null });

  const buildArrayWithMultilingual = (arr, multiFields) => {
    return arr.map((item) => {
      const result = { ...item };
      multiFields.forEach(({ key }) => {
        if (typeof result[key] === "string") {
          result[key] = { [lang]: result[key].trim() || null };
        }
      });
      return result;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!headline.trim()) errs.headline = t("about.headlineRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload = {
      headline: buildMultilingual(headline),
      isActive,
    };

    if (subHeadline.trim()) payload.subHeadline = buildMultilingual(subHeadline);
    if (description.trim()) payload.description = buildMultilingual(description);
    if (missionTitle.trim()) payload.missionTitle = buildMultilingual(missionTitle);
    if (missionText.trim()) payload.missionText = buildMultilingual(missionText);
    if (ctaText.trim()) payload.ctaText = buildMultilingual(ctaText);
    if (ctaButtonText.trim()) payload.ctaButtonText = buildMultilingual(ctaButtonText);
    if (ctaButtonUrl.trim()) payload.ctaButtonUrl = ctaButtonUrl.trim();

    if (metrics.length > 0) {
      payload.metrics = buildArrayWithMultilingual(metrics, [
        { key: "label" },
        { key: "value" },
      ]);
    }

    if (features.length > 0) {
      payload.features = buildArrayWithMultilingual(features, [
        { key: "title" },
        { key: "description" },
      ]);
    }

    if (whyChooseUs.length > 0) {
      payload.whyChooseUs = buildArrayWithMultilingual(whyChooseUs, [
        { key: "title" },
        { key: "description" },
      ]);
    }

    if (stats.length > 0) {
      payload.stats = buildArrayWithMultilingual(stats, [
        { key: "label" },
        { key: "value" },
      ]);
    }

    onSubmit(payload);
  };

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err
        ? "border-red-400"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />
          {t("about.basicInformation")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("about.headlineLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => { setHeadline(e.target.value); if (errors.headline) setErrors((p) => ({ ...p, headline: "" })); }}
              placeholder={t("about.headlinePlaceholder")}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={inputClass(errors.headline)}
            />
            {errors.headline && <p className="text-[11px] text-red-500 font-semibold">{errors.headline}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("about.subHeadlineLabel")}
            </label>
            <input
              type="text"
              value={subHeadline}
              onChange={(e) => setSubHeadline(e.target.value)}
              placeholder={t("about.subHeadlinePlaceholder")}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={inputClass()}
            />
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("about.descriptionLabel")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("about.descriptionPlaceholder")}
              rows={4}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={cn(inputClass(), "resize-none")}
            />
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] lg:col-span-2">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              disabled={isLoading}
              className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}
            >
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{t("about.activeLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{isActive ? t("about.visibleContent") : t("about.hiddenContent")}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("about.missionSection")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("about.missionTitleLabel")}</label>
            <input
              type="text"
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              placeholder={t("about.missionTitlePlaceholder")}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={inputClass()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("about.missionTextLabel")}</label>
            <textarea
              value={missionText}
              onChange={(e) => setMissionText(e.target.value)}
              placeholder={t("about.missionTextPlaceholder")}
              rows={3}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={cn(inputClass(), "resize-none")}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t("about.ctaSection")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("about.ctaTextLabel")}</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              placeholder={t("about.ctaTextPlaceholder")}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={inputClass()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("about.ctaButtonTextLabel")}</label>
            <input
              type="text"
              value={ctaButtonText}
              onChange={(e) => setCtaButtonText(e.target.value)}
              placeholder={t("about.ctaButtonTextPlaceholder")}
              disabled={isLoading}
              dir={isRTL ? "rtl" : "ltr"}
              className={inputClass()}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("about.ctaButtonUrlLabel")}</label>
            <input
              type="text"
              value={ctaButtonUrl}
              onChange={(e) => setCtaButtonUrl(e.target.value)}
              placeholder={t("about.ctaButtonUrlPlaceholder")}
              disabled={isLoading}
              className={inputClass()}
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {t("about.metricsSection")}
        </h3>
        <ArraySection
          title={t("about.metricsSection")}
          items={metrics}
          setItems={setMetrics}
          disabled={isLoading}
          fields={[
            { key: "label", label: t("about.labelField"), placeholder: "e.g. Happy Customers" },
            { key: "value", label: t("about.valueField"), placeholder: "e.g. 10,000+" },
          ]}
        />
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          {t("about.featuresSection")}
        </h3>
        <ArraySection
          title={t("about.featuresSection")}
          items={features}
          setItems={setFeatures}
          disabled={isLoading}
          fields={[
            { key: "title", label: t("about.titleField"), placeholder: "Feature title" },
            { key: "icon", label: t("about.iconField"), placeholder: "e.g. Shield, Star" },
            { key: "description", label: t("about.descField"), placeholder: "Feature description", textarea: true, fullWidth: true },
          ]}
        />
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {t("about.whyChooseUsSection")}
        </h3>
        <ArraySection
          title={t("about.whyChooseUsSection")}
          items={whyChooseUs}
          setItems={setWhyChooseUs}
          disabled={isLoading}
          fields={[
            { key: "title", label: t("about.titleField"), placeholder: "Reason title" },
            { key: "icon", label: t("about.iconField"), placeholder: "e.g. Zap, Heart" },
            { key: "description", label: t("about.descField"), placeholder: "Reason description", textarea: true, fullWidth: true },
          ]}
        />
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("about.statsSection")}
        </h3>
        <ArraySection
          title={t("about.statsSection")}
          items={stats}
          setItems={setStats}
          disabled={isLoading}
          fields={[
            { key: "label", label: t("about.labelField"), placeholder: "e.g. Products" },
            { key: "value", label: t("about.valueField"), placeholder: "e.g. 5000" },
            { key: "icon", label: t("about.iconField"), placeholder: "e.g. Package" },
            { key: "prefix", label: t("about.prefixField"), placeholder: "e.g. $" },
            { key: "suffix", label: t("about.suffixField"), placeholder: "e.g. +" },
            { key: "type", label: t("about.typeField"), select: true, options: STAT_TYPE_OPTIONS },
            { key: "source", label: t("about.sourceField"), select: true, options: STAT_SOURCE_OPTIONS },
            { key: "order", label: t("about.orderField"), type: "number" },
            { key: "isActive", label: t("about.isActiveField") },
          ]}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" />
            {t("about.cancelLabel")}
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{t("about.savingLabel")}</>
          ) : (
            <><Save className="h-4 w-4" />{safe.id || safe._id ? t("about.updateLabel") : t("about.createLabel")}</>
          )}
        </button>
      </div>
    </motion.form>
  );
}