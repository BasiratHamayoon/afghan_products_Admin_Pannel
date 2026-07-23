"use client";

import { motion } from "framer-motion";
import { Package, User, XCircle, DollarSign, Hash } from "lucide-react";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function OrderItemCard({ item, index = 0, onReject }) {
  const { t } = useTranslation();
  if (!item) return null;

  const itemStatusConfig = {
    PENDING: { label: t("orders.statusPending"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    CONFIRMED: { label: t("orders.statusConfirmed"), bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
    REJECTED: { label: t("orders.statusRejected"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
    SHIPPED: { label: t("orders.statusShipped"), bg: "bg-purple-500/10", text: "text-purple-600", dot: "bg-purple-500" },
    DELIVERED: { label: t("orders.statusDelivered"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  };

  const status = itemStatusConfig[item.status] || itemStatusConfig.PENDING;
  const imageUrl = item.productImage ? getFileUrl(item.productImage) : null;
  const canReject = item.status === "PENDING" || item.status === "CONFIRMED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
    >
      <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={item.productName} className="h-full w-full object-cover rounded-xl" />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-black text-foreground truncate">{item.productName || "—"}</p>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <Hash className="h-3 w-3" />{t("orders.qty")} {item.quantity}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                <DollarSign className="h-3 w-3" />AFN {Number(item.unitPrice).toLocaleString()} {t("orders.each")}
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-foreground">
                <DollarSign className="h-3 w-3 text-[#0F69B0]" />AFN {Number(item.totalPrice).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", status.bg, status.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />{status.label}
            </span>
            {canReject && onReject && (
              <button onClick={() => onReject?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("orders.rejectItem")}>
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {item.sellerName && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-white/[0.04]">
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[8px] font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              {getInitials(item.sellerName)}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground truncate">{t("orders.seller")} {item.sellerName}</p>
              {item.sellerEmail && <p className="text-[10px] text-muted-foreground/60 truncate">({item.sellerEmail})</p>}
            </div>
          </div>
        )}

        {item.status === "REJECTED" && item.rejectionReason && (
          <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-0.5">{t("orders.rejectionReason")}</p>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{item.rejectionReason}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}