"use client";

import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, CheckCircle, XCircle, MapPin, MessageSquare, Star, Clock, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { formatDate } from "@/lib/helpers";
import { tradeLeadTypeConfig, tradeLeadStatusConfig } from "@/data/dummyTradeLeads";
import { cn } from "@/lib/utils";

const priorityConfig = {
  high: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  medium: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  low: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

export default function TradeLeadTable({ leads = [], onView, onEdit, onDelete, onApprove, onClose, onToggleFeatured }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Lead", "Type", "Category", "Budget", "Status", "Responses", "Posted By", "Date", "Actions"].map((h) => (
              <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, i) => {
            if (!lead?.id) return null;
            const typeConfig = tradeLeadTypeConfig[lead.type] || tradeLeadTypeConfig.buy;
            const statusCfg = tradeLeadStatusConfig[lead.status] || tradeLeadStatusConfig.active;
            const pCfg = priorityConfig[lead.priority] || priorityConfig.medium;
            const isPending = lead.status === "pending";
            const isActive = lead.status === "active";

            return (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {lead.thumbnail ? (
                      <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] shrink-0">
                        <img src={lead.thumbnail} alt={lead.title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center text-lg shrink-0">
                        {typeConfig.icon}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate max-w-[180px]">{lead.title}</p>
                        {lead.featured && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[180px] mt-0.5">{lead.quantity}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: pCfg.bg, color: pCfg.text }}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: typeConfig.bg, color: typeConfig.text }}>
                    {typeConfig.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <p className="text-xs font-semibold text-foreground whitespace-nowrap">{lead.category}</p>
                  {lead.subCategory && <p className="text-[10px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap">{lead.subCategory}</p>}
                </td>
                <td className="py-4 px-4">
                  <p className="text-xs font-black text-foreground whitespace-nowrap">{formatCurrency(lead.budget)}</p>
                  {lead.budgetMin && lead.budgetMax && (
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">{formatCurrency(lead.budgetMin)} – {formatCurrency(lead.budgetMax)}</p>
                  )}
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: statusCfg.bg, color: statusCfg.text }}>
                    {statusCfg.label}
                  </span>
                  {lead.reportCount > 0 && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">{lead.reportCount} reports</p>
                  )}
                </td>
                <td className="py-4 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-[#0F69B0]" />
                      <span className="text-xs font-bold text-foreground">{lead.responses}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-[10px] text-muted-foreground font-medium">{lead.views} views</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 min-w-0">
                    {lead.user?.avatar ? (
                      <img src={lead.user.avatar} alt={lead.user.name} className="h-7 w-7 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-white/[0.08]" />
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center text-[10px] font-black text-[#0F69B0] shrink-0">
                        {lead.user?.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate max-w-[100px]">{lead.user?.name}</p>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-muted-foreground/50" />
                        <p className="text-[10px] text-muted-foreground">{lead.user?.city}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">{formatDate(lead.createdAt)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5 text-muted-foreground/50" />
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">Exp: {formatDate(lead.expiresAt)}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 transition-opacity">
                    <button onClick={() => onView?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="View">
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onEdit?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit">
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => onToggleFeatured?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-muted-foreground hover:text-yellow-500 transition-all cursor-pointer" title={lead.featured ? "Unfeature" : "Feature"}>
                      <Star className={cn("h-3.5 w-3.5", lead.featured && "fill-yellow-400 text-yellow-400")} />
                    </button>
                    {isPending && (
                      <button onClick={() => onApprove?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-all cursor-pointer" title="Approve">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {isActive && (
                      <button onClick={() => onClose?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] text-muted-foreground hover:text-gray-600 transition-all cursor-pointer" title="Close">
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button onClick={() => onDelete?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete">
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