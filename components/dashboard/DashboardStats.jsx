"use client";

import { motion } from "framer-motion";
import {
  Users, Package, DollarSign, ShoppingCart,
  ShieldCheck, TrendingUp, Wallet, AlertTriangle,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { dashboardStats } from "@/data/dummyStats";
import { formatCurrency } from "@/lib/formatters";

const iconMap = { Users, Package, DollarSign, ShoppingCart, ShieldCheck, TrendingUp, Wallet, AlertTriangle };

const statStyles = [
  { icon: "rgba(15,105,176,0.12)", iconColor: "#0F69B0", glow: "rgba(15,105,176,0.08)" },
  { icon: "rgba(124,58,237,0.12)", iconColor: "#7c3aed", glow: "rgba(124,58,237,0.08)" },
  { icon: "rgba(16,185,129,0.12)", iconColor: "#10b981", glow: "rgba(16,185,129,0.08)" },
  { icon: "rgba(245,158,11,0.12)", iconColor: "#f59e0b", glow: "rgba(245,158,11,0.08)" },
  { icon: "rgba(239,68,68,0.12)", iconColor: "#ef4444", glow: "rgba(239,68,68,0.08)" },
  { icon: "rgba(6,182,212,0.12)", iconColor: "#06b6d4", glow: "rgba(6,182,212,0.08)" },
  { icon: "rgba(99,102,241,0.12)", iconColor: "#6366f1", glow: "rgba(99,102,241,0.08)" },
  { icon: "rgba(236,72,153,0.12)", iconColor: "#ec4899", glow: "rgba(236,72,153,0.08)" },
];

function StatCard({ title, value, change, changeType, icon: Icon, index }) {
  const isPositive = changeType === "increase";
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
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shadow-sm"
          style={{ background: style.icon }}
        >
          {Icon && <Icon className="h-5 w-5" style={{ color: style.iconColor }} />}
        </div>
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
            isPositive
              ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
          }`}
        >
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {change}
        </div>
      </div>

      <div className="relative">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
          {isPositive ? "↑ Increased" : "↓ Decreased"} from last month
        </p>
      </div>
    </motion.div>
  );
}

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {dashboardStats.map((stat, index) => (
        <StatCard
          key={stat.id}
          title={stat.title}
          value={
            stat.title.includes("Revenue") || stat.title.includes("Wallet")
              ? formatCurrency(stat.value)
              : stat.value
          }
          change={stat.change}
          changeType={stat.changeType}
          icon={iconMap[stat.icon]}
          index={index}
        />
      ))}
    </div>
  );
}