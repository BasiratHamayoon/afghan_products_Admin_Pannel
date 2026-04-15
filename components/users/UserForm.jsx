"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, X, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

const roleOptions = [
  { value: "buyer", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "admin", label: "Admin" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

const levelOptions = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
];

const provinceOptions = [
  "Kabul", "Herat", "Kandahar", "Balkh", "Nangarhar",
  "Kunduz", "Takhar", "Badakhshan", "Baghlan", "Logar",
];

export default function UserForm({ initialData, onSubmit, onCancel, isLoading }) {
  const safe = initialData && typeof initialData === "object" ? initialData : {};

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    role: "buyer",
    status: "active",
    verified: false,
    level: "bronze",
    address: { city: "", province: "", country: "Afghanistan", street: "" },
    business: null,
    walletBalance: 0,
    ...safe,
  });

  const [errors, setErrors] = useState({});
  const [showBusiness, setShowBusiness] = useState(!!safe.business);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const setAddr = (key, value) => {
    setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  };

  const setBiz = (key, value) => {
    setForm((prev) => ({
      ...prev,
      business: { ...(prev.business || {}), [key]: value },
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = "Name is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Valid email required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const data = {
      ...form,
      business: showBusiness && form.role === "seller" ? form.business : null,
    };
    onSubmit(data);
  };

  const inputClass = (field) => cn(
    "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text",
    errors[field]
      ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]"
      : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="relative shrink-0">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt={form.name}
                  className="h-16 w-16 rounded-2xl object-cover border border-gray-100 dark:border-white/[0.08]"
                />
              ) : (
                <div
                  className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black text-white"
                  style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                >
                  {form.name ? form.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground mb-1">Profile Photo</p>
              <input
                type="text"
                value={form.avatar}
                onChange={(e) => set("avatar", e.target.value)}
                placeholder="Paste image URL..."
                className={cn(inputClass(), "text-xs py-2")}
              />
              <p className="text-[10px] text-muted-foreground font-medium mt-1">
                Enter a URL for the profile photo
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ahmad Karimi" className={inputClass("name")} />
            {errors.name && <p className="text-[11px] text-red-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Email Address *</label>
            <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" className={inputClass("email")} />
            {errors.email && <p className="text-[11px] text-red-500 font-semibold">{errors.email}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Phone Number</label>
            <input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+93 700 000 000" className={inputClass("phone")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Role</label>
              <select value={form.role} onChange={(e) => set("role", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Level</label>
            <select value={form.level} onChange={(e) => set("level", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
              {levelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.02]">
            <button
              type="button"
              onClick={() => set("verified", !form.verified)}
              className={cn("relative w-11 h-6 rounded-full transition-all cursor-pointer shrink-0", form.verified ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}
            >
              <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200", form.verified ? "translate-x-5" : "translate-x-0")} />
            </button>
            <div>
              <p className="text-sm font-bold text-foreground">Verified User</p>
              <p className="text-[11px] text-muted-foreground font-medium">Mark this user as verified</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest border-b border-gray-100 dark:border-white/[0.06] pb-2">
              Address Information
            </h3>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Street Address</label>
              <input type="text" value={form.address?.street || ""} onChange={(e) => setAddr("street", e.target.value)} placeholder="Street address" className={inputClass()} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">City</label>
                <input type="text" value={form.address?.city || ""} onChange={(e) => setAddr("city", e.target.value)} placeholder="City" className={inputClass()} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Province</label>
                <select value={form.address?.province || ""} onChange={(e) => setAddr("province", e.target.value)} className={cn(inputClass(), "cursor-pointer")}>
                  <option value="">Select province</option>
                  {provinceOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">Country</label>
              <input type="text" value={form.address?.country || "Afghanistan"} onChange={(e) => setAddr("country", e.target.value)} placeholder="Country" className={inputClass()} />
            </div>
          </div>

          {form.role === "seller" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.06] pb-2">
                <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
                  Business Information
                </h3>
                <button
                  type="button"
                  onClick={() => setShowBusiness(!showBusiness)}
                  className={cn("relative w-9 h-5 rounded-full transition-all cursor-pointer", showBusiness ? "bg-[#0F69B0]" : "bg-gray-300 dark:bg-white/20")}
                >
                  <span className={cn("absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200", showBusiness ? "translate-x-4" : "translate-x-0")} />
                </button>
              </div>

              {showBusiness && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-widest">Business Name</label>
                    <input type="text" value={form.business?.name || ""} onChange={(e) => setBiz("name", e.target.value)} placeholder="e.g. TechHub Kabul" className={inputClass()} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-widest">Business Category</label>
                    <input type="text" value={form.business?.category || ""} onChange={(e) => setBiz("category", e.target.value)} placeholder="e.g. Electronics" className={inputClass()} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-widest">Registration Number</label>
                    <input type="text" value={form.business?.registrationNumber || ""} onChange={(e) => setBiz("registrationNumber", e.target.value)} placeholder="e.g. AFG-BIZ-2024-001" className={inputClass()} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-widest">Business Description</label>
                    <textarea value={form.business?.description || ""} onChange={(e) => setBiz("description", e.target.value)} placeholder="Describe the business..." rows={3} className={cn(inputClass(), "resize-none")} />
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">Wallet Balance (AFN)</label>
            <input type="number" value={form.walletBalance} onChange={(e) => set("walletBalance", Number(e.target.value))} placeholder="0" min="0" className={inputClass("walletBalance")} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : safe.id ? "Update User" : "Create User"}
        </button>
      </div>
    </motion.form>
  );
}