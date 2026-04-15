"use client";

import { motion } from "framer-motion";
import {
  Star, Shield, ShoppingBag, Package, CheckCircle,
  MapPin, Phone, Mail, Calendar, Wallet, BarChart2,
  ShoppingCart, MessageSquare, Award, Clock, Building,
} from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/formatters";
import { formatDateTime } from "@/lib/helpers";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import StatusBadge from "@/components/common/StatusBadge";
import { cn } from "@/lib/utils";

const roleConfig = {
  seller: { label: "Seller", bg: "rgba(15,105,176,0.1)", text: "#0F69B0", icon: ShoppingBag },
  buyer: { label: "Buyer", bg: "rgba(124,58,237,0.1)", text: "#7c3aed", icon: Package },
  admin: { label: "Admin", bg: "rgba(16,185,129,0.1)", text: "#10b981", icon: Shield },
};

const levelColors = {
  bronze: { bg: "rgba(180,83,9,0.1)", text: "#b45309" },
  silver: { bg: "rgba(107,114,128,0.1)", text: "#6b7280" },
  gold: { bg: "rgba(245,158,11,0.1)", text: "#d97706" },
  platinum: { bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
  admin: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

export default function UserDetail({ user }) {
  if (!user) return null;

  const role = roleConfig[user.role] || roleConfig.buyer;
  const RoleIcon = role.icon;
  const level = levelColors[user.level] || levelColors.bronze;

  const statCards = user.role === "seller" ? [
    { label: "Total Products", value: user.stats?.totalProducts || 0, icon: Package, color: "#0F69B0", bg: "rgba(15,105,176,0.1)" },
    { label: "Total Orders", value: user.stats?.totalOrders || 0, icon: ShoppingCart, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Total Revenue", value: user.stats?.totalRevenue || 0, icon: BarChart2, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", isCurrency: true },
    { label: "Rating", value: user.stats?.rating || 0, icon: Star, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", suffix: "/5" },
  ] : user.role === "buyer" ? [
    { label: "Total Orders", value: user.stats?.totalOrders || 0, icon: ShoppingCart, color: "#7c3aed", bg: "rgba(124,58,237,0.1)" },
    { label: "Reviews Given", value: user.stats?.totalReviews || 0, icon: MessageSquare, color: "#0F69B0", bg: "rgba(15,105,176,0.1)" },
    { label: "Completion Rate", value: user.stats?.completionRate || 0, icon: Award, color: "#10b981", bg: "rgba(16,185,129,0.1)", suffix: "%" },
    { label: "Wallet Balance", value: user.walletBalance || 0, icon: Wallet, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", isCurrency: true },
  ] : [
    { label: "Wallet Balance", value: user.walletBalance || 0, icon: Wallet, color: "#0F69B0", bg: "rgba(15,105,176,0.1)", isCurrency: true },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]"
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-foreground">
              {stat.isCurrency
                ? formatCurrency(stat.value)
                : <AnimatedCounter value={stat.value} duration={1000} suffix={stat.suffix || ""} />
              }
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] flex flex-col items-center text-center relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 right-0 h-20"
            style={{ background: `linear-gradient(135deg, ${role.text}20 0%, ${role.text}10 100%)` }}
          />
          <div className="relative mb-3 mt-4">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-2xl object-cover shadow-lg"
                style={{ border: "3px solid white" }}
              />
            ) : (
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${role.text} 0%, ${role.text}cc 100%)`, border: "3px solid white" }}
              >
                {getInitials(user.name)}
              </div>
            )}
            {user.verified && (
              <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[#0F69B0] flex items-center justify-center shadow-md">
                <CheckCircle className="h-4 w-4 text-white fill-white" />
              </div>
            )}
          </div>

          <h2 className="text-base font-black text-foreground mb-1">{user.name}</h2>

          <div className="flex items-center gap-2 flex-wrap justify-center mb-3">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: role.bg, color: role.text }}>
              <RoleIcon className="h-2.5 w-2.5" />
              {role.label}
            </span>
            <StatusBadge status={user.status} />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: level.bg, color: level.text }}>
              ★ {user.level}
            </span>
          </div>

          <div className="w-full space-y-2 text-left">
            {[
              { icon: Mail, label: user.email },
              { icon: Phone, label: user.phone },
              { icon: MapPin, label: user.address?.city ? `${user.address.city}, ${user.address.province}` : null },
              { icon: Calendar, label: `Joined ${formatDateTime(user.joinedAt)}` },
              { icon: Clock, label: `Last active ${formatDateTime(user.lastActive)}` },
            ].filter((i) => i.label).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <item.icon className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <span className="text-muted-foreground font-medium truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {user.walletBalance > 0 && (
            <div className="w-full mt-3 p-3 rounded-xl bg-[#0F69B0]/5 border border-[#0F69B0]/10">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-[#0F69B0]" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Wallet Balance</p>
                  <p className="text-sm font-black text-[#0F69B0]">{formatCurrency(user.walletBalance)}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 space-y-4"
        >
          {user.business && user.role === "seller" && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center">
                  <Building className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">Business Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Business Name", value: user.business.name },
                  { label: "Category", value: user.business.category },
                  { label: "Registration No.", value: user.business.registrationNumber },
                  { label: "Description", value: user.business.description },
                ].map((item) => (
                  <div key={item.label} className={cn("p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]", item.label === "Description" && "col-span-2")}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-xs font-bold text-foreground">{item.value || "N/A"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-[#0F69B0]" />
              </div>
              <h3 className="text-sm font-black text-foreground">Address Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Street", value: user.address?.street },
                { label: "City", value: user.address?.city },
                { label: "Province", value: user.address?.province },
                { label: "Country", value: user.address?.country },
              ].map((item) => (
                <div key={item.label} className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                  <p className="text-xs font-bold text-foreground">{item.value || "N/A"}</p>
                </div>
              ))}
            </div>
          </div>

          {user.role === "seller" && (
            <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4 text-[#0F69B0]" />
                </div>
                <h3 className="text-sm font-black text-foreground">Performance Metrics</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Completion Rate", value: user.stats?.completionRate || 0, color: "#10b981" },
                  { label: "Rating Score", value: ((user.stats?.rating || 0) / 5) * 100, color: "#f59e0b" },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold text-foreground">{metric.label}</p>
                      <p className="text-xs font-black" style={{ color: metric.color }}>
                        {Math.round(metric.value)}%
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.value}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: metric.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}