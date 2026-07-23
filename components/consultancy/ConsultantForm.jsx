"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Save, X, Loader2, ImageIcon, Upload, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/fileUrl";
import { useTranslation } from "react-i18next";

export default function ConsultantForm({ initialData, onSubmit, onCancel, isLoading }) {
  const { t } = useTranslation();
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const SPECIALIZATIONS = [
    { value: "business", label: t("consultancy.specBusiness") },
    { value: "legal", label: t("consultancy.specLegal") },
    { value: "finance", label: t("consultancy.specFinance") },
    { value: "marketing", label: t("consultancy.specMarketing") },
    { value: "technology", label: t("consultancy.specTechnology") },
    { value: "trade", label: t("consultancy.specTrade") },
    { value: "agriculture", label: t("consultancy.specAgriculture") },
    { value: "manufacturing", label: t("consultancy.specManufacturing") },
    { value: "other", label: t("consultancy.specOther") },
  ];

  const DAYS = [
    { key: "mon", label: t("consultancy.mon") },
    { key: "tue", label: t("consultancy.tue") },
    { key: "wed", label: t("consultancy.wed") },
    { key: "thu", label: t("consultancy.thu") },
    { key: "fri", label: t("consultancy.fri") },
    { key: "sat", label: t("consultancy.sat") },
    { key: "sun", label: t("consultancy.sun") },
  ];

  const [name, setName] = useState(safe.name || "");
  const [title, setTitle] = useState(safe.title || "");
  const [specialization, setSpecialization] = useState(safe.specialization || "");
  const [description, setDescription] = useState(safe.description || "");
  const [hourlyRateMin, setHourlyRateMin] = useState(safe.hourlyRateMin ?? "");
  const [hourlyRateMax, setHourlyRateMax] = useState(safe.hourlyRateMax ?? "");
  const [languagesInput, setLanguagesInput] = useState(Array.isArray(safe.languages) ? safe.languages.join(", ") : "");
  const [isActive, setIsActive] = useState(safe.isActive ?? true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(safe.profileImage ? getFileUrl(safe.profileImage) : null);
  const [availability, setAvailability] = useState(Array.isArray(safe.availability) ? safe.availability : []);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSlot = (dayKey) => {
    setAvailability((prev) => {
      const existing = prev.find((a) => a.day === dayKey);
      if (existing) {
        return prev.map((a) => a.day === dayKey ? { ...a, slots: [...a.slots, { start: "09:00", end: "17:00" }] } : a);
      }
      return [...prev, { day: dayKey, slots: [{ start: "09:00", end: "17:00" }] }];
    });
  };

  const removeSlot = (dayKey, slotIdx) => {
    setAvailability((prev) =>
      prev.map((a) => a.day === dayKey ? { ...a, slots: a.slots.filter((_, i) => i !== slotIdx) } : a).filter((a) => a.slots.length > 0)
    );
  };

  const updateSlot = (dayKey, slotIdx, field, value) => {
    setAvailability((prev) =>
      prev.map((a) => a.day === dayKey ? { ...a, slots: a.slots.map((s, i) => i === slotIdx ? { ...s, [field]: value } : s) } : a)
    );
  };

  const clearErr = (key) => {
    if (errors[key]) setErrors((p) => ({ ...p, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const errs = {};
    if (!name.trim()) errs.name = t("consultancy.nameRequired");
    if (!title.trim()) errs.title = t("consultancy.titleRequired");
    if (!specialization) errs.specialization = t("consultancy.specializationRequired");
    if (!hourlyRateMin && hourlyRateMin !== 0) errs.hourlyRateMin = t("consultancy.minRateRequired");
    if (!hourlyRateMax && hourlyRateMax !== 0) errs.hourlyRateMax = t("consultancy.maxRateRequired");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("title", title.trim());
    formData.append("specialization", specialization);
    formData.append("description", description.trim());
    formData.append("hourlyRateMin", String(hourlyRateMin));
    formData.append("hourlyRateMax", String(hourlyRateMax));
    formData.append("isActive", String(isActive));

    const langs = languagesInput.split(",").map((l) => l.trim()).filter(Boolean);
    langs.forEach((l) => formData.append("languages", l));
    formData.append("availability", JSON.stringify(availability));
    if (imageFile) formData.append("profileImage", imageFile);

    onSubmit(formData);
  };

  const inputClass = (err) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
    err ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F69B0]" />{t("consultancy.basicInformation")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("consultancy.fullName")} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={name} onChange={(e) => { setName(e.target.value); clearErr("name"); }} placeholder={t("consultancy.fullNamePlaceholder")} disabled={isLoading} className={inputClass(errors.name)} />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("consultancy.professionalTitle")} <span className="text-red-500">*</span>
            </label>
            <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); clearErr("title"); }} placeholder={t("consultancy.professionalTitlePlaceholder")} disabled={isLoading} className={inputClass(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("consultancy.specializationLabel")} <span className="text-red-500">*</span>
            </label>
            <select value={specialization} onChange={(e) => { setSpecialization(e.target.value); clearErr("specialization"); }} disabled={isLoading} className={cn("w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground cursor-pointer disabled:opacity-60", errors.specialization ? "border-red-400" : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40")}>
              <option value="">{t("consultancy.selectSpecialization")}</option>
              {SPECIALIZATIONS.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
            {errors.specialization && <p className="text-[11px] text-red-500 font-semibold">{errors.specialization}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("consultancy.languagesLabel")}</label>
            <input type="text" value={languagesInput} onChange={(e) => setLanguagesInput(e.target.value)} placeholder={t("consultancy.languagesPlaceholder")} disabled={isLoading} className={inputClass()} />
          </div>

          <div className="space-y-1.5 lg:col-span-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("consultancy.descriptionLabel")}</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={t("consultancy.descriptionPlaceholder")} disabled={isLoading} className={cn(inputClass(), "resize-none")} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t("consultancy.ratesAndSettings")}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("consultancy.minHourlyRate")} <span className="text-red-500">*</span>
            </label>
            <input type="number" value={hourlyRateMin} onChange={(e) => { setHourlyRateMin(e.target.value); clearErr("hourlyRateMin"); }} min={0} placeholder={t("consultancy.minRatePlaceholder")} disabled={isLoading} className={inputClass(errors.hourlyRateMin)} />
            {errors.hourlyRateMin && <p className="text-[11px] text-red-500 font-semibold">{errors.hourlyRateMin}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">
              {t("consultancy.maxHourlyRate")} <span className="text-red-500">*</span>
            </label>
            <input type="number" value={hourlyRateMax} onChange={(e) => { setHourlyRateMax(e.target.value); clearErr("hourlyRateMax"); }} min={0} placeholder={t("consultancy.maxRatePlaceholder")} disabled={isLoading} className={inputClass(errors.hourlyRateMax)} />
            {errors.hourlyRateMax && <p className="text-[11px] text-red-500 font-semibold">{errors.hourlyRateMax}</p>}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02] lg:col-span-2">
            <button type="button" onClick={() => setIsActive(!isActive)} disabled={isLoading} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 disabled:opacity-60", isActive ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20")}>
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", isActive ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">{t("consultancy.activeLabel")}</p>
              <p className="text-[11px] text-muted-foreground font-medium">{isActive ? t("consultancy.visibleToUsers") : t("consultancy.hidden")}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />{t("consultancy.profileImage")}
        </h3>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="consultant-image-upload" />
        {imagePreview ? (
          <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/[0.08] group">
            <img src={imagePreview} alt="Preview" className="object-cover w-full h-full" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="h-8 w-8 rounded-lg bg-white/90 flex items-center justify-center cursor-pointer">
                <Upload className="h-4 w-4 text-gray-700" />
              </button>
              <button type="button" onClick={handleRemoveImage} disabled={isLoading} className="h-8 w-8 rounded-lg bg-red-500/90 flex items-center justify-center cursor-pointer">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="consultant-image-upload" className="flex flex-col items-center justify-center w-48 h-32 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/40 hover:bg-[#0F69B0]/[0.02] transition-all cursor-pointer">
            <ImageIcon className="h-6 w-6 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-bold text-muted-foreground">{t("consultancy.uploadPhoto")}</p>
          </label>
        )}
      </div>

      <div>
        <h3 className="text-xs font-black text-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{t("consultancy.availabilityLabel")}
        </h3>
        <div className="space-y-3">
          {DAYS.map((day) => {
            const dayAvail = availability.find((a) => a.day === day.key);
            return (
              <div key={day.key} className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black text-foreground uppercase tracking-widest">{day.label}</span>
                  <button type="button" onClick={() => addSlot(day.key)} disabled={isLoading} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#0F69B0] hover:bg-[#0F69B0]/[0.08] cursor-pointer border border-[#0F69B0]/20 disabled:opacity-60">
                    <Plus className="h-3 w-3" />{t("consultancy.addSlot")}
                  </button>
                </div>
                {dayAvail?.slots?.length ? (
                  <div className="space-y-2">
                    {dayAvail.slots.map((slot, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <input type="time" value={slot.start} onChange={(e) => updateSlot(day.key, si, "start", e.target.value)} disabled={isLoading} className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-pointer focus:outline-none focus:border-[#0F69B0]/40 disabled:opacity-60" />
                        <span className="text-xs text-muted-foreground">{t("consultancy.to")}</span>
                        <input type="time" value={slot.end} onChange={(e) => updateSlot(day.key, si, "end", e.target.value)} disabled={isLoading} className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground cursor-pointer focus:outline-none focus:border-[#0F69B0]/40 disabled:opacity-60" />
                        <button type="button" onClick={() => removeSlot(day.key, si)} disabled={isLoading} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 cursor-pointer disabled:opacity-60">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground font-medium">{t("consultancy.noSlotsAdded")}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer disabled:opacity-60">
            <X className="h-4 w-4" />{t("consultancy.cancel")}
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          {isLoading
            ? <><Loader2 className="h-4 w-4 animate-spin" />{t("consultancy.saving")}</>
            : <><Save className="h-4 w-4" />{safe.id || safe._id ? t("consultancy.update") : t("consultancy.create")}</>
          }
        </button>
      </div>
    </motion.form>
  );
}