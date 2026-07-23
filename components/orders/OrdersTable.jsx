"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Trash2, DollarSign, ShoppingBag, Hash, Truck, CreditCard } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function OrdersTable({ orders = [], onView, onDelete }) {
  const { t, ready } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !ready || safeOrders.length === 0) return null;

  const statusConfig = {
    PENDING: { label: t("orders.statusPending"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" },
    CONFIRMED: { label: t("orders.statusConfirmed"), bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" },
    PROCESSING: { label: t("orders.statusProcessing"), bg: "bg-indigo-500/10", text: "text-indigo-600", dot: "bg-indigo-500" },
    SHIPPED: { label: t("orders.statusShipped"), bg: "bg-purple-500/10", text: "text-purple-600", dot: "bg-purple-500" },
    DELIVERED: { label: t("orders.statusDelivered"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
    CANCELLED: { label: t("orders.statusCancelled"), bg: "bg-red-500/10", text: "text-red-500", dot: "bg-red-500" },
    PARTIALLY_REJECTED: { label: t("orders.statusPartialReject"), bg: "bg-orange-500/10", text: "text-orange-600", dot: "bg-orange-500" },
    COMPLETED: { label: t("orders.statusCompleted"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" },
  };

  const paymentStatusConfig = {
    PAID: { label: t("orders.paymentPaid"), bg: "bg-emerald-500/10", text: "text-emerald-600" },
    UNPAID: { label: t("orders.paymentUnpaid"), bg: "bg-red-500/10", text: "text-red-500" },
    PENDING: { label: t("orders.paymentPending"), bg: "bg-amber-500/10", text: "text-amber-600" },
    REFUNDED: { label: t("orders.paymentRefunded"), bg: "bg-blue-500/10", text: "text-blue-600" },
  };

  const headers = [
    t("orders.orderNumber"),
    t("orders.buyer"),
    t("orders.items"),
    t("orders.payment"),
    t("orders.delivery"),
    t("orders.totalAFN"),
    t("orders.status"),
    t("orders.payStatus"),
    t("orders.date"),
    t("orders.actions"),
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
          {safeOrders.map((order, i) => {
            if (!order?.id) return null;
            const status = statusConfig[order.status] || statusConfig.PENDING;
            const paymentStatus = paymentStatusConfig[order.paymentStatus] || paymentStatusConfig.PENDING;
            const isPending = order.status === "PENDING";

            return (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-xs font-bold text-foreground whitespace-nowrap">
                      {order.orderNumber || order.id.slice(0, 8) + "..."}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                      {getInitials(order.buyerName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-foreground truncate max-w-[110px]">{order.buyerName || "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[110px]">{order.buyerEmail || ""}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-xs font-bold text-foreground">
                      {order.itemCount} <span className="font-medium text-muted-foreground">{order.itemCount !== 1 ? t("orders.itemPlural") : t("orders.item")}</span>
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-[10px] font-bold text-foreground whitespace-nowrap">{order.paymentMethod || "—"}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-[10px] font-bold text-foreground whitespace-nowrap">{order.deliveryMethod || "—"}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground/50" />
                    <span className="text-xs font-black text-foreground whitespace-nowrap">{Number(order.totalAmount).toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", status.bg, status.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />{status.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", paymentStatus.bg, paymentStatus.text)}>
                    {paymentStatus.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{formatDate(order.createdAt)}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(order)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("orders.viewDetails")}><Eye className="h-3.5 w-3.5" /></button>
                    {isPending && (
                      <button onClick={() => onDelete?.(order)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("orders.deleteOrder")}><Trash2 className="h-3.5 w-3.5" /></button>
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