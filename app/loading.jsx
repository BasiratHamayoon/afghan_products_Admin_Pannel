"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-[#0F69B0]/20 border-t-[#0F69B0] rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 h-8 w-8 border-4 border-[#0F69B0]/10 border-b-[#0F69B0]/60 rounded-full m-auto"
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex items-center gap-2"
        >
          <div className="h-8 w-8 rounded-lg bg-[#0F69B0] flex items-center justify-center">
            <span className="text-white font-bold text-xs">AP</span>
          </div>
          <span className="text-sm font-medium text-muted-foreground">Loading...</span>
        </motion.div>
      </div>
    </div>
  );
}