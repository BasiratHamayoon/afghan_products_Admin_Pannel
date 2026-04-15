"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Eye, X, RefreshCw, AlertTriangle } from "lucide-react";
import { formatCurrency, getInitials } from "@/lib/formatters";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: { label: "Pending", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  approved: { label: "Approved", bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  processing: { label: "Processing", bg: "rgba(99,102,241,0.1)", text: "#6366f1" },
};

const priorityConfig = {
  high: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  medium: { bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  low: { bg: "rgba(16,185,129,0.1)", text: "#10b981" },
};

export default function RefundForm({ refunds = [], onApprove, onReject }) {
  const [actionModal, setActionModal] = useState({ open: false, refund: null, action: null });
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageModal, setImageModal] = useState(null);

  const openActionModal = (refund, action) => {
    setActionModal({ open: true, refund, action });
    setNote("");
  };

  const handleConfirm = async () => {
    if (!actionModal.refund?.id) return;
    setIsProcessing(true);
    if (actionModal.action === "approve") await onApprove?.(actionModal.refund.id, note);
    else await onReject?.(actionModal.refund.id, note);
    setIsProcessing(false);
    setActionModal({ open: false, refund: null, action: null });
    setNote("");
  };

  return (
    <>
      <div className="space-y-4">
        {refunds.map((ref, i) => {
          if (!ref?.id) return null;
          const status = statusConfig[ref.status] || statusConfig.pending;
          const isPending = ref.status === "pending";
          const priority = priorityConfig[ref.priority] || priorityConfig.medium;

          return (
            <motion.div
              key={ref.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-3">
                    {ref.userAvatar ? (
                      <img src={ref.userAvatar} alt={ref.userName} className="h-11 w-11 rounded-xl object-cover border border-gray-100 dark:border-white/[0.08] shrink-0" />
                    ) : (
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-sm font-black text-white shrink-0" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" }}>
                        {getInitials(ref.userName)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-black text-foreground">{ref.userName}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: priority.bg, color: priority.text }}>{ref.priority}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">{ref.userEmail}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{ref.refundId} · {formatDate(ref.requestedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-foreground">{formatCurrency(ref.refundAmount)}</p>
                    <p className="text-[11px] text-muted-foreground">of {formatCurrency(ref.amount)}</p>
                    <span className="inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full mt-1" style={{ background: status.bg, color: status.text }}>{status.label}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Product</p>
                    <p className="text-xs font-bold text-foreground">{ref.productName}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Seller: {ref.sellerName}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{ref.transactionId}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Reason</p>
                    <p className="text-xs font-bold text-foreground">{ref.reason}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Customer Description</p>
                  <p className="text-xs font-medium text-foreground leading-relaxed">{ref.description}</p>
                </div>

                {ref.evidence?.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Evidence ({ref.evidence.length})</p>
                    <div className="flex gap-2 flex-wrap">
                      {ref.evidence.map((img, idx) => (
                        <div key={idx} onClick={() => setImageModal(img)} className="h-16 w-16 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] cursor-zoom-in hover:opacity-80 transition-opacity">
                          <img src={img} alt={`Evidence ${idx + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {ref.adminNote && (
                  <div className={cn("p-3 rounded-xl mb-4 border", ref.status === "rejected" ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30" : "bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30")}>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Admin Note</p>
                    <p className="text-xs font-medium text-foreground">{ref.adminNote}</p>
                    {ref.processedBy && <p className="text-[10px] text-muted-foreground mt-1">By: {ref.processedBy} · {formatDate(ref.processedAt)}</p>}
                  </div>
                )}

                {isPending && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => openActionModal(ref, "approve")} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-md shadow-green-500/20" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                      <CheckCircle className="h-4 w-4" /> Approve Refund
                    </button>
                    <button onClick={() => openActionModal(ref, "reject")} className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-red-500 cursor-pointer border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      <XCircle className="h-4 w-4" /> Reject Refund
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {imageModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setImageModal(null)}>
            <button onClick={() => setImageModal(null)} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 cursor-pointer"><X className="h-5 w-5" /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={imageModal} alt="Evidence" className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionModal.open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setActionModal({ open: false, refund: null, action: null })} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
              <div className="bg-white dark:bg-[#0f1420] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.08] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", actionModal.action === "approve" ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20")}>
                      {actionModal.action === "approve" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    </div>
                    <h3 className="text-base font-black text-foreground">{actionModal.action === "approve" ? "Approve Refund" : "Reject Refund"}</h3>
                  </div>
                  <button onClick={() => setActionModal({ open: false, refund: null, action: null })} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] cursor-pointer"><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] mb-4">
                  <p className="text-xs font-bold text-foreground">{actionModal.refund?.userName}</p>
                  <p className="text-[11px] text-muted-foreground">{actionModal.refund?.productName} · {formatCurrency(actionModal.refund?.refundAmount || 0)}</p>
                  <p className="text-[11px] text-muted-foreground">Reason: {actionModal.refund?.reason}</p>
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Admin Note {actionModal.action === "reject" && "*"}</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={actionModal.action === "approve" ? "Optional note for refund approval..." : "Reason for rejecting this refund..."} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 resize-none cursor-text transition-all focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)]" />
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActionModal({ open: false, refund: null, action: null })} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">Cancel</button>
                  <button onClick={handleConfirm} disabled={(actionModal.action === "reject" && !note.trim()) || isProcessing} className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg transition-all", actionModal.action === "approve" ? "shadow-green-500/20" : "shadow-red-500/20")} style={{ background: actionModal.action === "approve" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
                    {isProcessing ? "Processing..." : actionModal.action === "approve" ? "Confirm Approve" : "Confirm Reject"}
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