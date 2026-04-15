// components/investments/InvestmentStats.jsx

"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign, Users, BarChart3, Target, CheckCircle } from "lucide-react";
import StatsCard from "@/components/common/StatCard";

export default function InvestmentStats({ stats }) {
  const s = stats || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <StatsCard
        title="Total Investments"
        value={s.totalInvestments || 0}
        icon={BarChart3}
        color="rgba(15,105,176,0.08)"
        index={0}
      />
      <StatsCard
        title="Active"
        value={s.activeInvestments || 0}
        icon={TrendingUp}
        color="rgba(16,185,129,0.08)"
        index={1}
      />
      <StatsCard
        title="Total Invested"
        value={`$${((s.totalInvested || 0) / 1000).toFixed(0)}K`}
        icon={DollarSign}
        color="rgba(124,58,237,0.08)"
        index={2}
      />
      <StatsCard
        title="Avg ROI"
        value={`${s.averageROI || 0}%`}
        icon={Target}
        color="rgba(245,158,11,0.08)"
        index={3}
      />
    </div>
  );
}