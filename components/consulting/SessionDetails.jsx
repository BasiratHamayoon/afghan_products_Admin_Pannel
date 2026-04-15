// components/consulting/SessionDetails.jsx

"use client";

import { motion } from "framer-motion";
import {
  Hash, Calendar, Clock, DollarSign, Users,
  Video, Phone, MessageSquare, Star, FileText, Link,
  CheckCircle, XCircle, Loader, AlertCircle,
} from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDateTime, formatDate } from "@/lib/helpers";
import { sessionFormatOptions, sessionTypeOptions } from "@/data/dummyConsulting";

function PaymentBadge({ status }) {
  const config = {
    paid: { bg: "rgba(16,185,129,0.1)", color: "#10b981", label: "Paid" },
    pending: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", label: "Pending" },
    refunded: { bg: "rgba(99,102,241,0.1)", color: "#6366f1", label: "Refunded" },
    failed: { bg: "rgba(239,68,68,0.1)", color: "#ef4444", label: "Failed" },
  };
  const c = config[status] || config.pending;
  return (
    <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function FormatIcon({ format, size = "h-4 w-4" }) {
  const icons = { video: Video, phone: Phone, chat: MessageSquare, "in-person": Users };
  const Icon = icons[format] || Video;
  return <Icon className={size} />;
}

function StarRatingDisplay({ rating }) {
  if (!rating) return <span className="text-sm font-medium text-muted-foreground">No rating yet</span>;
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-4 w-4 ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-white/10"}`} />
      ))}
      <span className="text-sm font-bold text-foreground ml-1">{rating}.0</span>
    </div>
  );
}

export default function SessionDetails({ session }) {
  if (!session) return null;

  const ses = session;
  const formatOpt = sessionFormatOptions.find((f) => f.value === ses.format) || sessionFormatOptions[0];
  const typeOpt = sessionTypeOptions.find((t) => t.value === ses.type) || sessionTypeOptions[0];

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
        <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Session Info</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Session ID", value: ses.id, icon: Hash },
            { label: "Format", value: (
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                <FormatIcon format={ses.format} />
                {formatOpt.label}
              </span>
            ), icon: null },
            { label: "Type", value: typeOpt.label, icon: Users },
            { label: "Status", value: <StatusBadge status={ses.status} />, icon: null },
            { label: "Category", value: ses.category, icon: null },
            { label: "Payment", value: <PaymentBadge status={ses.paymentStatus} />, icon: null },
            { label: "Price", value: `$${ses.price}`, icon: DollarSign },
            { label: "Duration", value: `${ses.duration} ${ses.durationUnit}`, icon: Clock },
            { label: "Scheduled At", value: formatDateTime(ses.scheduledAt), icon: Calendar },
            { label: "Started At", value: ses.startedAt ? formatDateTime(ses.startedAt) : "Not started", icon: Calendar },
            { label: "Ended At", value: ses.endedAt ? formatDateTime(ses.endedAt) : "Not ended", icon: Calendar },
            { label: "Created At", value: formatDateTime(ses.createdAt), icon: Calendar },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
              {item.icon && (
                <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(15,105,176,0.08)" }}>
                  <item.icon className="h-4 w-4 text-[#0F69B0]" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{item.label}</p>
                <div className="text-sm font-bold text-foreground break-all">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
        <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-4">Participants</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Consultant</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center text-sm font-black text-[#0F69B0]">
                {ses.consultantName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{ses.consultantName}</p>
                <p className="text-[11px] text-[#0F69B0] font-semibold">Consultant</p>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Client</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-sm font-black text-purple-500">
                {ses.clientName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{ses.clientName}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{ses.clientEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ses.description && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Description</h4>
          <p className="text-sm font-medium text-foreground leading-relaxed">{ses.description}</p>
        </div>
      )}

      {ses.notes && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Internal Notes</h4>
          <p className="text-sm font-medium text-foreground leading-relaxed">{ses.notes}</p>
        </div>
      )}

      <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
        <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Rating & Review</h4>
        <StarRatingDisplay rating={ses.rating} />
        {ses.review && (
          <p className="text-sm font-medium text-foreground leading-relaxed mt-3 p-3 rounded-xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] italic">
            "{ses.review}"
          </p>
        )}
      </div>

      {ses.tags && ses.tags.length > 0 && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Tags</h4>
          <div className="flex flex-wrap gap-2">
            {ses.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#0F69B0]/10 text-[#0F69B0]">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {ses.meetingLink && (
        <div className="rounded-xl p-5 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06]">
          <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-3">Meeting Link</h4>
          <a href={ses.meetingLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#0F69B0] text-sm font-bold hover:underline">
            <Link className="h-4 w-4" />
            {ses.meetingLink}
          </a>
        </div>
      )}
    </div>
  );
}