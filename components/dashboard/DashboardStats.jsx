"use client";

import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Users, Package, DollarSign, ShoppingCart,
  ShieldCheck, TrendingUp, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useTranslation } from "react-i18next";

const statStyles = [
  { icon: "rgba(15,105,176,0.12)", iconColor: "#0F69B0", glow: "rgba(15,105,176,0.08)" },
  { icon: "rgba(124,58,237,0.12)", iconColor: "#7c3aed", glow: "rgba(124,58,237,0.08)" },
  { icon: "rgba(16,185,129,0.12)", iconColor: "#10b981", glow: "rgba(16,185,129,0.08)" },
  { icon: "rgba(245,158,11,0.12)", iconColor: "#f59e0b", glow: "rgba(245,158,11,0.08)" },
  { icon: "rgba(239,68,68,0.12)", iconColor: "#ef4444", glow: "rgba(239,68,68,0.08)" },
  { icon: "rgba(6,182,212,0.12)", iconColor: "#06b6d4", glow: "rgba(6,182,212,0.08)" },
];

function Skeleton({ className }) {
  return <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />;
}

function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <Skeleton className="h-2.5 w-24 mb-2" />
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-2.5 w-36" />
    </div>
  );
}

function StatCard({ title, value, change, changeType, icon: Icon, index }) {
  const { t } = useTranslation();
  const isPositive = changeType === "increase";
  const isNoChange = changeType === "no_change";
  const style = statStyles[index % statStyles.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5 cursor-pointer bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] group transition-shadow hover:shadow-[0_8px_30px_rgba(15,105,176,0.1)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
    >
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none opacity-60"
        style={{
          background: `radial-gradient(circle, ${style.glow} 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />
      <div className="relative flex items-start justify-between mb-4">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center shadow-sm" style={{ background: style.icon }}>
          {Icon && <Icon className="h-5 w-5" style={{ color: style.iconColor }} />}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${isNoChange ? "bg-gray-50 dark:bg-white/[0.06] text-gray-500" : isPositive ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"}`}>
          {isNoChange ? <Minus className="h-3 w-3" /> : isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}%
        </div>
      </div>
      <div className="relative">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
          {isNoChange
            ? t("stats.noChangeFromLastMonth")
            : isPositive
            ? t("stats.increasedFromLastMonth")
            : t("stats.decreasedFromLastMonth")}
        </p>
      </div>
    </motion.div>
  );
}

function buildStatCards(dashboard, t) {
  if (!dashboard) return [];
  const get = (obj) => ({
    count: obj?.count ?? obj?.amount ?? 0,
    percentage: obj?.percentage ?? 0,
    trend: obj?.trend || "no_change",
  });

  const users = get(dashboard.totalUsers);
  const products = get(dashboard.totalProducts);
  const orders = get(dashboard.orders);
  const revenue = get(dashboard.revenue);
  const verifications = get(dashboard.pendingVerifications);
  const tradeLeads = get(dashboard.tradeLeads);

  return [
    { id: "users", title: t("stats.totalUsers"), value: String(users.count), change: users.percentage, changeType: users.trend, icon: Users },
    { id: "products", title: t("stats.totalProducts"), value: String(products.count), change: products.percentage, changeType: products.trend, icon: Package },
    { id: "orders", title: t("stats.orders"), value: String(orders.count), change: orders.percentage, changeType: orders.trend, icon: ShoppingCart },
    { id: "revenue", title: t("stats.revenue"), value: formatCurrency(revenue.count), change: revenue.percentage, changeType: revenue.trend, icon: DollarSign },
    { id: "verifications", title: t("stats.pendingVerifications"), value: String(verifications.count), change: verifications.percentage, changeType: verifications.trend, icon: ShieldCheck },
    { id: "tradeLeads", title: t("stats.tradeLeads"), value: String(tradeLeads.count), change: tradeLeads.percentage, changeType: tradeLeads.trend, icon: TrendingUp },
  ];
}

export default function DashboardStats() {
  const { t } = useTranslation();
  const { stats, statsLoading } = useSelector((state) => state.dashboard);

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  const statCards = buildStatCards(stats, t);

  if (statCards.length === 0) {
    return (
      <div className="rounded-2xl p-8 mb-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] text-center">
        <p className="text-sm text-muted-foreground font-medium">{t("stats.noStats")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
      {statCards.map((stat, index) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          index={index}
        />
      ))}
    </div>
  );
}