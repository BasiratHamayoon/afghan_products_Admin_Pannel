"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function FilterDropdown({ label, value, options = [], onChange, className }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm font-semibold text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors cursor-pointer min-w-[120px]"
      >
        <span className="flex-1 text-left text-xs">{selected?.label || label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 min-w-[160px] bg-white dark:bg-[#0f1420] rounded-xl border border-gray-100 dark:border-white/[0.08] shadow-xl z-50 overflow-hidden"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer",
                    opt.value === value
                      ? "bg-[#0F69B0]/8 text-[#0F69B0]"
                      : "text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}