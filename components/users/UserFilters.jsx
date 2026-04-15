"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
  { value: "banned", label: "Banned" },
];

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "buyer", label: "Buyers" },
  { value: "seller", label: "Sellers" },
  { value: "admin", label: "Admins" },
];

const verifiedOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

const levelOptions = [
  { value: "all", label: "All Levels" },
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "platinum", label: "Platinum" },
  { value: "admin", label: "Admin" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "name", label: "Name A-Z" },
  { value: "revenue", label: "Top Revenue" },
  { value: "orders", label: "Most Orders" },
  { value: "rating", label: "Top Rated" },
];

export default function UserFilters({
  query, onQueryChange,
  filters, onFilterChange,
  onResetFilters,
  hasActiveFilters,
  showFilters, onToggleFilters,
  sortBy, onSortChange,
  resultCount,
  hideRole = false,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <SearchInput
            value={query}
            onChange={onQueryChange}
            placeholder="Search name, email, phone..."
          />
        </div>
        <FilterDropdown
          label="Sort"
          value={sortBy || "newest"}
          options={sortOptions}
          onChange={onSortChange}
        />
        <button
          onClick={onToggleFilters}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            showFilters || hasActiveFilters
              ? "border-[#0F69B0] bg-[#0F69B0]/8 text-[#0F69B0]"
              : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/30 hover:text-[#0F69B0]"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {hasActiveFilters && (
            <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <FilterDropdown
                label="Status"
                value={filters.status || "all"}
                options={statusOptions}
                onChange={(v) => onFilterChange("status", v)}
              />
              {!hideRole && (
                <FilterDropdown
                  label="Role"
                  value={filters.role || "all"}
                  options={roleOptions}
                  onChange={(v) => onFilterChange("role", v)}
                />
              )}
              <FilterDropdown
                label="Verified"
                value={String(filters.verified || "all")}
                options={verifiedOptions}
                onChange={(v) => onFilterChange("verified", v)}
              />
              <FilterDropdown
                label="Level"
                value={filters.level || "all"}
                options={levelOptions}
                onChange={(v) => onFilterChange("level", v)}
              />
              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear All
                </button>
              )}
              <p className="text-[11px] text-muted-foreground font-medium ml-auto">
                {resultCount} result{resultCount !== 1 ? "s" : ""}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}