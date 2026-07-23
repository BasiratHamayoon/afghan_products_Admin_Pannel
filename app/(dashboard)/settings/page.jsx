"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Shield, ChevronRight, Mail } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchAdminProfile } from "@/store/actions/settingsActions";
import { useTranslation } from "react-i18next";

function getInitials(firstName, lastName) {
  const first = (firstName || "").trim();
  const last = (lastName || "").trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  return "AD";
}

function getFullName(profile) {
  if (!profile) return "Admin";
  const name = `${profile.firstName || ""} ${profile.lastName || ""}`.trim();
  return name || profile.name || "Admin";
}

function getEmail(profile) {
  if (!profile) return "";
  return profile.email || profile.userEmail || "";
}

export default function SettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { adminProfile, isProfileLoading } = useSelector((s) => s.settings);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchAdminProfile());
  }, [dispatch]);

  const fullName = getFullName(adminProfile);
  const initials = getInitials(adminProfile?.firstName, adminProfile?.lastName);
  const email = getEmail(adminProfile);
  const role = (adminProfile?.role || "ADMIN").toUpperCase();

  const settingsNav = [
    {
      title: t("settings.profileSettings"),
      description: t("settings.profileSettingsDesc"),
      icon: User,
      href: "/settings/profile",
      color: "#0F69B0",
      bg: "rgba(15,105,176,0.08)",
    },
    {
      title: t("settings.changePassword"),
      description: t("settings.changePasswordDesc"),
      icon: Shield,
      href: "/settings/change-password",
      color: "#7c3aed",
      bg: "rgba(124,58,237,0.08)",
    },
  ];

  const profileFields = adminProfile
    ? [
        { label: t("settings.fullName"), value: fullName, icon: User },
        { label: t("settings.email"), value: email || "—", icon: Mail },
        { label: t("settings.role"), value: role, icon: Shield },
      ]
    : [];

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("settings.title")} description={t("settings.description")} />

      {isProfileLoading ? (
        <LoadingSpinner size="lg" text={t("settings.loadingProfile")} className="py-16" />
      ) : adminProfile ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-visible"
        >
          <div className="p-6 flex items-center gap-5">
            <div
              className="h-18 w-18 min-h-[72px] min-w-[72px] rounded-full flex items-center justify-center text-xl font-black text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                boxShadow: "0 4px 14px rgba(15,105,176,0.25)",
                border: "3px solid white",
                outline: "2px solid rgba(15,105,176,0.15)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-foreground truncate">{fullName}</h2>
              {email && (
                <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">{email}</p>
              )}
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5"
                style={{ background: "rgba(15,105,176,0.1)", color: "#0F69B0" }}
              >
                <Shield className="h-2.5 w-2.5" />
                {role}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {profileFields.map((field) => {
                const FieldIcon = field.icon;
                return (
                  <div
                    key={field.label}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
                  >
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(15,105,176,0.08)" }}
                    >
                      <FieldIcon className="h-3.5 w-3.5 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        {field.label}
                      </p>
                      <p className="text-xs font-bold text-foreground break-all">
                        {field.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="rounded-2xl p-8 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] text-center">
          <p className="text-sm text-muted-foreground font-medium">{t("settings.failedToLoadProfile")}</p>
          <button
            onClick={() => { hasFetched.current = false; dispatch(fetchAdminProfile()); }}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-[#0F69B0] border border-[#0F69B0]/20 hover:bg-[#0F69B0]/5 transition-colors cursor-pointer"
          >
            {t("common.retry")}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingsNav.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.href)}
              className="text-start rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 hover:shadow-[0_4px_20px_rgba(15,105,176,0.1)] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center"
                  style={{ background: item.bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#0F69B0] transition-colors rtl-mirror" />
              </div>
              <h3 className="text-sm font-black text-foreground mb-1">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{item.description}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}