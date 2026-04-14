"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatsCard({ title, value, change, changeType, icon: Icon, color, index = 0 }) {
  const isPositive = changeType === "increase";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)] cursor-pointer group"
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none opacity-50"
        style={{
          background: `radial-gradient(circle, ${color || "rgba(15,105,176,0.08)"} 0%, transparent 70%)`,
          transform: "translate(30%, -30%)",
        }}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center"
          style={{ background: color ? color.replace("0.08", "0.12") : "rgba(15,105,176,0.12)" }}
        >
          {Icon && <Icon className="h-5 w-5" style={{ color: "#0F69B0" }} />}
        </div>
        {change && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${isPositive ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {change}
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-foreground tracking-tight">{value}</p>
    </motion.div>
  );
}