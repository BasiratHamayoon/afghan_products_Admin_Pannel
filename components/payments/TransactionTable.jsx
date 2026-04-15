"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, RefreshCw,
  DollarSign,
} from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/formatters";
import { formatDate } from "@/lib/helpers";

const typeConfig = {
  payment: { label: "Payment", bg: "rgba(15,105,176,0.1)", text: "#0F69B0", icon: DollarSign },
  withdrawal: { label: "Withdrawal", bg: "rgba(245,158,11,0.1)", text: "#f59e0b", icon: ArrowUpRight },
  refund: { label: "Refund", bg: "rgba(239,68,68,0.1)", text: "#ef4444", icon: RefreshCw },
  deposit: { label: "Deposit", bg: "rgba(16,185,129,0.1)", text: "#10b981", icon: ArrowDownRight },
};

const statusConfig = {
  completed: { label: "Completed", bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  pending: { label: "Pending", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  failed: { label: "Failed", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  processing: { label: "Processing", bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
};

const methodLabels = {
  wallet: "Wallet",
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Money",
  cash: "Cash",
};

export default function TransactionTable({ transactions = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {[
              "Transaction",
              "Type",
              "From",
              "To",
              "Amount",
              "Method",
              "Status",
              "Date",
            ].map((h) => (
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
          {transactions.map((txn, i) => {
            if (!txn?.id) return null;
            const type = typeConfig[txn.type] || typeConfig.payment;
            const TypeIcon = type.icon;
            const status = statusConfig[txn.status] || statusConfig.pending;

            return (
              <motion.tr
                key={txn.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: type.bg }}
                    >
                      <TypeIcon className="h-4 w-4" style={{ color: type.text }} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-foreground">
                        {txn.transactionId}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px] mt-0.5">
                        {txn.description}
                      </p>
                      {txn.orderId && (
                        <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5">
                          {txn.orderId}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{ background: type.bg, color: type.text }}
                  >
                    {type.label}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {txn.from?.avatar ? (
                      <img
                        src={txn.from.avatar}
                        alt={txn.from.name}
                        className="h-7 w-7 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-white/[0.08]"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center text-[10px] font-black text-[#0F69B0] shrink-0">
                        {getInitials(txn.from?.name || "?")}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-foreground whitespace-nowrap">
                        {txn.from?.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground capitalize">
                        {txn.from?.role}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    {txn.to?.avatar ? (
                      <img
                        src={txn.to.avatar}
                        alt={txn.to.name}
                        className="h-7 w-7 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-white/[0.08]"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-lg bg-[#0F69B0]/10 flex items-center justify-center text-[10px] font-black text-[#0F69B0] shrink-0">
                        {getInitials(txn.to?.name || "?")}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-foreground whitespace-nowrap">
                        {txn.to?.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground capitalize">
                        {txn.to?.role}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-black text-foreground whitespace-nowrap">
                    {formatCurrency(txn.amount)}
                  </p>
                  {txn.fee > 0 && (
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      Fee: {formatCurrency(txn.fee)}
                    </p>
                  )}
                  <p className="text-[10px] text-[#0F69B0] font-semibold whitespace-nowrap">
                    Net: {formatCurrency(txn.netAmount)}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {methodLabels[txn.paymentMethod] || txn.paymentMethod}
                  </p>
                  {txn.gateway && (
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {txn.gateway}
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{ background: status.bg, color: status.text }}
                  >
                    {status.label}
                  </span>
                  {txn.refunded && (
                    <p className="text-[10px] text-purple-500 font-semibold mt-0.5">
                      Refunded
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {formatDate(txn.createdAt)}
                  </p>
                  {txn.completedAt && (
                    <p className="text-[10px] text-green-600 dark:text-green-400 font-medium whitespace-nowrap mt-0.5">
                      Done: {formatDate(txn.completedAt)}
                    </p>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}