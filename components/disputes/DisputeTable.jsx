"use client";

import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, ChevronRight, AlertTriangle } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/helpers";
import { disputeTypeOptions, disputePriorityOptions } from "@/data/dummyDisputes";
import { cn } from "@/lib/utils";

function PriorityBadge({ priority }) {
  const opt = disputePriorityOptions.find((p) => p.value === priority);
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${opt?.color || "#6b7280"}15`, color: opt?.color || "#6b7280" }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: opt?.color || "#6b7280" }} />
      {opt?.label || priority}
    </span>
  );
}

function TypeBadge({ type }) {
  const opt = disputeTypeOptions.find((t) => t.value === type);
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${opt?.color || "#6b7280"}15`, color: opt?.color || "#6b7280" }}>
      {opt?.label || type}
    </span>
  );
}

export default function DisputeTable({ disputes, onView, onDelete }) {
  if (!disputes || disputes.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Dispute", "Type", "Priority", "Amount", "Status", "Parties", "Created", "Actions"].map((h) => (
              <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {disputes.map((dispute, i) => (
            <motion.tr
              key={dispute.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => onView?.(dispute)}
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.08)" }}>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{dispute.title}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">#{dispute.orderId}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4"><TypeBadge type={dispute.type} /></td>
              <td className="py-4 px-4"><PriorityBadge priority={dispute.priority} /></td>
              <td className="py-4 px-4">
                <span className="text-sm font-black text-foreground">${dispute.amount?.toLocaleString()}</span>
                <p className="text-[10px] text-muted-foreground font-medium">{dispute.currency}</p>
              </td>
              <td className="py-4 px-4"><StatusBadge status={dispute.status} /></td>
              <td className="py-4 px-4">
                <div>
                  <p className="text-[11px] font-bold text-foreground">{dispute.buyer?.name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5"><ChevronRight className="h-2.5 w-2.5" />{dispute.seller?.name}</p>
                </div>
              </td>
              <td className="py-4 px-4"><span className="text-xs font-medium text-muted-foreground">{formatDate(dispute.createdAt)}</span></td>
              <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onView?.(dispute)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete?.(dispute)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}