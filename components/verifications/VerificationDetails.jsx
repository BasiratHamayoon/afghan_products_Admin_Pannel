"use client";

import { motion } from "framer-motion";
import {
  User, Building, FileText, MessageSquare,
  Calendar, Clock, CheckCircle,
  MapPin, Phone, Globe, Hash, Shield,
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/helpers";
import { getInitials } from "@/lib/formatters";
import {
  priorityConfig, verificationTypeLabels,
  documentTypeLabels,
} from "@/data/dummyVerifications";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending Review", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
};

function ScoreMeter({ score = 0 }) {
  const color =
    score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 80 ? "Strong" : score >= 60 ? "Moderate" : "Weak";

  return (
    <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-foreground">Verification Score</p>
        <div className="flex items-center gap-1">
          <span className="text-xl font-black" style={{ color }}>
            {score}
          </span>
          <span className="text-xs font-bold text-muted-foreground">/100</span>
        </div>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      <p className="text-[10px] font-bold" style={{ color }}>
        {label} verification profile
      </p>
    </div>
  );
}

function DocumentsSummary({ documents = [] }) {
  const verified = documents.filter((d) => d.verified).length;
  const total = documents.length;
  const percent = total > 0 ? Math.round((verified / total) * 100) : 0;

  return (
    <div className="p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
          <FileText className="h-4 w-4 text-[#0F69B0]" />
        </div>
        <h3 className="text-sm font-black text-foreground">
          Documents Summary
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
          <p className="text-xl font-black text-foreground">{total}</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-0.5">
            Total
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30">
          <p className="text-xl font-black text-green-600 dark:text-green-400">
            {verified}
          </p>
          <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wide mt-0.5">
            Verified
          </p>
        </div>
        <div className="text-center p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30">
          <p className="text-xl font-black text-yellow-600 dark:text-yellow-400">
            {total - verified}
          </p>
          <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide mt-0.5">
            Pending
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Verification Progress
          </p>
          <p className="text-[11px] font-black text-foreground">{percent}%</p>
        </div>
        <div className="h-2.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background:
                percent === 100
                  ? "#10b981"
                  : percent >= 50
                  ? "#0F69B0"
                  : "#f59e0b",
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {documents.map((doc, i) => (
          <div
            key={doc.id || i}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]"
          >
            <div
              className={cn(
                "h-6 w-6 rounded-lg flex items-center justify-center shrink-0",
                doc.verified
                  ? "bg-green-100 dark:bg-green-900/30"
                  : "bg-yellow-50 dark:bg-yellow-900/20"
              )}
            >
              <CheckCircle
                className={cn(
                  "h-3.5 w-3.5",
                  doc.verified
                    ? "text-green-600 dark:text-green-400"
                    : "text-yellow-500"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground truncate">
                {doc.name}
              </p>
              <p className="text-[9px] text-muted-foreground font-medium">
                {documentTypeLabels[doc.type] || doc.type}
              </p>
            </div>
            <span
              className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0",
                doc.verified
                  ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
              )}
            >
              {doc.verified ? "✓ Verified" : "Pending"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VerificationDetails({ verification }) {
  if (!verification) return null;

  const status = statusConfig[verification.status] || statusConfig.pending;
  const priority =
    priorityConfig[verification.priority] || priorityConfig.medium;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="sm:col-span-2 lg:col-span-1 rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] flex flex-col items-center text-center relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 right-0 h-16"
            style={{
              background: `linear-gradient(135deg, ${status.text}20 0%, transparent 100%)`,
            }}
          />

          <div className="relative mb-3 mt-4">
            {verification.userAvatar ? (
              <img
                src={verification.userAvatar}
                alt={verification.userName}
                className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                style={{ border: "3px solid white" }}
              />
            ) : (
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                  border: "3px solid white",
                }}
              >
                {getInitials(verification.userName)}
              </div>
            )}
          </div>

          <h3 className="text-sm font-black text-foreground mb-1">
            {verification.userName}
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium mb-3">
            {verification.userEmail}
          </p>

          <div className="flex items-center gap-2 flex-wrap justify-center mb-4">
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: status.bg, color: status.text }}
            >
              {status.label}
            </span>
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: priority.bg, color: priority.text }}
            >
              {priority.label} Priority
            </span>
          </div>

          <div className="w-full space-y-2 text-left">
            {[
              {
                icon: Shield,
                label:
                  verificationTypeLabels[verification.type] ||
                  verification.type,
              },
              {
                icon: Calendar,
                label: `Submitted ${formatDate(verification.submittedAt)}`,
              },
              verification.reviewedAt && {
                icon: Clock,
                label: `Reviewed ${formatDate(verification.reviewedAt)}`,
              },
              verification.reviewedBy && {
                icon: User,
                label: `By ${verification.reviewedBy}`,
              },
            ]
              .filter(Boolean)
              .map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <item.icon className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                  <span className="text-muted-foreground font-medium">
                    {item.label}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="sm:col-span-2 lg:col-span-2 space-y-4"
        >
          <ScoreMeter score={verification.score} />
          <DocumentsSummary documents={verification.documents || []} />
        </motion.div>
      </div>

      {verification.business && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center">
              <Building className="h-4 w-4 text-[#0F69B0]" />
            </div>
            <h3 className="text-sm font-black text-foreground">
              Business Information
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                label: "Business Name",
                value: verification.business.name,
                icon: Building,
              },
              {
                label: "Category",
                value: verification.business.category,
                icon: Hash,
              },
              {
                label: "Registration No.",
                value: verification.business.registrationNumber,
                icon: FileText,
              },
              {
                label: "Year Established",
                value: verification.business.yearEstablished,
                icon: Calendar,
              },
              {
                label: "Employees",
                value: verification.business.employeeCount,
                icon: User,
              },
              {
                label: "Phone",
                value: verification.business.phone,
                icon: Phone,
              },
              {
                label: "Address",
                value: verification.business.address,
                icon: MapPin,
                full: true,
              },
              verification.business.website && {
                label: "Website",
                value: verification.business.website,
                icon: Globe,
                full: true,
              },
            ]
              .filter(Boolean)
              .map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]",
                    item.full && "sm:col-span-2"
                  )}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <item.icon className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-xs font-bold text-foreground break-all">
                    {item.value || "N/A"}
                  </p>
                </div>
              ))}
            {verification.business.description && (
              <div className="sm:col-span-2 p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Description
                </p>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  {verification.business.description}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {verification.notes && verification.notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-[#0F69B0]" />
            </div>
            <h3 className="text-sm font-black text-foreground">
              Review Notes ({verification.notes.length})
            </h3>
          </div>
          <div className="space-y-3">
            {verification.notes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.04]"
              >
                <div className="h-7 w-7 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-black text-[#0F69B0]">
                    {getInitials(note.author)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-[11px] font-bold text-foreground">
                      {note.author}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {note.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {verification.status === "rejected" && verification.rejectionReason && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-5 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <FileText className="h-4 w-4 text-red-500" />
            </div>
            <h3 className="text-sm font-black text-red-700 dark:text-red-400">
              Rejection Reason
            </h3>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium leading-relaxed">
            {verification.rejectionReason}
          </p>
        </motion.div>
      )}
    </div>
  );
}