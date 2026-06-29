"use client";

import { motion } from "framer-motion";
import {
  Calendar, Clock, DollarSign, User,
  CheckCircle, XCircle, RotateCcw,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const SESSION_STATUS_CONFIG = {
  pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
  confirmed: { label: "Confirmed", bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
  completed: { label: "Completed", bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  cancelled: { label: "Cancelled", bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
};

export default function SessionsTable({
  items = [],
  onUpdateStatus,
  onCancel,
}) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {[
              "Session",
              "Consultant",
              "Client",
              "Date & Time",
              "Duration",
              "Amount",
              "Status",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => {
            if (!item?.id) return null;
            const statusCfg =
              SESSION_STATUS_CONFIG[item.status] ||
              SESSION_STATUS_CONFIG.pending;

            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                <td className="py-4 px-4">
                  <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">
                    #{(item.id || "").slice(-8).toUpperCase()}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1 max-w-[120px]">
                      {item.notes}
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                    {item.consultantName || "—"}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate max-w-[110px]">
                      {item.userName || "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[110px]">
                      {item.userEmail || "—"}
                    </p>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatDate(item.sessionDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground/50" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.sessionTime || "—"}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.durationHours}h
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-sm font-bold text-foreground">
                      {item.amount}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap",
                      statusCfg.bg,
                      statusCfg.text
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        statusCfg.dot
                      )}
                    />
                    {statusCfg.label}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    {item.status === "pending" && (
                      <button
                        onClick={() =>
                          onUpdateStatus?.(item, "confirmed")
                        }
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/20 text-muted-foreground hover:text-blue-600 transition-all cursor-pointer"
                        title="Confirm"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {item.status === "confirmed" && (
                      <button
                        onClick={() =>
                          onUpdateStatus?.(item, "completed")
                        }
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer"
                        title="Mark Completed"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(item.status === "pending" ||
                      item.status === "confirmed") && (
                      <button
                        onClick={() => onCancel?.(item)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                        title="Cancel"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
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