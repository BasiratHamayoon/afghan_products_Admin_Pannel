"use client";

import { motion } from "framer-motion";
import { Eye, Trash2, ShoppingBag, Package, Shield, ToggleLeft, ToggleRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const roleConfig = {
  SELLER: { gradient: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)", icon: ShoppingBag },
  BUYER: { gradient: "linear-gradient(135deg, #1a82d4 0%, #0F69B0 100%)", icon: Package },
  ADMIN: { gradient: "linear-gradient(135deg, #0A4F85 0%, #0F69B0 100%)", icon: Shield },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UserCard({ user, index = 0, onView, onDelete, onSuspend }) {
  const { t } = useTranslation();
  if (!user) return null;

  const role = roleConfig[user.role] || roleConfig.BUYER;
  const RoleIcon = role.icon;

  const roleLabels = {
    SELLER: t("users.seller"),
    BUYER: t("users.buyer"),
    ADMIN: t("users.admin"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_8px_30px_rgba(15,105,176,0.12)] overflow-visible flex flex-col"
    >
      <div className="h-24 w-full relative rounded-t-2xl overflow-hidden" style={{ background: role.gradient }}>
        <div className="absolute inset-0">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }} />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
          <div className="absolute top-3 right-12 w-14 h-14 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>
        <div className="absolute top-3 end-3 z-10">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 bg-white/20 text-white border border-white/20 backdrop-blur-sm">
            <RoleIcon className="h-2.5 w-2.5" />
            {roleLabels[user.role] || user.role}
          </span>
        </div>
      </div>

      <div className="relative px-4 pb-4 flex-1 flex flex-col">
        <div className="flex justify-center -mt-8 mb-4 relative z-10">
          <div className="relative">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center text-lg font-black text-white shadow-[0_4px_20px_rgba(15,105,176,0.3)] ring-[3px] ring-white dark:ring-[#0f1420]"
              style={{ background: role.gradient }}
            >
              {getInitials(user.name)}
            </div>
            {user.hasBusiness && (
              <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white dark:ring-[#0f1420]" style={{ background: role.gradient }}>
                <ShoppingBag className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="text-center mb-3 flex-1">
          <h3 className="text-sm font-black text-foreground truncate">{user.name}</h3>
          <div className="flex items-center justify-center gap-1 mt-1.5">
            <Mail className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px]">{user.email}</p>
          </div>
        </div>

        {user.hasBusiness && (
          <div className="flex items-center justify-center gap-1.5 mb-3 py-2 px-3 rounded-xl bg-[#0F69B0]/[0.04] border border-[#0F69B0]/10">
            <ShoppingBag className="h-3 w-3 text-[#0F69B0] shrink-0" />
            <p className="text-[10px] font-bold text-[#0F69B0]">{t("users.businessProfile")}</p>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100 dark:border-white/[0.06] mt-auto">
          <button onClick={() => onView?.(user)} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("users.viewDetails")}>
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onSuspend?.(user)}
            className={cn("h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer", user.status === "suspended" ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600" : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600")}
            title={user.status === "suspended" ? t("users.activate") : t("users.suspend")}
          >
            {user.status === "suspended" ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
          </button>
          <button onClick={() => onDelete?.(user)} className="h-9 w-9 rounded-xl flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("users.delete")}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}