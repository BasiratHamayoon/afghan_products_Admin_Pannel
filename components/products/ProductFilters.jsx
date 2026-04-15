"use client";

import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "reported", label: "Reported" },
];

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Electronics", label: "Electronics" },
  { value: "Fashion & Clothing", label: "Fashion & Clothing" },
  { value: "Food & Agriculture", label: "Food & Agriculture" },
  { value: "Handicrafts", label: "Handicrafts" },
  { value: "Construction Materials", label: "Construction Materials" },
];

const stockOptions = [
  { value: "all", label: "All Stock" },
  { value: "inStock", label: "In Stock" },
  { value: "outOfStock", label: "Out of Stock" },
  { value: "lowStock", label: "Low Stock" },
];

const featuredOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "Featured" },
  { value: "false", label: "Not Featured" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "priceHigh", label: "Price: High to Low" },
  { value: "priceLow", label: "Price: Low to High" },
  { value: "rating", label: "Top Rated" },
  { value: "sold", label: "Best Selling" },
];

export default function ProductFilter({
  query, onQueryChange,
  filters, onFilterChange,
  onResetFilters,
  hasActiveFilters,
  showFilters, onToggleFilters,
  sortBy, onSortChange,
  resultCount,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex-1 min-w-[180px]">
          <SearchInput value={query} onChange={onQueryChange} placeholder="Search products, brands, SKU..." />
        </div>

        <FilterDropdown label="Sort" value={sortBy || "newest"} options={sortOptions} onChange={onSortChange} />

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
            <div className="flex items-center gap-2 flex-wrap pt-1 pb-1">
              <FilterDropdown label="Status" value={filters.status || "all"} options={statusOptions} onChange={(v) => onFilterChange("status", v)} />
              <FilterDropdown label="Category" value={filters.category || "all"} options={categoryOptions} onChange={(v) => onFilterChange("category", v)} />
              <FilterDropdown label="Stock" value={filters.stock || "all"} options={stockOptions} onChange={(v) => onFilterChange("stock", v)} />
              <FilterDropdown label="Featured" value={String(filters.featured || "all")} options={featuredOptions} onChange={(v) => onFilterChange("featured", v)} />
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