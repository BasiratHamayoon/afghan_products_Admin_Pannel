"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to proceed?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}) {
  const colors = {
    danger: { bg: "bg-red-500", hover: "hover:bg-red-600", shadow: "shadow-red-500/25" },
    warning: { bg: "bg-yellow-500", hover: "hover:bg-yellow-600", shadow: "shadow-yellow-500/25" },
    primary: { bg: "bg-[#0F69B0]", hover: "hover:bg-[#0c5a9e]", shadow: "shadow-[#0F69B0]/25" },
  };
  const color = colors[variant] || colors.danger;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-white dark:bg-[#0f1420] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.08] p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center"
                  style={{ background: variant === "danger" ? "rgba(239,68,68,0.1)" : "rgba(15,105,176,0.1)" }}
                >
                  <AlertTriangle
                    className="h-5 w-5"
                    style={{ color: variant === "danger" ? "#ef4444" : "#0F69B0" }}
                  />
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <h3 className="text-base font-black text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground font-medium mb-6">{description}</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all cursor-pointer shadow-lg ${color.bg} ${color.hover} ${color.shadow} disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Processing..." : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}