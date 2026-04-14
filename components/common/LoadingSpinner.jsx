"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function LoadingSpinner({ size = "md", className, text }) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "rounded-full border-[#0F69B0]/20 border-t-[#0F69B0] animate-spin",
          sizes[size]
        )}
      />
      {text && <p className="text-sm text-muted-foreground font-medium">{text}</p>}
    </div>
  );
}