"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Eye, Clock, Building, Send, X, AlertTriangle } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/formatters";
import { formatDate, formatDateTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  completed: { label: "Completed", bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  processing: { label: "Processing", bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
};

const methodLabels = {
  bank_transfer: "Bank Transfer",
  mobile_money: "Mobile Money",
  cash: "Cash",
};

const priorityConfig = {
  high: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  medium: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  low: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

export default function WithdrawalRequests({ withdrawals = [], onApprove, onReject, onView }) {
  const [noteModal, setNoteModal] = useState({ open: false, withdrawal: null, action: null });
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const openNoteModal = (withdrawal, action) => {
    setNoteModal({ open: true, withdrawal, action });
    setNote("");
  };

  const handleConfirm = async () => {
    if (!noteModal.withdrawal?.id) return;
    setIsProcessing(true);
    if (noteModal.action === "approve") await onApprove?.(noteModal.withdrawal.id, note);
    else await onReject?.(noteModal.withdrawal.id, note);
    setIsProcessing(false);
    setNoteModal({ open: false, withdrawal: null, action: null });
    setNote("");
  };

  return (
    <>
      <div className="space-y-3">
        {withdrawals.map((wd, i) => {
          if (!wd?.id) return null;
          const status = statusConfig[wd.status] || statusConfig.pending;
          const isPending = wd.status === "pending";
          const priority = priorityConfig[wd.priority] || priorityConfig.medium;

          return (
            <motion.div
              key={wd.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] p-5 hover:border-[#0F69B0]/20 dark:hover:border-[#0F69B0]/15 transition-all"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {wd.userAvatar ? (
                      <img src={wd.userAvatar} alt={wd.userName} className="h-11 w-11 rounded-xl object-cover border border-gray-100 dark:border-white/[0.08]" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                        {getInitials(wd.userName)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-black text-foreground">{wd.userName}</p>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: priority.bg, color: priority.text }}>{wd.priority}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium">{wd.userEmail}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{wd.withdrawalId} · {formatDate(wd.requestedAt)}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-black text-foreground">{formatCurrency(wd.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">Fee: {formatCurrency(wd.fee)}</p>
                  <p className="text-[11px] text-[#0F69B0] font-semibold">Net: {formatCurrency(wd.netAmount)}</p>
                  <span className="inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full mt-1" style={{ background: status.bg, color: status.text }}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Building className="h-3.5 w-3.5 text-[#0F69B0]" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Bank Details</p>
                  </div>
                  <p className="text-xs font-bold text-foreground">{wd.bankDetails?.bankName}</p>
                  <p className="text-[11px] font-mono text-muted-foreground">{wd.bankDetails?.accountNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{wd.bankDetails?.accountHolder}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment Method</p>
                  <p className="text-xs font-bold text-foreground">{methodLabels[wd.method] || wd.method}</p>
                  {wd.notes && <p className="text-[11px] text-muted-foreground mt-1">{wd.notes}</p>}
                  {wd.processedBy && (
                    <p className="text-[10px] text-muted-foreground mt-1">By: {wd.processedBy} · {formatDate(wd.processedAt)}</p>
                  )}
                </div>
              </div>

              {wd.adminNote && (
                <div className={cn("p-3 rounded-xl mb-4 border", wd.status === "rejected" ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30" : "bg-blue-50 dark:bg-[#0F69B0]/5 border-blue-100 dark:border-[#0F69B0]/15")}>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Admin Note</p>
                  <p className="text-xs font-medium text-foreground">{wd.adminNote}</p>
                </div>
              )}

              {isPending && (
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={() => openNoteModal(wd, "approve")} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-md shadow-green-500/20 transition-all" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                    <CheckCircle className="h-4 w-4" /> Approve
                  </button>
                  <button onClick={() => openNoteModal(wd, "reject")} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-500 cursor-pointer border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {noteModal.open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setNoteModal({ open: false, withdrawal: null, action: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="bg-white dark:bg-[#0f1420] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.08] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", noteModal.action === "approve" ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20")}>
                      {noteModal.action === "approve" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <h3 className="text-base font-black text-foreground">{noteModal.action === "approve" ? "Approve Withdrawal" : "Reject Withdrawal"}</h3>
                  </div>
                  <button onClick={() => setNoteModal({ open: false, withdrawal: null, action: null })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] cursor-pointer"><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] mb-4">
                  <p className="text-xs font-bold text-foreground">{noteModal.withdrawal?.userName}</p>
                  <p className="text-[11px] text-muted-foreground">{noteModal.withdrawal?.withdrawalId} · {formatCurrency(noteModal.withdrawal?.amount || 0)}</p>
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Admin Note {noteModal.action === "reject" && "*"}</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={noteModal.action === "approve" ? "Optional note for approval..." : "Provide a reason for rejection..."} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 resize-none cursor-text transition-all focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNoteModal({ open: false, withdrawal: null, action: null })} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">Cancel</button>
                  <button onClick={handleConfirm} disabled={noteModal.action === "reject" && !note.trim() || isProcessing} className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition-all flex items-center justify-center gap-2", noteModal.action === "approve" ? "shadow-green-500/20" : "shadow-red-500/20")} style={{ background: noteModal.action === "approve" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
                    {isProcessing ? "Processing..." : noteModal.action === "approve" ? "Confirm Approve" : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}