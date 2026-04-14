"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { userGrowthData, quickActions } from "@/data/dummyStats";
import BarChartComponent from "@/components/charts/BarChartComponent";

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-foreground">User Growth</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Users vs Sellers monthly comparison
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#0F69B0]" />
              <span className="text-xs font-semibold text-muted-foreground">Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-[#0F69B0]/25" />
              <span className="text-xs font-semibold text-muted-foreground">Sellers</span>
            </div>
          </div>
        </div>

        <BarChartComponent
          data={userGrowthData}
          bars={[
            { dataKey: "users", color: "#0F69B0", name: "Users" },
            { dataKey: "sellers", color: "rgba(15,105,176,0.25)", name: "Sellers" },
          ]}
          height={240}
          xKey="month"
          barSize={18}
          barGap={6}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="mb-5">
          <h2 className="text-base font-black text-foreground">Quick Actions</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Pending items needing attention
          </p>
        </div>

        <div className="space-y-2">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.07 }}
              whileHover={{ x: 3, transition: { duration: 0.15 } }}
              className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-sm group cursor-pointer bg-[#0F69B0]/[0.03] dark:bg-[#0F69B0]/[0.06] border border-[#0F69B0]/[0.08] dark:border-[#0F69B0]/[0.12] hover:bg-[#0F69B0]/[0.08] dark:hover:bg-[#0F69B0]/[0.12] hover:border-[#0F69B0]/20"
            >
              <span className="font-semibold text-foreground text-xs">{action.label}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${action.color}`}>
                  {action.count}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-[#0F69B0] transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}