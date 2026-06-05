"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, User, Mail } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { fetchAdminProfile, updateAdminProfile } from "@/store/actions/settingsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { adminProfile, isProfileLoading } = useSelector((s) => s.settings);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      dispatch(fetchAdminProfile());
    }
  }, [dispatch]);

  useEffect(() => {
    if (adminProfile) {
      setFirstName(adminProfile.firstName || "");
      setLastName(adminProfile.lastName || "");
      setEmail(adminProfile.email || "");
    }
  }, [adminProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!email.trim()) errs.email = "Email is required";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Valid email is required";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      const res = await dispatch(updateAdminProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }));
      if (res?.success) {
        toast.success("Profile updated successfully");
      } else {
        toast.error(res?.message || "Failed to update profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass = (field) =>
    cn(
      "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Profile Settings" description="Update your admin profile information">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />Back
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(15,105,176,0.1)" }}>
            <User className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">Profile Information</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Update your personal details</p>
          </div>
        </div>

        {isProfileLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#0F69B0]" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors((p) => ({ ...p, firstName: "" })); }}
                  placeholder="Enter first name"
                  disabled={isSaving}
                  className={fieldClass("firstName")}
                />
                {errors.firstName && <p className="text-[11px] text-red-500 font-semibold">{errors.firstName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-widest">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  disabled={isSaving}
                  className={fieldClass("lastName")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-widest">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: "" })); }}
                  placeholder="Enter email address"
                  disabled={isSaving}
                  className={cn(fieldClass("email"), "pl-11")}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-semibold">{errors.email}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
              <button
                type="button"
                onClick={() => router.push("/settings")}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
              >
                {isSaving ? (<><Loader2 className="h-4 w-4 animate-spin" />Saving...</>) : (<><Save className="h-4 w-4" />Save Changes</>)}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}