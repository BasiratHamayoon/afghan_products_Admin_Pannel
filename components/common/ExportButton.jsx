"use client";

import { Download, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExportButton({ onExport, formats = ["CSV", "Excel", "PDF"] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm font-bold text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer"
      >
        <Download className="h-4 w-4 text-muted-foreground" />
        Export
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-40 bg-white dark:bg-[#0f1420] rounded-xl border border-gray-100 dark:border-white/[0.08] shadow-xl z-50 overflow-hidden"
          >
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => { onExport?.(fmt); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Export as {fmt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}