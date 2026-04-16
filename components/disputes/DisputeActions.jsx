"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowUpCircle, XCircle, UserCheck, DollarSign, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DisputeActions({ dispute, onResolve, onEscalate, onClose, onAssign, isLoading }) {
  const [activeAction, setActiveAction] = useState(null);
  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [assignName, setAssignName] = useState("");

  if (!dispute) return null;

  const isResolved = dispute.status === "resolved" || dispute.status === "closed";

  const handleResolve = async () => {
    if (!resolution.trim()) return;
    await onResolve?.(resolution.trim(), refundAmount ? Number(refundAmount) : null);
    setActiveAction(null);
    setResolution("");
    setRefundAmount("");
  };

  const handleEscalate = async () => {
    await onEscalate?.(escalateReason.trim() || "Dispute escalated for senior review");
    setActiveAction(null);
    setEscalateReason("");
  };

  const handleAssign = async () => {
    if (!assignName.trim()) return;
    await onAssign?.(assignName.trim());
    setActiveAction(null);
    setAssignName("");
  };

  const handleClose = async () => {
    await onClose?.();
    setActiveAction(null);
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none";

  return (
    <div className="space-y-3">
      {!isResolved && (
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setActiveAction(activeAction === "resolve" ? null : "resolve")}
            disabled={isLoading}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
              activeAction === "resolve"
                ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25"
                : "border-green-200 dark:border-green-800/50 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
            )}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Resolve
          </button>

          <button
            onClick={() => setActiveAction(activeAction === "escalate" ? null : "escalate")}
            disabled={isLoading || dispute.status === "escalated"}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
              activeAction === "escalate"
                ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/25"
                : "border-red-200 dark:border-red-800/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20",
              dispute.status === "escalated" && "opacity-50 cursor-not-allowed"
            )}
          >
            <ArrowUpCircle className="h-3.5 w-3.5" />
            Escalate
          </button>

          <button
            onClick={() => setActiveAction(activeAction === "assign" ? null : "assign")}
            disabled={isLoading}
            className={cn(
              "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
              activeAction === "assign"
                ? "bg-[#0F69B0] text-white border-[#0F69B0] shadow-lg shadow-[#0F69B0]/25"
                : "border-[#0F69B0]/30 text-[#0F69B0] hover:bg-[#0F69B0]/8"
            )}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Assign
          </button>

          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
          >
            <XCircle className="h-3.5 w-3.5" />
            Close
          </button>
        </div>
      )}

      {isResolved && (
        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 text-center">
          <p className="text-xs font-bold text-green-600">This dispute has been {dispute.status}</p>
        </div>
      )}

      {activeAction === "resolve" && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10 space-y-3">
          <p className="text-xs font-black text-green-600 uppercase tracking-widest">Resolve Dispute</p>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Describe the resolution..."
            rows={3}
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="Refund amount (optional)"
                className={cn(inputClass, "pl-9")}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveAction(null)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
              <X className="h-3.5 w-3.5" />Cancel
            </button>
            <button onClick={handleResolve} disabled={!resolution.trim() || isLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all" style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <Save className="h-3.5 w-3.5" />{isLoading ? "Saving..." : "Confirm Resolution"}
            </button>
          </div>
        </motion.div>
      )}

      {activeAction === "escalate" && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10 space-y-3">
          <p className="text-xs font-black text-red-500 uppercase tracking-widest">Escalate Dispute</p>
          <textarea
            value={escalateReason}
            onChange={(e) => setEscalateReason(e.target.value)}
            placeholder="Reason for escalation..."
            rows={3}
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveAction(null)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
              <X className="h-3.5 w-3.5" />Cancel
            </button>
            <button onClick={handleEscalate} disabled={isLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
              <ArrowUpCircle className="h-3.5 w-3.5" />{isLoading ? "Escalating..." : "Confirm Escalation"}
            </button>
          </div>
        </motion.div>
      )}

      {activeAction === "assign" && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-[#0F69B0]/20 bg-[#0F69B0]/5 space-y-3">
          <p className="text-xs font-black text-[#0F69B0] uppercase tracking-widest">Assign Dispute</p>
          <input
            type="text"
            value={assignName}
            onChange={(e) => setAssignName(e.target.value)}
            placeholder="Admin name to assign..."
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveAction(null)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground border border-gray-200 dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
              <X className="h-3.5 w-3.5" />Cancel
            </button>
            <button onClick={handleAssign} disabled={!assignName.trim() || isLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md shadow-[#0F69B0]/25 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
              <UserCheck className="h-3.5 w-3.5" />{isLoading ? "Assigning..." : "Confirm Assign"}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}