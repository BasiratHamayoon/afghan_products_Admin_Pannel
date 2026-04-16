"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Mail, Phone, MapPin, Clock, DollarSign, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/common/FileUpload";

const timezoneOptions = ["Asia/Kabul", "UTC", "America/New_York", "Europe/London", "Asia/Dubai"];
const currencyOptions = ["USD", "AFN", "EUR", "GBP"];
const languageOptions = [{ value: "en", label: "English" }, { value: "fa", label: "Dari" }, { value: "ps", label: "Pashto" }];
const dateFormatOptions = ["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];

export default function GeneralSettings({ settings, onSave, isSaving }) {
  const [form, setForm] = useState({
    siteName: "",
    siteTagline: "",
    siteUrl: "",
    adminEmail: "",
    supportEmail: "",
    phone: "",
    address: "",
    timezone: "Asia/Kabul",
    currency: "USD",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    logoUrl: "",
    maintenanceMode: false,
    registrationEnabled: true,
    emailVerificationRequired: true,
    maxUploadSize: 10,
    socialLinks: { facebook: "", twitter: "", linkedin: "", instagram: "" },
    ...settings,
  });

  useEffect(() => {
    if (settings) setForm((p) => ({ ...p, ...settings }));
  }, [settings]);

  const handleChange = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const handleSocialChange = (key, value) => setForm((p) => ({ ...p, socialLinks: { ...p.socialLinks, [key]: value } }));

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] cursor-text";
  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40";
  const labelClass = "text-xs font-bold text-foreground uppercase tracking-widest";

  const ToggleSwitch = ({ value, onChange, label, description }) => (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
      <button type="button" onClick={() => onChange(!value)} className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0", value ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}>
        <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", value ? "translate-x-5" : "translate-x-0")} />
      </button>
      <div>
        <p className="text-sm font-bold text-foreground">{label}</p>
        {description && <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{description}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-2">
          <Globe className="h-4 w-4 text-[#0F69B0]" /> Site Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className={labelClass}>Site Name</label>
            <input type="text" value={form.siteName} onChange={(e) => handleChange("siteName", e.target.value)} placeholder="Afghan Products" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Site Tagline</label>
            <input type="text" value={form.siteTagline} onChange={(e) => handleChange("siteTagline", e.target.value)} placeholder="Afghanistan's Premier Marketplace" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Site URL</label>
            <input type="url" value={form.siteUrl} onChange={(e) => handleChange("siteUrl", e.target.value)} placeholder="https://afghanproducts.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Max Upload Size (MB)</label>
            <input type="number" value={form.maxUploadSize} onChange={(e) => handleChange("maxUploadSize", Number(e.target.value))} min={1} max={100} className={inputClass} />
          </div>
          <div className="lg:col-span-2 space-y-1.5">
            <label className={labelClass}>Site Logo</label>
            <FileUpload value={form.logoUrl} onChange={(v) => handleChange("logoUrl", v)} label="Upload site logo" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-2">
          <Mail className="h-4 w-4 text-[#0F69B0]" /> Contact Information
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className={labelClass}>Admin Email</label>
            <input type="email" value={form.adminEmail} onChange={(e) => handleChange("adminEmail", e.target.value)} placeholder="admin@example.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Support Email</label>
            <input type="email" value={form.supportEmail} onChange={(e) => handleChange("supportEmail", e.target.value)} placeholder="support@example.com" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Phone</label>
            <input type="text" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+93 20 123 4567" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Address</label>
            <input type="text" value={form.address} onChange={(e) => handleChange("address", e.target.value)} placeholder="Kabul, Afghanistan" className={inputClass} />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06] flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#0F69B0]" /> Localization
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className={labelClass}>Timezone</label>
            <select value={form.timezone} onChange={(e) => handleChange("timezone", e.target.value)} className={selectClass}>
              {timezoneOptions.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Currency</label>
            <select value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} className={selectClass}>
              {currencyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Language</label>
            <select value={form.language} onChange={(e) => handleChange("language", e.target.value)} className={selectClass}>
              {languageOptions.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Date Format</label>
            <select value={form.dateFormat} onChange={(e) => handleChange("dateFormat", e.target.value)} className={selectClass}>
              {dateFormatOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">Platform Settings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <ToggleSwitch value={form.maintenanceMode} onChange={(v) => handleChange("maintenanceMode", v)} label="Maintenance Mode" description="Disable platform access for all users except admins" />
          <ToggleSwitch value={form.registrationEnabled} onChange={(v) => handleChange("registrationEnabled", v)} label="User Registration" description="Allow new users to register on the platform" />
          <ToggleSwitch value={form.emailVerificationRequired} onChange={(v) => handleChange("emailVerificationRequired", v)} label="Email Verification" description="Require email verification for new accounts" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-black text-foreground mb-4 pb-3 border-b border-gray-100 dark:border-white/[0.06]">Social Media Links</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {["facebook", "twitter", "linkedin", "instagram"].map((platform) => (
            <div key={platform} className="space-y-1.5">
              <label className={labelClass}>{platform.charAt(0).toUpperCase() + platform.slice(1)}</label>
              <input type="url" value={form.socialLinks?.[platform] || ""} onChange={(e) => handleSocialChange(platform, e.target.value)} placeholder={`https://${platform}.com/...`} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}