"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, Plus, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function TradeShowForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation();
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const [title, setTitle] = useState(safe.title || "");
  const [description, setDescription] = useState(safe.description || "");
  const [image, setImage] = useState(safe.image || "");
  const [gallery, setGallery] = useState(Array.isArray(safe.gallery) ? safe.gallery : []);
  const [galleryInput, setGalleryInput] = useState("");
  const [country, setCountry] = useState(safe.country || "");
  const [city, setCity] = useState(safe.city || "");
  const [venue, setVenue] = useState(safe.venue || "");
  const [address, setAddress] = useState(safe.address || "");
  const [startDate, setStartDate] = useState(safe.startDate ? new Date(safe.startDate).toISOString().split("T")[0] : "");
  const [endDate, setEndDate] = useState(safe.endDate ? new Date(safe.endDate).toISOString().split("T")[0] : "");
  const [organizer, setOrganizer] = useState(safe.organizer || "");
  const [organizerEmail, setOrganizerEmail] = useState(safe.organizerEmail || "");
  const [organizerPhone, setOrganizerPhone] = useState(safe.organizerPhone || "");
  const [website, setWebsite] = useState(safe.website || "");
  const [category, setCategory] = useState(safe.category || "");
  const [tagsInput, setTagsInput] = useState(Array.isArray(safe.tags) ? safe.tags.join(", ") : "");
  const [isFeatured, setIsFeatured] = useState(safe.isFeatured ?? false);
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [errors, setErrors] = useState({});

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleAddGalleryItem = () => {
    if (!galleryInput.trim()) return;
    setGallery((prev) => [...prev, galleryInput.trim()]);
    setGalleryInput("");
  };

  const handleRemoveGalleryItem = (index) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGalleryKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleAddGalleryItem(); }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const errs = {};
    if (!title.trim()) errs.title = t("tradeShows.titleRequired");
    if (!country.trim()) errs.country = t("tradeShows.countryRequired");
    if (!city.trim()) errs.city = t("tradeShows.cityRequired");
    if (!startDate) errs.startDate = t("tradeShows.startDateRequired");
    if (!endDate) errs.endDate = t("tradeShows.endDateRequired");
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errs.endDate = t("tradeShows.endDateInvalid");
    }
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const tags = tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      image: image.trim() || null,
      gallery,
      country: country.trim(),
      city: city.trim(),
      venue: venue.trim() || null,
      address: address.trim() || null,
      startDate,
      endDate,
      organizer: organizer.trim() || null,
      organizerEmail: organizerEmail.trim() || null,
      organizerPhone: organizerPhone.trim() || null,
      website: website.trim() || null,
      category: category.trim() || null,
      tags,
      isFeatured,
      isActive,
    };

    onSubmit(payload);
  };

  const inputClass = (err) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
    err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />{t("tradeShows.basicInformation")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.titleLabel")} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); clearErr("title"); }} placeholder={t("tradeShows.titlePlaceholder")} disabled={isLoading} className={inputClass(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.categoryLabel")}</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("tradeShows.categoryPlaceholder")} disabled={isLoading} className={inputClass()} />
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.descriptionLabel")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t("tradeShows.descriptionPlaceholder")} rows={4} disabled={isLoading} className={cn(inputClass(), "resize-none")} />
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.tagsLabel")}</label>
            <input type="text" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={t("tradeShows.tagsPlaceholder")} disabled={isLoading} className={inputClass()} />
            <p className="text-[10px] text-muted-foreground font-medium">{t("tradeShows.tagsHelper")}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />{t("tradeShows.imageAndGallery")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.coverImageUrl")}</label>
            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} placeholder={t("tradeShows.coverImagePlaceholder")} disabled={isLoading} className={inputClass()} />
            {image && (
              <div className="mt-2 relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04]">
                <img src={image} alt="Cover preview" className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
                <button type="button" onClick={() => setImage("")} disabled={isLoading} className="absolute top-2 end-2 h-7 w-7 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-60">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.galleryImages")}</label>
            <div className="flex items-center gap-2">
              <input type="text" value={galleryInput} onChange={(e) => setGalleryInput(e.target.value)} onKeyDown={handleGalleryKeyDown} placeholder={t("tradeShows.galleryInputPlaceholder")} disabled={isLoading} className={cn(inputClass(), "flex-1")} />
              <button type="button" onClick={handleAddGalleryItem} disabled={isLoading || !galleryInput.trim()} className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] transition-colors cursor-pointer border border-[#0F69B0]/20 disabled:opacity-60 disabled:cursor-not-allowed shrink-0">
                <Plus className="h-3.5 w-3.5" />{t("tradeShows.add")}
              </button>
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                {gallery.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] h-28">
                    <img src={url} alt={`Gallery ${i + 1}`} className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => handleRemoveGalleryItem(i)} disabled={isLoading} className="h-8 w-8 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-60">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 start-1 end-1">
                      <p className="text-[9px] text-white bg-black/50 rounded px-1 py-0.5 truncate">{url}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {gallery.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-gray-200 dark:border-white/[0.08] rounded-xl mt-2">
                <ImageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground font-medium">{t("tradeShows.noGalleryImages")}</p>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground font-medium">
              {gallery.length} {gallery.length !== 1 ? t("tradeShows.galleryCountPlural") : t("tradeShows.galleryCount")} {t("tradeShows.inGallery")}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t("tradeShows.locationSection")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.country")} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={country} onChange={(e) => { setCountry(e.target.value); clearErr("country"); }} placeholder={t("tradeShows.countryPlaceholder")} disabled={isLoading} className={inputClass(errors.country)} />
            {errors.country && <p className="text-[11px] text-red-500 font-semibold">{errors.country}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.city")} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={city} onChange={(e) => { setCity(e.target.value); clearErr("city"); }} placeholder={t("tradeShows.cityPlaceholder")} disabled={isLoading} className={inputClass(errors.city)} />
            {errors.city && <p className="text-[11px] text-red-500 font-semibold">{errors.city}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.venue")}</label>
            <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder={t("tradeShows.venuePlaceholder")} disabled={isLoading} className={inputClass()} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.address")}</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("tradeShows.addressPlaceholder")} disabled={isLoading} className={inputClass()} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />{t("tradeShows.datesSection")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.startDate")} <span className="text-red-500">*</span>
            </label>
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); clearErr("startDate"); }} disabled={isLoading} className={inputClass(errors.startDate)} />
            {errors.startDate && <p className="text-[11px] text-red-500 font-semibold">{errors.startDate}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("tradeShows.endDate")} <span className="text-red-500">*</span>
            </label>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); clearErr("endDate"); }} disabled={isLoading} className={inputClass(errors.endDate)} />
            {errors.endDate && <p className="text-[11px] text-red-500 font-semibold">{errors.endDate}</p>}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />{t("tradeShows.organizerDetails")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("tradeShows.organizerName")}</label>
            <input type="text" value={organizer} onChange={(e) => setOrganizer(e.target.value)} placeholder={t("tradeShows.organizerNamePlaceholder")} disabled={isLoading} className={inputClass()} />
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

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t("tradeShows.settings")}
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
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />{t("tradeShows.saving")}</>
            : <><Save className="h-4 w-4" />{safe.id || safe._id ? t("tradeShows.update") : t("tradeShows.create")}</>
          }
        </button>
      </div>
    </motion.form>
  );
}