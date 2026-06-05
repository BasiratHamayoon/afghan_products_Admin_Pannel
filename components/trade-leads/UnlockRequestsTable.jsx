"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Mail, User, Link } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const statusConfig = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Approved",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-500/10",
    text: "text-red-500",
    dot: "bg-red-500",
  },
};

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UnlockRequestsTable({
  requests = [],
  onApprove,
  onReject,
}) {
  const safeRequests = Array.isArray(requests)
    ? requests.filter(Boolean)
    : [];
  if (safeRequests.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {[
              "Seller",
              "Trade Lead",
              "Request Status",
              "Requested At",
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
          {safeRequests.map((req, i) => {
            if (!req?.id) return null;
            const status =
              statusConfig[req.status] || statusConfig.PENDING;
            const isPending = req.status === "PENDING";

            return (
              <motion.tr
                key={req.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                {/* Seller */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                      }}
                    >
                      {getInitials(req.sellerName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate max-w-[130px]">
                        {req.sellerName || "—"}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground/50" />
                        <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[130px]">
                          {req.sellerEmail || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Trade Lead */}
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <Link className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate max-w-[150px]">
                      {req.tradeLeadProduct || req.tradeLeadId?.slice(0, 12) + "..." || "—"}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap",
                      status.bg,
                      status.text
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        status.dot
                      )}
                    />
                    {status.label}
                  </span>
                </td>

                {/* Date */}
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {formatDate(req.createdAt)}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-4 px-4">
                  {isPending ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onApprove?.(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </button>
                      <button
                        onClick={() => onReject?.(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-red-500 border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {req.status === "APPROVED" ? "✓ Approved" : "✗ Rejected"}
                    </span>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}