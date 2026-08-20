"use client";

import { motion } from "framer-motion";
import { Eye, Trash2, CheckCircle, XCircle, MapPin, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function formatAmount(amount) {
  if (!amount && amount !== 0) return "—";
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`;
  return `$${amount}`;
}

const resolveField = (multiObj, flatFallback, lang) => {
  if (multiObj && typeof multiObj === "object" && !Array.isArray(multiObj)) {
    return multiObj[lang] || multiObj.en || multiObj.fa || multiObj.ps || (typeof flatFallback === "string" ? flatFallback : "") || "";
  }
  return typeof flatFallback === "string" ? flatFallback : "";
};

export default function InvestmentsTable({ items = [], onView, onApprove, onReject, onDelete }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  const APPROVAL_CONFIG = {
    PENDING: { label: t("investments.approvalPending"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    APPROVED: { label: t("investments.approvalApproved"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    REJECTED: { label: t("investments.approvalRejected"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
  };

  const RISK_CONFIG = {
    low: { label: t("investments.riskLow"), cls: "bg-emerald-500/10 text-emerald-600" },
    medium: { label: t("investments.riskMedium"), cls: "bg-amber-500/10 text-amber-600" },
    high: { label: t("investments.riskHigh"), cls: "bg-red-500/10 text-red-500" },
  };

  const headers = [
    t("investments.investment"),
    t("investments.category"),
    t("investments.risk"),
    t("investments.amount"),
    t("investments.roi"),
    t("investments.location"),
    t("investments.approval"),
    t("investments.created"),
    t("investments.actions"),
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
            const risk = RISK_CONFIG[item.riskLevel] || RISK_CONFIG.medium;
            const imgUrl = item.images?.[0] ? getFileUrl(item.images[0]) : null;

            const displayTitle = resolveField(item.titleMultilingual, item.title, lang) || "—";
            const displayCategory = resolveField(item.categoryMultilingual, item.category, lang) || "—";
            const displayBusinessName = resolveField(item.businessNameMultilingual, item.businessName, lang);
            const displayCity = resolveField(item.cityMultilingual, item.city, lang);
            const displayCountry = resolveField(item.countryMultilingual, item.country, lang);

            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] shrink-0 bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center">
                      {imgUrl ? (
                        <img src={imgUrl} alt={displayTitle} className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <span className="text-lg">💰</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[160px]">{displayTitle}</p>
                      {displayBusinessName && (
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[140px]">{displayBusinessName}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 capitalize whitespace-nowrap">
                    {displayCategory}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", risk.cls)}>{risk.label}</span>
                </td>

                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm font-bold text-foreground">{formatAmount(item.requiredAmount)}</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t("investments.raisedLabel")} {formatAmount(item.raisedAmount)}</p>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-sm font-bold text-foreground">{item.expectedROI}%</span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
                      {[displayCity, displayCountry].filter(Boolean).join(", ") || "—"}
                    </span>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", approval.bg, approval.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", approval.dot)} />
                    {approval.label}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground">{formatDate(item.createdAt)}</span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("investments.view")}><Eye className="h-3.5 w-3.5" /></button>
                    {item.approvalStatus !== "APPROVED" && (
                      <button onClick={() => onApprove?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer" title={t("investments.approve")}><CheckCircle className="h-3.5 w-3.5" /></button>
                    )}
                    {item.approvalStatus !== "REJECTED" && (
                      <button onClick={() => onReject?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("investments.reject")}><XCircle className="h-3.5 w-3.5" /></button>
                    )}
                    <button onClick={() => onDelete?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("investments.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
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