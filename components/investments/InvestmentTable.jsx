// components/investments/InvestmentTable.jsx

"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, Star, StarOff, ToggleLeft, ToggleRight } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { investmentTypeOptions, riskLevelOptions } from "@/data/dummyInvestments";

function getTypeInfo(type) {
  return investmentTypeOptions.find((t) => t.value === type) || { icon: "📦", label: type, color: "#6b7280" };
}

function getRiskInfo(level) {
  return riskLevelOptions.find((r) => r.value === level) || { label: level, color: "#6b7280" };
}

function ProgressBar({ current, target, color }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-foreground">${(current / 1000).toFixed(0)}K</span>
        <span className="text-[10px] text-muted-foreground font-medium">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color || "#0F69B0" }}
        />
      </div>
      <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
        of ${(target / 1000).toFixed(0)}K target
      </p>
    </div>
  );
}

export default function InvestmentTable({ investments, onView, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Investment", "Type", "Progress", "ROI", "Risk", "Status", "Created", "Actions"].map((h) => (
              <th
                key={h}
                className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(investments || []).map((inv, i) => {
            const typeInfo = getTypeInfo(inv.type);
            const riskInfo = getRiskInfo(inv.riskLevel);
            return (
              <motion.tr
                key={inv.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {inv.image ? (
                        <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                          <img src={inv.image} alt={inv.title} className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                          style={{ background: `${typeInfo.color}18` }}
                        >
                          {typeInfo.icon}
                        </div>
                      )}
                      {inv.featured && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Star className="h-2.5 w-2.5 text-white fill-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{inv.title}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[200px]">
                        {inv.location}
                      </p>
                      <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5">
                        {inv.investorsCount} investors
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5"
                    style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}
                  >
                    <span>{typeInfo.icon}</span>
                    {typeInfo.label}
                  </span>
                </td>
                <td className="py-4 px-4 min-w-[140px]">
                  <ProgressBar current={inv.investedAmount} target={inv.targetAmount} color={typeInfo.color} />
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm font-black text-foreground">{inv.roi}%</span>
                  <p className="text-[10px] text-muted-foreground font-medium">{inv.duration} {inv.durationUnit}</p>
                </td>
                <td className="py-4 px-4">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: `${riskInfo.color}15`, color: riskInfo.color }}
                  >
                    {riskInfo.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground">{formatDate(inv.createdAt)}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => onView?.(inv)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit?.(inv)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleFeatured?.(inv)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-muted-foreground hover:text-yellow-500 transition-all cursor-pointer"
                      title={inv.featured ? "Unfeature" : "Feature"}
                    >
                      {inv.featured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => onDelete?.(inv)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}