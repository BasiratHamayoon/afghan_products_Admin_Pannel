"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
}) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3.5 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm font-medium outline-none transition-all duration-200 placeholder:text-muted-foreground/40 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] focus:border-[#0F69B0]/40 focus:shadow-[0_0_0_3px_rgba(15,105,176,0.08)] text-foreground cursor-text"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 text-muted-foreground/50 hover:text-muted-foreground cursor-pointer transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}