// components/consulting/ConsultantForm.jsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, RefreshCw, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/helpers";
import FileUpload from "@/components/common/FileUpload";
import { consultingCategoryOptions, availabilityOptions, sessionFormatOptions } from "@/data/dummyConsulting";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const languageOptions = ["Dari", "Pashto", "English", "Arabic", "Urdu", "Russian", "German", "French"];

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "AFN", label: "AFN (؋)" },
  { value: "EUR", label: "EUR (€)" },
];

export default function ConsultantForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safeInitial = initialData && typeof initialData === "object" ? initialData : {};

  const [form, setForm] = useState({
    name: "",
    slug: "",
    email: "",
    phone: "",
    avatar: "",
    title: "",
    bio: "",
    specializations: [],
    languages: [],
    location: "",
    timezone: "Asia/Kabul",
    status: "active",
    featured: false,
    verified: false,
    hourlyRate: 100,
    currency: "USD",
    availability: "available",
    experience: 1,
    education: "",
    certifications: [],
    categories: [],
    responseTime: "Within 24 hours",
    ...safeInitial,
  });

  const [errors, setErrors] = useState({});
  const [autoSlug, setAutoSlug] = useState(!safeInitial.slug);
  const [specInput, setSpecInput] = useState("");
  const [certInput, setCertInput] = useState("");

  useEffect(() => {
    if (autoSlug && form.name) {
      setForm((prev) => ({ ...prev, slug: generateSlug(form.name) }));
    }
  }, [form.name, autoSlug]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleArrayToggle = (key, value) => {
    const arr = form[key] || [];
    handleChange(key, arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const handleAddSpec = () => {
    const s = specInput.trim();
    if (s && !(form.specializations || []).includes(s)) {
      handleChange("specializations", [...(form.specializations || []), s]);
    }
    setSpecInput("");
  };

  const handleRemoveSpec = (s) => {
    handleChange("specializations", (form.specializations || []).filter((v) => v !== s));
  };

  const handleAddCert = () => {
    const c = certInput.trim();
    if (c && !(form.certifications || []).includes(c)) {
      handleChange("certifications", [...(form.certifications || []), c]);
    }
    setCertInput("");
  };

  const handleRemoveCert = (c) => {
    handleChange("certifications", (form.certifications || []).filter((v) => v !== c));
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Name is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    if (!form.title?.trim()) errs.title = "Title is required";
    if (!form.bio?.trim()) errs.bio = "Bio is required";
    if (!form.location?.trim()) errs.location = "Location is required";
    if (form.hourlyRate <= 0) errs.hourlyRate = "Hourly rate must be greater than 0";
    if (form.experience < 0) errs.experience = "Experience cannot be negative";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  const inputClass = (hasError) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
    hasError
      ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
      : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40";

  return (
    <motion.form initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="e.g. Dr. Ahmad Rahimi" className={inputClass(errors.name)} />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Slug</label>
            <div className="relative">
              <input type="text" value={form.slug} onChange={(e) => { setAutoSlug(false); handleChange("slug", e.target.value); }} placeholder="auto-generated-slug" className={cn(inputClass(false), "pr-10")} />
              <button type="button" onClick={() => { setAutoSlug(true); handleChange("slug", generateSlug(form.name)); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F69B0] cursor-pointer transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Professional Title <span className="text-red-500">*</span></label>
            <input type="text" value={form.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="e.g. Senior Business Consultant" className={inputClass(errors.title)} />
            {errors.title && <p className="text-[11px] text-red-500 font-semibold">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="email@example.com" className={inputClass(errors.email)} />
              {errors.email && <p className="text-[11px] text-red-500 font-semibold">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Phone</label>
              <input type="text" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+93 700 123 456" className={inputClass(false)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Bio <span className="text-red-500">*</span></label>
            <textarea value={form.bio} onChange={(e) => handleChange("bio", e.target.value)} placeholder="Brief professional biography..." rows={4} className={cn(inputClass(errors.bio), "resize-none")} />
            {errors.bio && <p className="text-[11px] text-red-500 font-semibold">{errors.bio}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Location <span className="text-red-500">*</span></label>
              <input type="text" value={form.location} onChange={(e) => handleChange("location", e.target.value)} placeholder="e.g. Kabul, Afghanistan" className={inputClass(errors.location)} />
              {errors.location && <p className="text-[11px] text-red-500 font-semibold">{errors.location}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Experience (years)</label>
              <input type="number" value={form.experience} onChange={(e) => handleChange("experience", Number(e.target.value))} min={0} className={inputClass(errors.experience)} />
              {errors.experience && <p className="text-[11px] text-red-500 font-semibold">{errors.experience}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Education</label>
            <input type="text" value={form.education} onChange={(e) => handleChange("education", e.target.value)} placeholder="e.g. MBA, American University of Afghanistan" className={inputClass(false)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Response Time</label>
            <input type="text" value={form.responseTime} onChange={(e) => handleChange("responseTime", e.target.value)} placeholder="e.g. Within 2 hours" className={inputClass(false)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Specializations</label>
            <div className="flex items-center gap-2">
              <input type="text" value={specInput} onChange={(e) => setSpecInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSpec(); } }} placeholder="Add specialization and press Enter" className={cn(inputClass(false), "flex-1")} />
              <button type="button" onClick={handleAddSpec} className="px-4 py-3 rounded-xl text-xs font-bold text-white cursor-pointer shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                Add
              </button>
            </div>
            {(form.specializations || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.specializations.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]">
                    {s}
                    <button type="button" onClick={() => handleRemoveSpec(s)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Certifications</label>
            <div className="flex items-center gap-2">
              <input type="text" value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCert(); } }} placeholder="Add certification and press Enter" className={cn(inputClass(false), "flex-1")} />
              <button type="button" onClick={handleAddCert} className="px-4 py-3 rounded-xl text-xs font-bold text-white cursor-pointer shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                Add
              </button>
            </div>
            {(form.certifications || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.certifications.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-green-500/10 text-green-600 dark:text-green-400">
                    {c}
                    <button type="button" onClick={() => handleRemoveCert(c)} className="hover:text-red-500 cursor-pointer"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Profile Photo</label>
            <FileUpload value={form.avatar} onChange={(val) => handleChange("avatar", val)} label="Upload profile photo" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Hourly Rate <span className="text-red-500">*</span></label>
              <input type="number" value={form.hourlyRate} onChange={(e) => handleChange("hourlyRate", Number(e.target.value))} min={0} className={inputClass(errors.hourlyRate)} />
              {errors.hourlyRate && <p className="text-[11px] text-red-500 font-semibold">{errors.hourlyRate}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Currency</label>
              <select value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} className={selectClass}>
                {currencyOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
              <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className={selectClass}>
                {statusOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Availability</label>
              <select value={form.availability} onChange={(e) => handleChange("availability", e.target.value)} className={selectClass}>
                {availabilityOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Languages</label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <button key={lang} type="button" onClick={() => handleArrayToggle("languages", lang)}
                  className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                    (form.languages || []).includes(lang)
                      ? "border-[#0F69B0] bg-[#0F69B0]/10 text-[#0F69B0]"
                      : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/40"
                  )}>
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Categories</label>
            <div className="flex flex-wrap gap-2">
              {consultingCategoryOptions.map((cat) => (
                <button key={cat.value} type="button" onClick={() => handleArrayToggle("categories", cat.label)}
                  className={cn("px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5",
                    (form.categories || []).includes(cat.label)
                      ? "border-[#0F69B0] bg-[#0F69B0]/10 text-[#0F69B0]"
                      : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/40"
                  )}>
                  <span>{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
              <button type="button" onClick={() => handleChange("featured", !form.featured)}
                className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0", form.featured ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}>
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", form.featured ? "translate-x-5" : "translate-x-0")} />
              </button>
              <div>
                <p className="text-sm font-bold text-foreground">Featured Consultant</p>
                <p className="text-[11px] text-muted-foreground font-medium">Show on homepage and recommended sections</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
              <button type="button" onClick={() => handleChange("verified", !form.verified)}
                className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0", form.verified ? "bg-green-500" : "bg-gray-300 dark:bg-white/20")}>
                <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", form.verified ? "translate-x-5" : "translate-x-0")} />
              </button>
              <div>
                <p className="text-sm font-bold text-foreground">Verified Consultant</p>
                <p className="text-[11px] text-muted-foreground font-medium">Mark as verified and trusted professional</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <X className="h-4 w-4" />Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : safeInitial.id ? "Update Consultant" : "Add Consultant"}
        </button>
      </div>
    </motion.form>
  );
}