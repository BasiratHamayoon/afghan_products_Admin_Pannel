"use client";

import { motion } from "framer-motion";
import { Eye, CheckCircle, XCircle, MapPin, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function formatAmount(amount) {
  if (!amount && amount !== 0) return "—";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

export default function PartnershipRequestsTable({ items = [], onView, onApprove, onReject }) {
  const { t } = useTranslation();
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  const APPROVAL_CONFIG = {
    PENDING: { label: t("partners.approvalPending"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    APPROVED: { label: t("partners.approvalApproved"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    REJECTED: { label: t("partners.approvalRejected"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  };

  const headers = [
    t("partners.company"),
    t("partners.category"),
    t("partners.partnershipType"),
    t("partners.investmentRange"),
    t("partners.equity"),
    t("partners.submittedBy"),
    t("partners.status"),
    t("partners.date"),
    t("partners.actions"),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {headers.map((h) => (
              <th key={h} className="text-start py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => {
            if (!item?.id) return null;
            const approval = APPROVAL_CONFIG[item.approvalStatus] || APPROVAL_CONFIG.PENDING;

            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate max-w-[140px]">{item.companyName || "—"}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-muted-foreground/50" />
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                        {[item.city, item.country].filter(Boolean).join(", ") || "—"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 capitalize">{item.businessCategory || "—"}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 capitalize whitespace-nowrap">{item.partnershipType || "—"}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {formatAmount(item.investmentRange?.min)} - {formatAmount(item.investmentRange?.max)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {item.equityOffered?.min ?? "—"}% - {item.equityOffered?.max ?? "—"}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate max-w-[120px]">{item.userName || "—"}</p>
                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">{item.userEmail || "—"}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", approval.bg, approval.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", approval.dot)} />{approval.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground">{formatDate(item.createdAt)}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("partners.view")}><Eye className="h-3.5 w-3.5" /></button>
                    {item.approvalStatus !== "APPROVED" && (
                      <button onClick={() => onApprove?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer" title={t("partners.approve")}><CheckCircle className="h-3.5 w-3.5" /></button>
                    )}
                    {item.approvalStatus !== "REJECTED" && (
                      <button onClick={() => onReject?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("partners.reject")}><XCircle className="h-3.5 w-3.5" /></button>
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