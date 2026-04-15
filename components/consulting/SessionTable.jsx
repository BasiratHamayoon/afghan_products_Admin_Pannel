// components/consulting/SessionTable.jsx

"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, Video, Phone, MessageSquare, Users } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/helpers";
import { sessionFormatOptions } from "@/data/dummyConsulting";

function FormatIcon({ format }) {
  const icons = { video: Video, phone: Phone, chat: MessageSquare, "in-person": Users };
  const Icon = icons[format] || Video;
  return <Icon className="h-3.5 w-3.5" />;
}

function PaymentBadge({ status }) {
  const config = {
    paid: { bg: "rgba(16,185,129,0.1)", color: "#10b981", label: "Paid" },
    pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Pending" },
    refunded: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Refunded" },
    failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Failed" },
  };
  const c = config[status] || config.pending;
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function SessionTable({ sessions, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Session", "Consultant", "Client", "Scheduled", "Duration", "Price", "Payment", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(sessions || []).map((ses, i) => (
            <motion.tr
              key={ses.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center text-[#0F69B0] shrink-0">
                    <FormatIcon format={ses.format} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate max-w-[180px]">{ses.title}</p>
                    <span className="text-[10px] font-bold text-muted-foreground capitalize">{ses.type}</span>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center text-xs font-black text-[#0F69B0] shrink-0">
                    {ses.consultantName?.charAt(0) || "?"}
                  </div>
                  <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{ses.consultantName}</p>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-xs font-black text-purple-500 shrink-0">
                    {ses.clientName?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate max-w-[100px]">{ses.clientName}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">{ses.clientEmail}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{formatDate(ses.scheduledAt)}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-bold text-foreground">{ses.duration}</span>
                <span className="text-[10px] text-muted-foreground font-medium ml-1">{ses.durationUnit}</span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-black text-foreground">${ses.price}</span>
              </td>
              <td className="py-4 px-4">
                <PaymentBadge status={ses.paymentStatus} />
              </td>
              <td className="py-4 px-4">
                <StatusBadge status={ses.status} />
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onView?.(ses)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="View">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onEdit?.(ses)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete?.(ses)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete">
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