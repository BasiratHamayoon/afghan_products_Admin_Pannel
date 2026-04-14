"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, TrendingUp } from "lucide-react";
import { revenueData, categoryDistribution } from "@/data/dummyStats";
import { formatCurrency } from "@/lib/formatters";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import DoughnutChart from "@/components/charts/DoughnutChartComponent";

export default function RevenueChart() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-black text-foreground">Revenue Overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Monthly revenue performance for 2024
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#0F69B0]/10 dark:bg-[#0F69B0]/15 text-[#0F69B0]">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </div>
            <button className="h-8 w-8 rounded-xl flex items-center justify-center border border-gray-100 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <AreaChartComponent
          data={revenueData}
          areas={[{ dataKey: "revenue", color: "#0F69B0", name: "Revenue" }]}
          height={260}
          xKey="month"
          formatter={formatCurrency}
          yTickFormatter={(v) => `${v / 1000}K`}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl p-6 flex flex-col bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="mb-4">
          <h2 className="text-base font-black text-foreground">Categories</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Product distribution
          </p>
        </div>

        <DoughnutChart
          data={categoryDistribution}
          height={180}
          innerRadius={48}
          outerRadius={75}
          centerValue={`${categoryDistribution.length}`}
          centerLabel="Categories"
        />

        <div className="space-y-2.5 mt-4">
          {categoryDistribution.map((cat) => (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-xs text-muted-foreground font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1 w-14 rounded-full overflow-hidden bg-gray-100 dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                  />
                </div>
                <span className="text-xs font-black text-foreground w-8 text-right">
                  {cat.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}