"use client";

import { useState, useEffect } from "react";
import {
  X, FileText, CheckCircle, XCircle, Loader2,
  MapPin, DollarSign, Building2, User, Mail, Handshake,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function formatAmount(amount) {
  if (!amount && amount !== 0) return "—";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

export default function ReviewRequestModal({ open, item, action, onClose, onSubmit, isLoading }) {
  const { t } = useTranslation();
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    if (open) setAdminNote(item?.adminNote || "");
  }, [open, item]);

  if (!open || !item) return null;

  const APPROVAL_CONFIG = {
    PENDING: { label: t("partners.approvalPending"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    APPROVED: { label: t("partners.approvalApproved"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    REJECTED: { label: t("partners.approvalRejected"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  };

  const approval = APPROVAL_CONFIG[item.approvalStatus] || APPROVAL_CONFIG.PENDING;

  const handleSubmit = (status) => { onSubmit(status, adminNote); };

  const fields = [
    { label: t("partners.categoryField"), value: item.businessCategory || "—", icon: Building2 },
    { label: t("partners.partnershipTypeField"), value: item.partnershipType || "—", icon: Handshake },
    { label: t("partners.investmentRange"), value: `${formatAmount(item.investmentRange?.min)} - ${formatAmount(item.investmentRange?.max)}`, icon: DollarSign },
    { label: t("partners.equityOffered"), value: `${item.equityOffered?.min ?? "—"}% - ${item.equityOffered?.max ?? "—"}%`, icon: FileText },
    { label: t("partners.ownerField"), value: item.userName || "—", icon: User },
    { label: "Email", value: item.userEmail || "—", icon: Mail },
    { label: t("partners.submittedDate"), value: formatDate(item.createdAt), icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 flex items-center justify-between shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-white/80" />
            <span className="text-sm font-bold text-white">{t("partners.partnershipRequest")}</span>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-black text-foreground">{item.companyName}</h3>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground font-medium">
                <MapPin className="h-3 w-3" />
                {[item.city, item.country].filter(Boolean).join(", ") || "—"}
              </div>
            </div>
            <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full", approval.bg, approval.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", approval.dot)} />{approval.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fields.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.label} className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="h-3 w-3 text-muted-foreground/60" />
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{f.label}</p>
                  </div>
                  <p className="text-xs font-bold text-foreground break-all">{f.value}</p>
                </div>
              );
            })}
          </div>

          {item.projectDescription && (
            <div className="p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">{t("partners.projectDescription")}</p>
              <p className="text-sm text-foreground font-medium leading-relaxed">{item.projectDescription}</p>
            </div>
          )}

          {item.adminNote && (
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 bg-blue-50/50 dark:bg-blue-900/10">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">{t("partners.previousAdminNote")}</p>
              <p className="text-sm text-foreground font-medium leading-relaxed">{item.adminNote}</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-widest">{t("partners.adminNote")}</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder={t("partners.adminNotePlaceholder")}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 cursor-text resize-none focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] disabled:opacity-60"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center gap-2 flex-wrap shrink-0">
          {item.approvalStatus !== "APPROVED" && (
            <button onClick={() => handleSubmit("approved")} disabled={isLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 cursor-pointer border border-emerald-200 dark:border-emerald-800/40 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              {t("partners.approve")}
            </button>
          )}
          {item.approvalStatus !== "REJECTED" && (
            <button onClick={() => handleSubmit("rejected")} disabled={isLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40 disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              {t("partners.reject")}
            </button>
          )}
          <button onClick={onClose} className="ms-auto px-4 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
            {t("partners.close")}
          </button>
        </div>
      </div>
    </div>
  );
}