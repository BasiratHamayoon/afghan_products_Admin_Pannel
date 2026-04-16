"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Mail, Phone, Globe, Bell, Shield, Key, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/common/FileUpload";
import { formatDateTime } from "@/lib/helpers";
import toast from "react-hot-toast";

export default function ProfileSettings({ profile, onSave, isSaving }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    timezone: "Asia/Kabul",
    language: "en",
    avatar: null,
    twoFactorEnabled: false,
    emailNotifications: true,
    pushNotifications: true,
    loginAlerts: true,
    ...profile,
  });
  const [activeSection, setActiveSection] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  useEffect(() => {
    if (profile) setForm((p) => ({ ...p, ...profile }));
  }, [profile]);

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] cursor-text";
  const selectClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] text-foreground cursor-pointer focus:border-[#0F69B0]/40";

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

  const sections = [
    { id: "profile", label: "Profile Info", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handlePasswordChange = () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill all password fields");
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswordForm({ current: "", new: "", confirm: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
      <div className="space-y-1">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className={cn("w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer text-left", activeSection === s.id ? "bg-[#0F69B0] text-white shadow-md shadow-[#0F69B0]/25" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground")}>
              <Icon className="h-4 w-4 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-3 space-y-5">
        {activeSection === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="h-16 w-16 rounded-2xl bg-[#0F69B0]/10 flex items-center justify-center text-2xl shrink-0">
                {form.avatar ? <img src={form.avatar} alt={form.name} className="h-full w-full object-cover rounded-2xl" /> : <User className="h-7 w-7 text-[#0F69B0]" />}
              </div>
              <div>
                <p className="text-base font-black text-foreground">{form.name || "Admin User"}</p>
                <p className="text-xs text-muted-foreground font-medium">{form.role}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-1">Last login: {formatDateTime(profile?.lastLogin)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your full name" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Email Address</label>
                <input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="admin@example.com" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+93 ..." className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Timezone</label>
                <select value={form.timezone} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))} className={selectClass}>
                  {["Asia/Kabul", "UTC", "America/New_York", "Europe/London"].map((tz) => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Brief bio about yourself..." className={cn(inputClass, "resize-none")} />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Profile Photo</label>
                <FileUpload value={form.avatar} onChange={(v) => setForm((p) => ({ ...p, avatar: v }))} label="Upload profile photo" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/[0.06]">
              <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </motion.div>
        )}

        {activeSection === "security" && (
          <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <div className="p-5 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] space-y-4">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2"><Key className="h-4 w-4 text-[#0F69B0]" />Change Password</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">Current Password</label>
                  <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))} placeholder="Enter current password" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">New Password</label>
                  <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))} placeholder="Enter new password (min 8 chars)" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-widest">Confirm New Password</label>
                  <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))} placeholder="Confirm new password" className={inputClass} />
                </div>
                <button onClick={handlePasswordChange} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                  <Key className="h-4 w-4" />Change Password
                </button>
              </div>
            </div>

            <ToggleSwitch value={form.twoFactorEnabled} onChange={(v) => { setForm((p) => ({ ...p, twoFactorEnabled: v })); toast.success(`2FA ${v ? "enabled" : "disabled"}`); }} label="Two-Factor Authentication" description="Add an extra layer of security with 2FA verification" />
            <ToggleSwitch value={form.loginAlerts} onChange={(v) => setForm((p) => ({ ...p, loginAlerts: v }))} label="Login Alerts" description="Receive email alerts for new login sessions" />
          </motion.div>
        )}

        {activeSection === "notifications" && (
          <motion.div key="notifications" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
            <ToggleSwitch value={form.emailNotifications} onChange={(v) => setForm((p) => ({ ...p, emailNotifications: v }))} label="Email Notifications" description="Receive important updates via email" />
            <ToggleSwitch value={form.pushNotifications} onChange={(v) => setForm((p) => ({ ...p, pushNotifications: v }))} label="Push Notifications" description="Receive browser push notifications" />
            <ToggleSwitch value={form.loginAlerts} onChange={(v) => setForm((p) => ({ ...p, loginAlerts: v }))} label="Login Alerts" description="Get notified of new login activity" />

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-white/[0.06]">
              <button onClick={() => onSave(form)} disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}