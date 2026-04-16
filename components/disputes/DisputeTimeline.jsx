"use client";

import { motion } from "framer-motion";
import {
  AlertCircle, CheckCircle, ArrowUpCircle, MessageSquare,
  FileText, User, Settings, Clock,
} from "lucide-react";
import { formatDateTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const actionConfig = {
  dispute_opened: { icon: AlertCircle, color: "#0F69B0", bg: "rgba(15,105,176,0.1)", label: "Dispute Opened" },
  evidence_submitted: { icon: FileText, color: "#7c3aed", bg: "rgba(124,58,237,0.1)", label: "Evidence Submitted" },
  assigned: { icon: User, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Assigned" },
  under_review: { icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Under Review" },
  seller_responded: { icon: MessageSquare, color: "#6366f1", bg: "rgba(99,102,241,0.1)", label: "Seller Responded" },
  seller_accepted: { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Seller Accepted" },
  escalated: { icon: ArrowUpCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Escalated" },
  refund_issued: { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Refund Issued" },
  resolved: { icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)", label: "Resolved" },
  closed: { icon: Settings, color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Closed" },
};

const roleColors = {
  buyer: "#0F69B0",
  seller: "#7c3aed",
  admin: "#10b981",
  system: "#6b7280",
};

export default function DisputeTimeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-xs text-muted-foreground font-medium">No timeline events yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {timeline.map((event, i) => {
        const config = actionConfig[event.action] || {
          icon: Clock,
          color: "#6b7280",
          bg: "rgba(107,114,128,0.1)",
          label: event.action,
        };
        const Icon = config.icon;
        const isLast = i === timeline.length - 1;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 border-white dark:border-[#0f1420]" style={{ background: config.bg }}>
                <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-gray-100 dark:bg-white/[0.06] my-1 min-h-[24px]" />}
            </div>

            <div className={cn("flex-1 pb-5", isLast && "pb-0")}>
              <div className="flex items-start justify-between gap-2 mb-0.5">
                <div>
                  <p className="text-xs font-black text-foreground">{config.label}</p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{event.description}</p>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[10px] font-bold" style={{ color: roleColors[event.role] || "#6b7280" }}>
                  {event.performedBy}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium capitalize">
                  · {event.role}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}