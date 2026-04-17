"use client";

import { motion } from "framer-motion";
import {
  Eye, CheckCircle, XCircle, Clock,
  FileText, User, AlertTriangle,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getInitials } from "@/lib/formatters";
import { priorityConfig, verificationTypeLabels } from "@/data/dummyVerifications";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", bg: "rgba(245,158,11,0.1)", text: "#f59e0b", icon: Clock },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.1)", text: "#10b981", icon: CheckCircle },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.1)", text: "#ef4444", icon: XCircle },
};

export default function VerificationTable({ verifications = [], onView, onApprove, onReject }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Applicant", "Type", "Status", "Priority", "Documents", "Score", "Submitted", "Actions"].map((h) => (
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
          {verifications.map((ver, i) => {
            if (!ver?.id) return null;
            const status = statusConfig[ver.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            const priority = priorityConfig[ver.priority] || priorityConfig.medium;
            const verifiedDocs = (ver.documents || []).filter((d) => d.verified).length;
            const totalDocs = (ver.documents || []).length;
            const isPending = ver.status === "pending";

            return (
              <motion.tr
                key={ver.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {ver.userAvatar ? (
                        <img
                          src={ver.userAvatar}
                          alt={ver.userName}
                          className="h-10 w-10 rounded-xl object-cover border border-gray-100 dark:border-white/[0.08]"
                        />
                      ) : (
                        <div
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black text-white"
                          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                        >
                          {getInitials(ver.userName)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[140px]">{ver.userName}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px] mt-0.5">{ver.userEmail}</p>
                      <p className="text-[10px] font-semibold mt-0.5 capitalize" style={{ color: "#0F69B0" }}>
                        {ver.userRole}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {verificationTypeLabels[ver.type] || ver.type}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span
                    className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full w-fit whitespace-nowrap"
                    style={{ background: status.bg, color: status.text }}
                  >
                    <StatusIcon className="h-2.5 w-2.5" />
                    {status.label}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                    style={{ background: priority.bg, color: priority.text }}
                  >
                    {priority.label}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-foreground whitespace-nowrap">
                        {verifiedDocs}/{totalDocs} verified
                      </p>
                      <div className="h-1 w-16 rounded-full bg-gray-100 dark:bg-white/[0.06] mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#0F69B0] transition-all"
                          style={{ width: totalDocs > 0 ? `${(verifiedDocs / totalDocs) * 100}%` : "0%" }}
                        />
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <span
                      className="text-xs font-black"
                      style={{
                        color: ver.score >= 80 ? "#10b981" : ver.score >= 60 ? "#f59e0b" : "#ef4444",
                      }}
                    >
                      {ver.score}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">/100</span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {formatDate(ver.submittedAt)}
                  </p>
                  {ver.reviewedAt && (
                    <p className="text-[10px] text-muted-foreground/60 font-medium whitespace-nowrap mt-0.5">
                      Reviewed {formatDate(ver.reviewedAt)}
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 transition-opacity">
                    <button
                      onClick={() => onView?.(ver)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {isPending && (
                      <>
                        <button
                          onClick={() => onApprove?.(ver)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-all cursor-pointer"
                          title="Approve"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onReject?.(ver)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                          title="Reject"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </>
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