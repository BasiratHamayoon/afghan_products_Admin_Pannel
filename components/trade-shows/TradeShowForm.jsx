"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Plus, Trash2, ImageIcon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN", fullLabel: "English", dir: "ltr" },
  { code: "fa", label: "FA", fullLabel: "فارسی", dir: "rtl" },
  { code: "ps", label: "PS", fullLabel: "پښتو", dir: "rtl" },
];

export default function TradeShowForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation();
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const getMultiValue = (multiKey, flatKey) => {
    if (safe[multiKey] && typeof safe[multiKey] === "object") {
      return {
        en: safe[multiKey].en || "",
        fa: safe[multiKey].fa || "",
        ps: safe[multiKey].ps || "",
      };
    }
    if (safe[flatKey] && typeof safe[flatKey] === "object") {
      return {
        en: safe[flatKey].en || "",
        fa: safe[flatKey].fa || "",
        ps: safe[flatKey].ps || "",
      };
    }
    const flat = typeof safe[flatKey] === "string" ? safe[flatKey] : "";
    return { en: flat, fa: "", ps: "" };
  };

  const getTagsValue = () => {
    const multi = safe.tagsMultilingual;
    if (multi && typeof multi === "object") {
      const arr = multi.en || multi.fa || multi.ps || [];
      return Array.isArray(arr) ? arr.join(", ") : "";
    }
    if (Array.isArray(safe.tags)) return safe.tags.join(", ");
    return "";
  };

  const [activeLang, setActiveLang] = useState("en");
  const [title, setTitle] = useState(getMultiValue("titleMultilingual", "title"));
  const [description, setDescription] = useState(getMultiValue("descriptionMultilingual", "description"));
  const [country, setCountry] = useState(getMultiValue("countryMultilingual", "country"));
  const [city, setCity] = useState(getMultiValue("cityMultilingual", "city"));
  const [venue, setVenue] = useState(getMultiValue("venueMultilingual", "venue"));
  const [address, setAddress] = useState(getMultiValue("addressMultilingual", "address"));
  const [organizer, setOrganizer] = useState(getMultiValue("organizerMultilingual", "organizer"));
  const [category, setCategory] = useState(getMultiValue("categoryMultilingual", "category"));
  const [tagsInput, setTagsInput] = useState(getTagsValue());

  const [image, setImage] = useState(safe.image || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(safe.image || "");
  const [galleryItems, setGalleryItems] = useState(
    Array.isArray(safe.gallery)
      ? safe.gallery.map((url) => ({ preview: url, file: null, url }))
      : []
  );

  const [startDate, setStartDate] = useState(
    safe.startDate ? new Date(safe.startDate).toISOString().split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(
    safe.endDate ? new Date(safe.endDate).toISOString().split("T")[0] : ""
  );
  const [organizerEmail, setOrganizerEmail] = useState(safe.organizerEmail || "");
  const [organizerPhone, setOrganizerPhone] = useState(safe.organizerPhone || "");
  const [website, setWebsite] = useState(safe.website || "");
  const [isFeatured, setIsFeatured] = useState(safe.isFeatured ?? false);
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [errors, setErrors] = useState({});

  const coverImageRef = useRef(null);
  const galleryInputRef = useRef(null);

  const currentLangObj = LANGUAGES.find((l) => l.code === activeLang) || LANGUAGES[0];

  const hasAtLeastOneTitle = () =>
    LANGUAGES.some((l) => title[l.code]?.trim() !== "");

  const getFilledCount = (fieldObj) =>
    LANGUAGES.filter((l) => fieldObj[l.code]?.trim() !== "").length;

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImage("");
    e.target.value = "";
  };

  const handleRemoveCoverImage = () => {
    setImage("");
    setImageFile(null);
    setImagePreview("");
    if (coverImageRef.current) coverImageRef.current.value = "";
  };

  const handleGalleryFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map((file) => ({
      preview: URL.createObjectURL(file),
      file,
      url: null,
    }));
    setGalleryItems((prev) => [...prev, ...newItems]);
    e.target.value = "";
  };

  const handleRemoveGalleryItem = (index) => {
    setGalleryItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!hasAtLeastOneTitle()) errs.title = t("tradeShows.titleRequired");
    if (!LANGUAGES.some((l) => country[l.code]?.trim())) errs.country = t("tradeShows.countryRequired");
    if (!LANGUAGES.some((l) => city[l.code]?.trim())) errs.city = t("tradeShows.cityRequired");
    if (!startDate) errs.startDate = t("tradeShows.startDateRequired");
    if (!endDate) errs.endDate = t("tradeShows.endDateRequired");
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errs.endDate = t("tradeShows.endDateInvalid");
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const tags = tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);

    const formData = new FormData();

    LANGUAGES.forEach((l) => {
      if (title[l.code]?.trim()) formData.append(`title[${l.code}]`, title[l.code].trim());
      if (description[l.code]?.trim()) formData.append(`description[${l.code}]`, description[l.code].trim());
      if (country[l.code]?.trim()) formData.append(`country[${l.code}]`, country[l.code].trim());
      if (city[l.code]?.trim()) formData.append(`city[${l.code}]`, city[l.code].trim());
      if (venue[l.code]?.trim()) formData.append(`venue[${l.code}]`, venue[l.code].trim());
      if (address[l.code]?.trim()) formData.append(`address[${l.code}]`, address[l.code].trim());
      if (organizer[l.code]?.trim()) formData.append(`organizer[${l.code}]`, organizer[l.code].trim());
      if (category[l.code]?.trim()) formData.append(`category[${l.code}]`, category[l.code].trim());
    });

    if (tags.length > 0) {
      formData.append(`tags[en]`, JSON.stringify(tags));
    }

    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    formData.append("organizerEmail", organizerEmail.trim());
    formData.append("organizerPhone", organizerPhone.trim());
    formData.append("website", website.trim());
    formData.append("isFeatured", String(isFeatured));
    formData.append("isActive", String(isActive));

    if (imageFile) {
      formData.append("image", imageFile, imageFile.name);
    } else if (image && !image.startsWith("blob:")) {
      formData.append("image", image);
    }

    galleryItems.forEach((item) => {
      if (item.file) {
        formData.append("gallery", item.file, item.file.name);
      } else if (item.url && !item.url.startsWith("blob:")) {
        formData.append("existingGallery[]", item.url);
      }
    });

    onSubmit(formData);
  };

  const inputClass = (err) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      err
        ? "border-red-400"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const displayImage = imagePreview || image;

  const LangTabs = ({ hasContent }) => (
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2">
        <Globe className="h-3.5 w-3.5 text-[#0F69B0]" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {t("categories.languageContent")} · {currentLangObj.fullLabel}
        </span>
      </div>
      <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.06]">
        {LANGUAGES.map((lang) => {
          const isFilled = hasContent(lang.code);
          const isActive = activeLang === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setActiveLang(lang.code)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                isActive
                  ? "bg-white dark:bg-white/[0.12] text-[#0F69B0] shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {lang.label}
              {isFilled && (
                <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", isActive ? "bg-[#0F69B0]" : "bg-emerald-500")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Basic Information */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />
          {t("tradeShows.basicInformation")}
        </h3>

        <LangTabs hasContent={(lang) => !!title[lang]?.trim()} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.titleLabel")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input
                  type="text"
                  value={title[lang.code]}
                  onChange={(e) => { setTitle((prev) => ({ ...prev, [lang.code]: e.target.value })); clearErr("title"); }}
                  placeholder={t("tradeShows.titlePlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={inputClass(errors.title)}
                />
              </div>
            ))}
            {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.categoryLabel")}
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input
                  type="text"
                  value={category[lang.code]}
                  onChange={(e) => setCategory((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                  placeholder={t("tradeShows.categoryPlaceholder")}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={inputClass()}
                />
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.descriptionLabel")}
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <textarea
                  value={description[lang.code]}
                  onChange={(e) => setDescription((prev) => ({ ...prev, [lang.code]: e.target.value }))}
                  placeholder={t("tradeShows.descriptionPlaceholder")}
                  rows={4}
                  disabled={isLoading}
                  dir={lang.dir}
                  className={cn(inputClass(), "resize-none")}
                />
              </div>
            ))}
          </div>

          {/* Tags */}
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.tagsLabel")}</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("tradeShows.tagsPlaceholder")}
              disabled={isLoading}
              className={inputClass()}
            />
            <p className="text-[10px] text-muted-foreground font-medium">{t("tradeShows.tagsHelper")}</p>
          </div>
        </div>

        {/* Translation Status */}
        <div className="mt-4 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("categories.translationStatus")}</p>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => {
              const hasT = !!title[lang.code]?.trim();
              const hasD = !!description[lang.code]?.trim();
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setActiveLang(lang.code)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer",
                    activeLang === lang.code ? "border-[#0F69B0]/40 bg-[#0F69B0]/[0.04]" : "border-gray-200 dark:border-white/[0.06] hover:border-[#0F69B0]/20"
                  )}
                >
                  <span className={cn("text-xs font-black", activeLang === lang.code ? "text-[#0F69B0]" : "text-foreground")}>{lang.label}</span>
                  <div className="flex items-center gap-1">
                    <span className={cn("h-1.5 w-1.5 rounded-full", hasT ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")} />
                    <span className={cn("h-1.5 w-1.5 rounded-full", hasD ? "bg-blue-500" : "bg-gray-300 dark:bg-white/20")} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t("tradeShows.titleLabel")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{t("tradeShows.descriptionLabel")}</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-gray-300 dark:bg-white/20" />{t("categories.empty")}</span>
          </div>
        </div>
      </div>

      {/* Image & Gallery */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          {t("tradeShows.imageAndGallery")}
        </h3>
        <div className="grid grid-cols-1 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.coverImageUrl")}</label>
            <input ref={coverImageRef} type="file" accept="image/*" className="hidden" disabled={isLoading} onChange={handleCoverImageChange} />
            {!displayImage ? (
              <button type="button" onClick={() => coverImageRef.current?.click()} disabled={isLoading} className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                <span className="text-xs font-bold text-muted-foreground">Click to select cover image</span>
                <span className="text-[10px] text-muted-foreground/60">PNG, JPG, WEBP up to 5MB</span>
              </button>
            ) : (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04]">
                <img src={displayImage} alt="Cover preview" className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
                <div className="absolute top-2 end-2 flex items-center gap-1.5">
                  <button type="button" onClick={() => coverImageRef.current?.click()} disabled={isLoading} className="h-7 px-2.5 rounded-lg bg-black/50 flex items-center justify-center text-white text-[10px] font-bold hover:bg-black/70 transition-colors cursor-pointer disabled:opacity-60">Change</button>
                  <button type="button" onClick={handleRemoveCoverImage} disabled={isLoading} className="h-7 w-7 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-60"><X className="h-3.5 w-3.5" /></button>
                </div>
                {imageFile && <div className="absolute bottom-1 start-1"><p className="text-[9px] text-white bg-black/50 rounded px-1 py-0.5">{imageFile.name}</p></div>}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.galleryImages")}</label>
            <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" disabled={isLoading} onChange={handleGalleryFilesChange} />
            <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={isLoading} className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20 disabled:opacity-60 disabled:cursor-not-allowed">
              <Plus className="h-3.5 w-3.5" />{t("tradeShows.add") || "Add Images"}
            </button>
            {galleryItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                {galleryItems.map((item, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] h-28">
                    <img src={item.preview} alt={`Gallery ${i + 1}`} className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => handleRemoveGalleryItem(i)} disabled={isLoading} className="h-8 w-8 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <div className="absolute bottom-1 start-1 end-1"><p className="text-[9px] text-white bg-black/50 rounded px-1 py-0.5 truncate">{item.file?.name || item.url || "Image"}</p></div>
                  </div>
                ))}
                <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={isLoading} className="h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  <Plus className="h-5 w-5 text-muted-foreground/40" />
                  <span className="text-[10px] font-bold text-muted-foreground/50">Add More</span>
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={isLoading} className="w-full flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 dark:border-white/[0.08] rounded-xl mt-2 hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">{t("tradeShows.noGalleryImages")}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Click to select images</p>
              </button>
            )}
            <p className="text-[10px] text-muted-foreground font-medium">
              {galleryItems.length}{" "}{galleryItems.length !== 1 ? t("tradeShows.galleryCountPlural") : t("tradeShows.galleryCount")}{" "}{t("tradeShows.inGallery")}
            </p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {t("tradeShows.locationSection")}
        </h3>

        <LangTabs hasContent={(lang) => !!country[lang]?.trim() || !!city[lang]?.trim()} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.country")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input type="text" value={country[lang.code]} onChange={(e) => { setCountry((prev) => ({ ...prev, [lang.code]: e.target.value })); clearErr("country"); }} placeholder={t("tradeShows.countryPlaceholder")} disabled={isLoading} dir={lang.dir} className={inputClass(errors.country)} />
              </div>
            ))}
            {errors.country && <p className="text-[11px] text-red-500 font-semibold">{errors.country}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.city")} <span className="text-red-500">*</span>
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input type="text" value={city[lang.code]} onChange={(e) => { setCity((prev) => ({ ...prev, [lang.code]: e.target.value })); clearErr("city"); }} placeholder={t("tradeShows.cityPlaceholder")} disabled={isLoading} dir={lang.dir} className={inputClass(errors.city)} />
              </div>
            ))}
            {errors.city && <p className="text-[11px] text-red-500 font-semibold">{errors.city}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.venue")}
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input type="text" value={venue[lang.code]} onChange={(e) => setVenue((prev) => ({ ...prev, [lang.code]: e.target.value }))} placeholder={t("tradeShows.venuePlaceholder")} disabled={isLoading} dir={lang.dir} className={inputClass()} />
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.address")}
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input type="text" value={address[lang.code]} onChange={(e) => setAddress((prev) => ({ ...prev, [lang.code]: e.target.value }))} placeholder={t("tradeShows.addressPlaceholder")} disabled={isLoading} dir={lang.dir} className={inputClass()} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dates */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          {t("tradeShows.datesSection")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.startDate")} <span className="text-red-500">*</span></label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); clearErr("startDate"); }} disabled={isLoading} className={inputClass(errors.startDate)} />
            {errors.startDate && <p className="text-[11px] text-red-500 font-semibold">{errors.startDate}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.endDate")} <span className="text-red-500">*</span></label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); clearErr("endDate"); }} disabled={isLoading} className={inputClass(errors.endDate)} />
            {errors.endDate && <p className="text-[11px] text-red-500 font-semibold">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      {/* Organizer Details */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
          {t("tradeShows.organizerDetails")}
        </h3>

        <LangTabs hasContent={(lang) => !!organizer[lang]?.trim()} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.organizerName")}
              <span className="ml-1.5 text-[10px] font-medium text-muted-foreground normal-case tracking-normal">({currentLangObj.fullLabel})</span>
            </label>
            {LANGUAGES.map((lang) => (
              <div key={lang.code} className={cn(activeLang === lang.code ? "block" : "hidden")}>
                <input type="text" value={organizer[lang.code]} onChange={(e) => setOrganizer((prev) => ({ ...prev, [lang.code]: e.target.value }))} placeholder={t("tradeShows.organizerNamePlaceholder")} disabled={isLoading} dir={lang.dir} className={inputClass()} />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.organizerEmail")}</label>
            <input type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} placeholder={t("tradeShows.organizerEmailPlaceholder")} disabled={isLoading} className={inputClass()} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.organizerPhone")}</label>
            <input type="text" value={organizerPhone} onChange={(e) => setOrganizerPhone(e.target.value)} placeholder={t("tradeShows.organizerPhonePlaceholder")} disabled={isLoading} className={inputClass()} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.website")}</label>
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder={t("tradeShows.websitePlaceholder")} disabled={isLoading} className={inputClass()} />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          {t("tradeShows.settings")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button type="button" onClick={() => setIsActive(!isActive)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}>
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{t("tradeShows.activeLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{isActive ? t("tradeShows.activeVisible") : t("tradeShows.activeHidden")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button type="button" onClick={() => setIsFeatured(!isFeatured)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isFeatured ? "bg-amber-500" : "bg-gray-300 dark:bg-white/20")}>
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isFeatured ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{t("tradeShows.featuredSetting")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{isFeatured ? t("tradeShows.featuredHighlighted") : t("tradeShows.featuredNormal")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
            <X className="h-4 w-4" />{t("tradeShows.cancel")}
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />{t("tradeShows.saving")}</>
          ) : (
            <><Save className="h-4 w-4" />{safe.id || safe._id ? t("tradeShows.update") : t("tradeShows.create")}</>
          )}
        </button>
      </div>
    </motion.form>
  );
}