"use client";

import { motion } from "framer-motion";
import {
  DollarSign, Wallet, ArrowUpRight, ArrowDownRight,
  CreditCard, RefreshCw, TrendingUp, Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import AnimatedCounter from "@/components/common/AnimatedCounter";

function StatCard({ title, value, subtitle, icon: Icon, color, bg, index, isCurrency }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] relative overflow-hidden group cursor-default"
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-50" style={{ background: `radial-gradient(circle, ${bg} 0%, transparent 70%)`, transform: "translate(30%,-30%)" }} />
      <div className="flex items-start justify-between mb-4">
        <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-foreground tracking-tight">
        {isCurrency ? formatCurrency(value) : <AnimatedCounter value={value} duration={1000} />}
      </p>
      {subtitle && <p className="text-[10px] text-muted-foreground font-medium mt-1">{subtitle}</p>}
    </motion.div>
  );
}

export default function PaymentStats({ stats }) {
  if (!stats) return null;

  const cards = [
    { title: "Total Volume", value: stats.totalVolume || 0, icon: TrendingUp, color: "#0F69B0", bg: "rgba(15,105,176,0.1)", isCurrency: true, subtitle: `${stats.totalTransactions} transactions` },
    { title: "Platform Fees", value: stats.platformFees || 0, icon: DollarSign, color: "#10b981", bg: "rgba(16,185,129,0.1)", isCurrency: true, subtitle: "Earned this period" },
    { title: "Wallet Balances", value: stats.totalWalletBalance || 0, icon: Wallet, color: "#7c3aed", bg: "rgba(124,58,237,0.1)", isCurrency: true, subtitle: `${stats.totalWallets} active wallets` },
    { title: "Pending Withdrawals", value: stats.pendingWithdrawalAmount || 0, icon: ArrowUpRight, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", isCurrency: true, subtitle: `${stats.pendingWithdrawals} requests` },
    { title: "Completed Txns", value: stats.completedTransactions || 0, icon: CreditCard, color: "#10b981", bg: "rgba(16,185,129,0.1)", subtitle: "Successfully processed" },
    { title: "Failed Txns", value: stats.failedTransactions || 0, icon: ArrowDownRight, color: "#ef4444", bg: "rgba(239,68,68,0.1)", subtitle: "Needs attention" },
    { title: "Pending Refunds", value: stats.pendingRefunds || 0, icon: RefreshCw, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", subtitle: `${stats.totalRefunds} total refunds` },
    { title: "Frozen Wallets", value: stats.frozenWallets || 0, icon: Users, color: "#6366f1", bg: "rgba(99,102,241,0.1)", subtitle: "Restricted accounts" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}