"use client";

import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { recentTransactions, recentUsers } from "@/data/dummyStats";

const statusConfig = {
  completed: { label: "Completed", bg: "rgba(16,185,129,0.08)", text: "#10b981" },
  pending: { label: "Pending", bg: "rgba(245,158,11,0.08)", text: "#f59e0b" },
  failed: { label: "Failed", bg: "rgba(239,68,68,0.08)", text: "#ef4444" },
  active: { label: "Active", bg: "rgba(16,185,129,0.08)", text: "#10b981" },
  suspended: { label: "Suspended", bg: "rgba(249,115,22,0.08)", text: "#f97316" },
};

const roleConfig = {
  seller: { bg: "rgba(15,105,176,0.08)", text: "#0F69B0" },
  buyer: { bg: "rgba(124,58,237,0.08)", text: "#7c3aed" },
};

export default function ActivityFeed() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-foreground">Recent Transactions</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Latest payment activities</p>
          </div>
          <button className="text-[11px] font-bold cursor-pointer px-3 py-1.5 rounded-xl text-[#0F69B0] bg-[#0F69B0]/10 dark:bg-[#0F69B0]/15 hover:bg-[#0F69B0]/15 dark:hover:bg-[#0F69B0]/20 transition-colors">
            View All →
          </button>
        </div>

        <div className="space-y-0.5">
          {recentTransactions.map((txn, i) => {
            const cfg = statusConfig[txn.status] || statusConfig.pending;
            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.06 }}
                className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: cfg.bg }}
                  >
                    <DollarSign className="h-4 w-4" style={{ color: cfg.text }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{txn.user}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {txn.id} · {txn.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black" style={{ color: cfg.text }}>
                    {txn.type === "refund" ? "-" : "+"}AFN {txn.amount.toLocaleString()}
                  </p>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5 inline-block"
                    style={{ background: cfg.bg, color: cfg.text }}
                  >
                    {cfg.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-foreground">Recent Users</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">Newly registered accounts</p>
          </div>
          <button className="text-[11px] font-bold cursor-pointer px-3 py-1.5 rounded-xl text-[#0F69B0] bg-[#0F69B0]/10 dark:bg-[#0F69B0]/15 hover:bg-[#0F69B0]/15 dark:hover:bg-[#0F69B0]/20 transition-colors">
            View All →
          </button>
        </div>

        <div className="space-y-0.5">
          {recentUsers.map((user, i) => {
            const statusCfg = statusConfig[user.status] || statusConfig.active;
            const roleCfg = roleConfig[user.role] || { bg: "rgba(0,0,0,0.06)", text: "#64748b" };
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-center justify-between py-3 border-b border-gray-50 dark:border-white/[0.04] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] rounded-xl px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                    style={{
                      background: "linear-gradient(135deg, rgba(15,105,176,0.15) 0%, rgba(15,105,176,0.06) 100%)",
                      color: "#0F69B0",
                    }}
                  >
                    {user.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-bold capitalize"
                    style={{ background: roleCfg.bg, color: roleCfg.text }}
                  >
                    {user.role}
                  </span>
                  <span
                    className="text-[10px] px-2.5 py-0.5 rounded-full font-bold"
                    style={{ background: statusCfg.bg, color: statusCfg.text }}
                  >
                    {statusCfg.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}