"use client";

import { motion } from "framer-motion";
import { Eye, Trash2, MapPin, Package, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function TradeLeadTable({ leads = [], onView, onDelete, onUpdateStatus }) {
  const { t } = useTranslation();
  const safeLeads = Array.isArray(leads) ? leads.filter(Boolean) : [];
  if (safeLeads.length === 0) return null;

  const urgencyConfig = {
    HIGH: { label: t("tradeLeads.urgencyHigh"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
    MEDIUM: { label: t("tradeLeads.urgencyMedium"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    LOW: { label: t("tradeLeads.urgencyLow"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  };

  const statusConfig = {
    PENDING: { label: t("tradeLeads.statusPending"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    APPROVED: { label: t("tradeLeads.statusApproved"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    REJECTED: { label: t("tradeLeads.statusRejected"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
    EXPIRED: { label: t("tradeLeads.statusExpired"), bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" },
  };

  const headers = [
    t("tradeLeads.product"),
    t("tradeLeads.category"),
    t("tradeLeads.quantity"),
    t("tradeLeads.budget"),
    t("tradeLeads.location"),
    t("tradeLeads.urgency"),
    t("tradeLeads.status"),
    t("tradeLeads.postedBy"),
    t("tradeLeads.date"),
    t("tradeLeads.actions"),
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
          {safeLeads.map((lead, i) => {
            if (!lead?.id) return null;
            const urgency = urgencyConfig[lead.urgency] || urgencyConfig.LOW;
            const status = statusConfig[lead.status] || statusConfig.PENDING;
            const isPending = lead.status === "PENDING";

            return (
              <motion.tr
                key={lead.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate max-w-[150px]">{lead.productName || "—"}</p>
                    {lead.detailDescription && (
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[150px]">{lead.detailDescription}</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">{lead.categoryName || "—"}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">{lead.quantity} {lead.unit}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-xs font-bold text-foreground whitespace-nowrap">
                    {Number(lead.minBudget).toLocaleString()} – {Number(lead.maxBudget).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{t("tradeLeads.minMax")}</p>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate max-w-[110px]">{lead.location || "—"}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", urgency.bg, urgency.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", urgency.dot)} />
                    {urgency.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", status.bg, status.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                    {status.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                      {getInitials(lead.createdByName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate max-w-[100px]">{lead.createdByName || "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">{lead.createdByEmail || ""}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{formatDate(lead.createdAt)}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("tradeLeads.view")}>
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {isPending && (
                      <>
                        <button onClick={() => onUpdateStatus?.(lead, "APPROVED")} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer" title={t("tradeLeads.approve")}>
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => onUpdateStatus?.(lead, "REJECTED")} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("tradeLeads.reject")}>
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button onClick={() => onDelete?.(lead)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("tradeLeads.delete")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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