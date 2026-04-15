"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, MessageSquare, Send, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

const REJECTION_REASONS = [
  "The submitted documents are expired or invalid.",
  "Document images are blurry or unclear.",
  "Business registration information does not match documents.",
  "Incomplete application — missing required documents.",
  "Suspected fraudulent documents.",
  "National ID does not match the applicant's name.",
  "Business license is not valid for the category selected.",
];

export default function VerificationActions({ verification, onApprove, onReject, onRequestInfo, isLoading }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!verification) return null;

  const isPending = verification.status === "pending";
  const allDocsVerified = verification.documents?.every((d) => d.verified);

  const handleApprove = async () => {
    if (!onApprove) return;
    setIsProcessing(true);
    await onApprove(verification.id);
    setIsProcessing(false);
  };

  const handleReject = async () => {
    const reason = customReason.trim() || rejectionReason;
    if (!reason) return;
    setIsProcessing(true);
    await onReject(verification.id, reason);
    setIsProcessing(false);
    setShowRejectModal(false);
    setRejectionReason("");
    setCustomReason("");
  };

  const handleNote = async () => {
    if (!noteText.trim()) return;
    setIsProcessing(true);
    await onRequestInfo(verification.id, noteText);
    setIsProcessing(false);
    setShowNoteModal(false);
    setNoteText("");
  };

  return (
    <>
      <div className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
        <h3 className="text-sm font-black text-foreground mb-4">Review Actions</h3>

        {!isPending && (
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl mb-4 border",
              verification.status === "approved"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/40"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40"
            )}
          >
            {verification.status === "approved" ? (
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 shrink-0" />
            )}
            <div>
              <p className={cn("text-xs font-bold", verification.status === "approved" ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                {verification.status === "approved" ? "Approved" : "Rejected"}
              </p>
              {verification.reviewedBy && (
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                  By {verification.reviewedBy}
                </p>
              )}
            </div>
          </div>
        )}

        {verification.status === "rejected" && verification.rejectionReason && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 mb-4">
            <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1.5">Rejection Reason</p>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{verification.rejectionReason}</p>
          </div>
        )}

        <div className="space-y-2">
          {isPending && (
            <>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleApprove}
                disabled={isProcessing || isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
                style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
              >
                <CheckCircle className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Approve Verification"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing || isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-red-500 cursor-pointer border border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4" />
                Reject Verification
              </motion.button>
            </>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowNoteModal(true)}
            disabled={isProcessing || isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-[#0F69B0] cursor-pointer border border-[#0F69B0]/20 hover:bg-[#0F69B0]/5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-4 w-4" />
            Add Note
          </motion.button>
        </div>

        {!allDocsVerified && isPending && (
          <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30">
            <AlertTriangle className="h-3.5 w-3.5 text-yellow-500 shrink-0" />
            <p className="text-[10px] text-yellow-700 dark:text-yellow-400 font-medium">
              Some documents not yet verified
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRejectModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowRejectModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-white dark:bg-[#0f1420] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.08] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
                    <h3 className="text-base font-black text-foreground">Reject Verification</h3>
                  </div>
                  <button onClick={() => setShowRejectModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] cursor-pointer transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground font-medium mb-4">Select a reason or write a custom reason:</p>

                <div className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-thin">
                  {REJECTION_REASONS.map((reason) => (
                    <button
                      key={reason}
                      onClick={() => { setRejectionReason(reason); setCustomReason(""); }}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer border",
                        rejectionReason === reason && !customReason
                          ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                          : "border-gray-100 dark:border-white/[0.06] text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-foreground"
                      )}
                    >
                      {reason}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">Custom Reason</label>
                  <textarea
                    value={customReason}
                    onChange={(e) => { setCustomReason(e.target.value); setRejectionReason(""); }}
                    placeholder="Type a custom rejection reason..."
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-red-400 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)] resize-none cursor-text transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!rejectionReason && !customReason.trim() || isProcessing}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-red-500/20 transition-all"
                    style={{ background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
                  >
                    {isProcessing ? "Rejecting..." : "Confirm Reject"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNoteModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowNoteModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-white dark:bg-[#0f1420] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.08] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-[#0F69B0]" />
                    </div>
                    <h3 className="text-base font-black text-foreground">Add Note</h3>
                  </div>
                  <button onClick={() => setShowNoteModal(false)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] cursor-pointer transition-colors">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>

                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a review note or request additional information..."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-medium outline-none border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] resize-none cursor-text transition-all mb-4"
                />

                <div className="flex items-center gap-3">
                  <button onClick={() => setShowNoteModal(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handleNote}
                    disabled={!noteText.trim() || isProcessing}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-[#0F69B0]/25 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isProcessing ? "Saving..." : "Add Note"}
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