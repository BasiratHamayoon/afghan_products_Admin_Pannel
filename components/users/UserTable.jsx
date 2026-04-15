"use client";

import { motion } from "framer-motion";
import {
  Edit2, Trash2, Eye, CheckCircle, AlertTriangle,
  Shield, ShoppingBag, Package, Star, MapPin,
  ToggleLeft, ToggleRight, Ban,
} from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/formatters";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const roleConfig = {
  seller: { label: "Seller", bg: "rgba(15,105,176,0.1)", text: "#0F69B0", icon: ShoppingBag },
  buyer: { label: "Buyer", bg: "rgba(124,58,237,0.1)", text: "#7c3aed", icon: Package },
  admin: { label: "Admin", bg: "rgba(16,185,129,0.1)", text: "#10b981", icon: Shield },
};

const statusConfig = {
  active: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  suspended: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  pending: { bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
  banned: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
};

const levelColors = {
  bronze: { bg: "rgba(180,83,9,0.1)", text: "#b45309" },
  silver: { bg: "rgba(107,114,128,0.1)", text: "#6b7280" },
  gold: { bg: "rgba(245,158,11,0.1)", text: "#d97706" },
  platinum: { bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
  admin: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

export default function UserTable({
  users = [],
  onView,
  onEdit,
  onDelete,
  onSuspend,
  onVerify,
  onBan,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["User", "Role", "Status", "Location", "Stats", "Level", "Joined", "Actions"].map((h) => (
              <th
                key={h}
                className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, i) => {
            if (!user?.id) return null;
            const role = roleConfig[user.role] || roleConfig.buyer;
            const RoleIcon = role.icon;
            const status = statusConfig[user.status] || statusConfig.active;
            const level = levelColors[user.level] || levelColors.bronze;

            return (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-xl object-cover border border-gray-100 dark:border-white/[0.08]"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black text-white"
                          style={{ background: `linear-gradient(135deg, ${role.text} 0%, ${role.text}cc 100%)` }}
                        >
                          {getInitials(user.name)}
                        </div>
                      )}
                      {user.verified && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#0F69B0] flex items-center justify-center">
                          <CheckCircle className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate max-w-[150px]">{user.name}</p>
                        {user.banned && <Ban className="h-3 w-3 text-red-500 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[150px]">{user.email}</p>
                      {user.phone && <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{user.phone}</p>}
                      {user.reportCount > 0 && (
                        <p className="text-[10px] text-red-500 font-bold mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {user.reportCount} reports
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit whitespace-nowrap"
                    style={{ background: role.bg, color: role.text }}
                  >
                    <RoleIcon className="h-2.5 w-2.5" />
                    {role.label}
                  </span>
                  {user.business?.name && (
                    <p className="text-[10px] text-muted-foreground font-medium mt-1 truncate max-w-[120px]">
                      {user.business.name}
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full capitalize whitespace-nowrap"
                    style={{ background: status.bg, color: status.text }}
                  >
                    {user.status}
                  </span>
                  {!user.verified && (
                    <p className="text-[10px] text-orange-500 font-semibold mt-0.5">Unverified</p>
                  )}
                </td>

                <td className="py-4 px-4">
                  {user.address?.city ? (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground whitespace-nowrap">{user.address.city}</p>
                        <p className="text-[10px] text-muted-foreground whitespace-nowrap">{user.address.province}</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>

                <td className="py-4 px-4">
                  {user.role === "seller" ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                        {user.stats?.totalProducts || 0} products
                      </p>
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {user.stats?.totalOrders || 0} orders
                      </p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-bold text-foreground">{user.stats?.rating || 0}</span>
                      </div>
                    </div>
                  ) : user.role === "buyer" ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                        {user.stats?.totalOrders || 0} orders
                      </p>
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {user.stats?.completionRate || 0}% complete
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize whitespace-nowrap"
                    style={{ background: level.bg, color: level.text }}
                  >
                    ★ {user.level}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {formatDate(user.joinedAt)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap mt-0.5">
                    Last: {formatDate(user.lastActive)}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onView?.(user)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit?.(user)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {!user.verified && (
                      <button
                        onClick={() => onVerify?.(user)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-all cursor-pointer"
                        title="Verify"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onSuspend?.(user)}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        user.status === "suspended"
                          ? "hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600"
                          : "hover:bg-orange-50 dark:hover:bg-orange-900/20 text-muted-foreground hover:text-orange-500"
                      )}
                      title={user.status === "suspended" ? "Activate" : "Suspend"}
                    >
                      {user.status === "suspended" ? (
                        <ToggleRight className="h-3.5 w-3.5" />
                      ) : (
                        <ToggleLeft className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onBan?.(user)}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        user.banned
                          ? "hover:bg-green-50 dark:hover:bg-green-900/20 text-red-500 hover:text-green-600"
                          : "hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500"
                      )}
                      title={user.banned ? "Unban" : "Ban"}
                    >
                      <Ban className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete?.(user)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                      title="Delete"
                    >
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