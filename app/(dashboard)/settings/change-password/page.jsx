"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { changeAdminPassword } from "@/store/actions/settingsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function ChangePasswordPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const fieldClass = (field) =>
    cn(
      "w-full px-4 py-3 pe-12 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text disabled:opacity-60",
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!currentPassword) errs.currentPassword = t("settings.currentPasswordRequired");
    if (!newPassword) errs.newPassword = t("settings.newPasswordRequired");
    if (newPassword && newPassword.length < 8) errs.newPassword = t("settings.passwordMinLength");
    if (!confirmPassword) errs.confirmPassword = t("settings.confirmPasswordRequired");
    if (newPassword && confirmPassword && newPassword !== confirmPassword) errs.confirmPassword = t("settings.passwordsDoNotMatch");
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setIsSaving(true);
    try {
      const res = await dispatch(changeAdminPassword({
        currentPassword,
        newPassword,
      }));
      if (res?.success) {
        toast.success(t("settings.passwordChanged"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({});
      } else {
        toast.error(res?.message || t("settings.passwordChangeFailed"));
      }
    } catch {
      toast.error(t("settings.somethingWentWrong"));
    } finally {
      setIsSaving(false);
    }
  };

  const PasswordField = ({ label, value, onChange, show, onToggle, field, placeholder, required }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-foreground uppercase tracking-widest">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => { onChange(e.target.value); if (errors[field]) setErrors((p) => ({ ...p, [field]: "" })); }}
          placeholder={placeholder}
          disabled={isSaving}
          className={fieldClass(field)}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-pointer"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {errors[field] && <p className="text-[11px] text-red-500 font-semibold">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("settings.changePassword")} description={t("settings.changePasswordDesc")}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 rtl-mirror" />
          {t("common.back")}
        </motion.button>
      </PageHeader>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] p-6"
      >
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-black text-foreground">{t("settings.changePassword")}</h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">{t("settings.keepAccountSecure")}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <PasswordField
            label={t("settings.currentPassword")}
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
            field="currentPassword"
            placeholder={t("settings.enterCurrentPassword")}
            required
          />

          <PasswordField
            label={t("settings.newPassword")}
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
            field="newPassword"
            placeholder={t("settings.enterNewPassword")}
            required
          />

          <PasswordField
            label={t("settings.confirmNewPassword")}
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            field="confirmPassword"
            placeholder={t("settings.confirmNewPasswordPlaceholder")}
            required
          />

          <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20">
            <p className="text-[11px] font-semibold text-amber-600">
              {t("settings.passwordChangeWarning")}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => router.push("/settings")}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer disabled:opacity-60"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#0F69B0]/25 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
            >
              {isSaving ? (<><Loader2 className="h-4 w-4 animate-spin" />{t("settings.changingPassword")}</>) : (<><Save className="h-4 w-4" />{t("settings.changePasswordBtn")}</>)}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}