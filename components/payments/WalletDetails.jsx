"use client";

import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, Lock, Unlock, CheckCircle, XCircle, Building, CreditCard } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/formatters";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const statusConfig = {
  active: { label: "Active", bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  frozen: { label: "Frozen", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  suspended: { label: "Suspended", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
};

const roleConfig = {
  seller: { bg: "rgba(15,105,176,0.1)", text: "#0F69B0" },
  buyer: { bg: "rgba(124,58,237,0.1)", text: "#7c3aed" },
  admin: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

export default function WalletDetails({ wallets = [], onFreezeWallet }) {
  return (
    <div className="space-y-3">
      {wallets.map((wallet, i) => {
        if (!wallet?.id) return null;
        const status = statusConfig[wallet.status] || statusConfig.active;
        const role = roleConfig[wallet.userRole] || roleConfig.buyer;

        return (
          <motion.div
            key={wallet.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              "rounded-2xl border transition-all",
              wallet.frozen
                ? "border-red-200 dark:border-red-800/30 bg-red-50/30 dark:bg-red-900/5"
                : "border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420]"
            )}
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {wallet.userAvatar ? (
                      <img src={wallet.userAvatar} alt={wallet.userName} className="h-12 w-12 rounded-xl object-cover border border-gray-100 dark:border-white/[0.08]" />
                    ) : (
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                        {getInitials(wallet.userName)}
                      </div>
                    )}
                    {wallet.frozen && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center">
                        <Lock className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-foreground">{wallet.userName}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">{wallet.userEmail}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: role.bg, color: role.text }}>{wallet.userRole}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: status.bg, color: status.text }}>{status.label}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Balance</p>
                  <p className="text-2xl font-black text-foreground">{formatCurrency(wallet.balance)}</p>
                  {onFreezeWallet && (
                    <button
                      onClick={() => onFreezeWallet(wallet)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all mt-2 ml-auto",
                        wallet.frozen
                          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                          : "bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                      )}
                    >
                      {wallet.frozen ? <><Unlock className="h-3 w-3" /> Unfreeze</> : <><Lock className="h-3 w-3" /> Freeze</>}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: wallet.userRole === "seller" ? "Total Earned" : "Total Deposited", value: wallet.totalEarned || wallet.totalSpent, icon: ArrowDownRight, color: "#10b981", bg: "rgba(16,185,129,0.08)" },
                  { label: "Total Withdrawn", value: wallet.totalWithdrawn, icon: ArrowUpRight, color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
                  { label: "Total Spent", value: wallet.totalSpent, icon: TrendingUp, color: "#0F69B0", bg: "rgba(15,105,176,0.08)" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center mb-2" style={{ background: stat.bg }}>
                      <stat.icon className="h-3.5 w-3.5" style={{ color: stat.color }} />
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{stat.label}</p>
                    <p className="text-xs font-black text-foreground">{formatCurrency(stat.value || 0)}</p>
                  </div>
                ))}
              </div>

              {wallet.bankAccount && (
                <div className="p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-3.5 w-3.5 text-[#0F69B0]" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bank Account</p>
                    {wallet.bankAccount.verified ? (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 dark:text-green-400 ml-auto">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-orange-500 ml-auto">
                        <XCircle className="h-3 w-3" /> Unverified
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Bank</p>
                      <p className="text-[11px] font-bold text-foreground">{wallet.bankAccount.bankName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Account No.</p>
                      <p className="text-[11px] font-bold text-foreground font-mono">{wallet.bankAccount.accountNumber}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase">Account Holder</p>
                      <p className="text-[11px] font-bold text-foreground">{wallet.bankAccount.accountHolder}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                <p className="text-[10px] text-muted-foreground font-medium">Wallet ID: {wallet.id}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Last active: {formatDate(wallet.lastTransaction)}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}