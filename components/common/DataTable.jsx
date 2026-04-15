"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import LoadingSpinner from "./LoadingSpinner";
import EmptyState from "./EmptyState";
import Pagination from "./Pagination";
import { usePagination } from "@/hooks/usePagination";
import { FolderOpen } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = "No data found",
  emptyDescription = "Try adjusting your filters",
  itemsPerPage = 10,
  rowClassName,
  onRowClick,
}) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (key) => {
    if (!key) return;
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey]; const bVal = b[sortKey];
    if (aVal == null) return 1; if (bVal == null) return -1;
    const cmp = typeof aVal === "string" ? aVal.localeCompare(bVal) : aVal - bVal;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(sorted, itemsPerPage);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
              {columns.map((col) => (
                <th
                  key={col.key || col.label}
                  className={cn(
                    "text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50",
                    col.sortable && "cursor-pointer hover:text-muted-foreground transition-colors select-none",
                    col.className
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-muted-foreground/40">
                        {sortKey === col.key
                          ? sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                          : <ChevronsUpDown className="h-3 w-3" />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-16">
                  <LoadingSpinner size="lg" text="Loading..." className="py-4" />
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState icon={FolderOpen} title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, i) => (
                <motion.tr
                  key={row.id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "border-b border-gray-50 dark:border-white/[0.03] last:border-0 transition-colors",
                    onRowClick && "cursor-pointer",
                    "hover:bg-gray-50/60 dark:hover:bg-white/[0.02]",
                    rowClassName?.(row)
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key || col.label} className={cn("py-3.5 px-4", col.tdClassName)}>
                      {col.render ? col.render(row[col.key], row, i) : (
                        <span className="text-sm font-medium text-foreground">{row[col.key] ?? "—"}</span>
                      )}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!isLoading && paginatedData.length > 0 && (
        <div className="border-t border-gray-50 dark:border-white/[0.04] pt-4 mt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
        </div>
      )}
    </div>
  );
}