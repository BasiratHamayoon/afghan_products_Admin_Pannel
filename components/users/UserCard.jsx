"use client";

import { motion } from "framer-motion";
import {
  Star, Shield, ShoppingBag, Package,
  CheckCircle, AlertTriangle, Edit2, Eye, Trash2,
  MapPin, Phone, Mail,
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

export default function UserCard({ user, index = 0, onView, onEdit, onDelete, onSuspend, onVerify }) {
  if (!user) return null;

  const role = roleConfig[user.role] || roleConfig.buyer;
  const RoleIcon = role.icon;
  const status = statusConfig[user.status] || statusConfig.active;
  const level = levelColors[user.level] || levelColors.bronze;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.1)] overflow-hidden"
    >
      <div
        className="h-16 w-full"
        style={{
          background: `linear-gradient(135deg, ${role.text}20 0%, ${role.text}10 100%)`,
        }}
      />

      <div className="px-4 pb-4">
        <div className="flex items-end gap-3 -mt-8 mb-3">
          <div className="relative shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-16 w-16 rounded-2xl object-cover border-3 border-white dark:border-[#0f1420] shadow-lg"
                style={{ border: "3px solid white" }}
              />
            ) : (
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${role.text} 0%, ${role.text}cc 100%)`,
                  border: "3px solid white",
                }}
              >
                {getInitials(user.name)}
              </div>
            )}
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#0F69B0] flex items-center justify-center shadow-md">
                <CheckCircle className="h-3 w-3 text-white fill-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: role.bg, color: role.text }}
              >
                <RoleIcon className="h-2.5 w-2.5" />
                {role.label}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                style={{ background: status.bg, color: status.text }}
              >
                {user.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-black text-foreground truncate">{user.name}</h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            <p className="text-[11px] text-muted-foreground font-medium truncate">{user.email}</p>
          </div>
          {user.phone && (
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              <p className="text-[11px] text-muted-foreground font-medium">{user.phone}</p>
            </div>
          )}
          {user.address?.city && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              <p className="text-[11px] text-muted-foreground font-medium">{user.address.city}, {user.address.province}</p>
            </div>
          )}
        </div>

        {user.role === "seller" && user.business && (
          <div
            className="rounded-xl p-2.5 mb-3"
            style={{ background: "rgba(15,105,176,0.04)", border: "1px solid rgba(15,105,176,0.08)" }}
          >
            <p className="text-[10px] font-black text-[#0F69B0] truncate">{user.business.name}</p>
            <p className="text-[10px] text-muted-foreground font-medium">{user.business.category}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 mb-3">
          {user.role === "seller" ? (
            <>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                <p className="text-xs font-black text-foreground">{user.stats?.totalProducts || 0}</p>
                <p className="text-[9px] text-muted-foreground font-medium">Products</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                <p className="text-xs font-black text-foreground">{user.stats?.totalOrders || 0}</p>
                <p className="text-[9px] text-muted-foreground font-medium">Orders</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                <div className="flex items-center justify-center gap-0.5">
                  <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                  <p className="text-xs font-black text-foreground">{user.stats?.rating || 0}</p>
                </div>
                <p className="text-[9px] text-muted-foreground font-medium">Rating</p>
              </div>
            </>
          ) : user.role === "buyer" ? (
            <>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                <p className="text-xs font-black text-foreground">{user.stats?.totalOrders || 0}</p>
                <p className="text-[9px] text-muted-foreground font-medium">Orders</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                <p className="text-xs font-black text-foreground">{user.stats?.totalReviews || 0}</p>
                <p className="text-[9px] text-muted-foreground font-medium">Reviews</p>
              </div>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03]">
                <p className="text-xs font-black text-foreground">{user.stats?.completionRate || 0}%</p>
                <p className="text-[9px] text-muted-foreground font-medium">Complete</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center p-2 rounded-xl bg-gray-50 dark:bg-white/[0.03] col-span-3">
                <p className="text-xs font-semibold text-muted-foreground">System Administrator</p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize"
            style={{ background: level.bg, color: level.text }}
          >
            ★ {user.level}
          </span>
          <p className="text-[10px] text-muted-foreground font-medium">
            Joined {formatDate(user.joinedAt)}
          </p>
        </div>

        {user.reportCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30">
            <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
            <p className="text-[10px] font-bold text-red-500">{user.reportCount} reports</p>
          </div>
        )}

        <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
          <button
            onClick={() => onView?.(user)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
            title="View"
          >
            <Eye className="h-3.5 w-3.5 mx-auto" />
          </button>
          <button
            onClick={() => onEdit?.(user)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5 mx-auto" />
          </button>
          {!user.verified && (
            <button
              onClick={() => onVerify?.(user)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all cursor-pointer"
              title="Verify"
            >
              <CheckCircle className="h-3.5 w-3.5 mx-auto" />
            </button>
          )}
          <button
            onClick={() => onSuspend?.(user)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer",
              user.status === "suspended"
                ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                : "text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            )}
            title={user.status === "suspended" ? "Activate" : "Suspend"}
          >
            <AlertTriangle className="h-3.5 w-3.5 mx-auto" />
          </button>
          <button
            onClick={() => onDelete?.(user)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 mx-auto" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}