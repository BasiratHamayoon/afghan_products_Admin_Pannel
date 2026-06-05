"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  isLoading = false,
  error = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04]">
        <Loader2 className="h-4 w-4 animate-spin text-[#0F69B0] shrink-0" />
        <span className="text-sm text-muted-foreground font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all border bg-white dark:bg-white/[0.04] text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
          error
            ? "border-red-400"
            : open
            ? "border-[#0F69B0]/40 shadow-[0_0_0_3px_rgba(15,105,176,0.08)]"
            : "border-gray-200 dark:border-white/[0.08] hover:border-[#0F69B0]/30"
        )}
      >
        <span className={cn("truncate flex-1", !selected ? "text-muted-foreground/40" : "text-foreground")}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && !disabled && (
            <span
              onClick={handleClear}
              className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </span>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#0f1420] shadow-xl z-50 overflow-hidden"
          style={{ boxShadow: "0 8px 32px rgba(15,105,176,0.12), 0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <div className="p-2 border-b border-gray-100 dark:border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 text-sm font-medium bg-gray-50 dark:bg-white/[0.04] rounded-lg border border-gray-100 dark:border-white/[0.06] outline-none text-foreground placeholder:text-muted-foreground/40 focus:border-[#0F69B0]/30"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-xs font-medium text-muted-foreground">
                  {search ? "No results found" : "No options available"}
                </p>
              </div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                    opt.value === value
                      ? "bg-[#0F69B0]/10 text-[#0F69B0] font-bold"
                      : "text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}