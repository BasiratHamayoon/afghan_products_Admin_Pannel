"use client";

import { motion } from "framer-motion";
import { Eye, Trash2, ShoppingBag, Package, Shield, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const roleConfig = {
  SELLER: { bg: "rgba(15,105,176,0.1)", text: "#0F69B0", gradient: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)", icon: ShoppingBag },
  BUYER: { bg: "rgba(15,105,176,0.06)", text: "#1a82d4", gradient: "linear-gradient(135deg, #1a82d4 0%, #0F69B0 100%)", icon: Package },
  ADMIN: { bg: "rgba(10,79,133,0.1)", text: "#0A4F85", gradient: "linear-gradient(135deg, #0A4F85 0%, #0F69B0 100%)", icon: Shield },
};

const statusConfig = {
  ACTIVE: { bg: "rgba(16,185,129,0.1)", text: "#10b981", dot: "bg-emerald-500" },
  BLOCKED: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", dot: "bg-amber-500" },
  INACTIVE: { bg: "rgba(107,114,128,0.1)", text: "#6b7280", dot: "bg-gray-400" },
};

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function UserTable({ users = [], onView, onDelete, onSuspend }) {
  const { t } = useTranslation();
  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
  if (safeUsers.length === 0) return null;

  const roleLabels = {
    SELLER: t("users.seller"),
    BUYER: t("users.buyer"),
    ADMIN: t("users.admin"),
  };

  const statusLabels = {
    ACTIVE: t("users.active"),
    BLOCKED: t("users.blocked"),
    INACTIVE: t("users.inactive"),
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {[t("users.user"), t("users.role"), t("users.status"), t("users.business"), t("users.actions")].map((h) => (
              <th key={h} className="text-start py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeUsers.map((user, i) => {
            if (!user?.id) return null;
            const role = roleConfig[user.role] || roleConfig.BUYER;
            const RoleIcon = role.icon;
            const userStatus = (user.status || "ACTIVE").toUpperCase();
            const status = statusConfig[userStatus] || statusConfig.ACTIVE;
            const isBlocked = userStatus === "BLOCKED";

            return (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-[0_2px_8px_rgba(15,105,176,0.2)]"
                      style={{ background: role.gradient }}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[180px]">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[180px]">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap" style={{ background: role.bg, color: role.text }}>
                    <RoleIcon className="h-2.5 w-2.5" />
                    {roleLabels[user.role] || role.label}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap" style={{ background: status.bg, color: status.text }}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                    {statusLabels[userStatus] || userStatus}
                  </span>
                </td>

                <td className="py-4 px-4">
                  {user.hasBusiness ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#0F69B0]/10 text-[#0F69B0]">
                      <ShoppingBag className="h-3 w-3" />
                      {t("users.yes")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(user)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("users.view")}>
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onSuspend?.(user)}
                      className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer", isBlocked ? "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600" : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600")}
                      title={isBlocked ? t("users.activate") : t("users.block")}
                    >
                      {isBlocked ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => onDelete?.(user)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("users.delete")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}