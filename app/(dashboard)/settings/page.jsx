"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Globe, CreditCard, Mail, User, Shield, FileText, ChevronRight } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { fetchGeneralSettings, fetchAdminProfile } from "@/store/actions/settingsActions";

const settingsNav = [
  { title: "General", description: "Site name, timezone, currency, and platform settings", icon: Globe, href: "/settings/general", color: "#0F69B0", bg: "rgba(15,105,176,0.08)" },
  { title: "Profile", description: "Manage your admin profile, password, and preferences", icon: User, href: "/settings/profile", color: "#7c3aed", bg: "rgba(124,58,237,0.08)" },
  { title: "Payment Gateways", description: "Configure payment methods and transaction settings", icon: CreditCard, href: "/settings/payment-gateways", color: "#10b981", bg: "rgba(16,185,129,0.08)" },
  { title: "Email Templates", description: "Customize automated email notifications and templates", icon: Mail, href: "/settings/email-templates", color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { title: "Roles & Permissions", description: "Manage admin roles and access control permissions", icon: Shield, href: "/settings/roles-permissions", color: "#ef4444", bg: "rgba(239,68,68,0.08)" },
  { title: "System Logs", description: "View platform activity logs and audit trail", icon: FileText, href: "/settings/system-logs", color: "#6366f1", bg: "rgba(99,102,241,0.08)" },
];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { generalSettings, adminProfile, isLoading } = useSelector((s) => s.settings);

  useEffect(() => {
    dispatch(fetchGeneralSettings());
    dispatch(fetchAdminProfile());
  }, [dispatch]);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Settings" description="Manage platform configuration, users, and preferences" />

      {generalSettings && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Platform", value: generalSettings.siteName, sub: generalSettings.siteUrl },
            { label: "Admin", value: adminProfile?.name || "Admin", sub: adminProfile?.email },
            { label: "Environment", value: generalSettings.maintenanceMode ? "Maintenance" : "Live", sub: `${generalSettings.currency} · ${generalSettings.timezone}` },
          ].map((item, i) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl p-4 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-sm font-black text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{item.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsNav.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(item.href)}
              className="text-left rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 hover:shadow-[0_4px_20px_rgba(15,105,176,0.1)] transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                  <Icon className="h-5 w-5" style={{ color: item.color }} />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-[#0F69B0] transition-colors" />
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