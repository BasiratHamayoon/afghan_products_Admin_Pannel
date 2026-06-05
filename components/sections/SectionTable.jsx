"use client";

import { motion } from "framer-motion";
import {
  Edit2, Eye, Archive, ArchiveRestore, Trash2, Package,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function SectionTable({
  items,
  onEdit,
  onView,
  onArchive,
  onUnarchive,
  onDelete,
  onManageProducts,
}) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {[
              "Section",
              "Description",
              "Sort",
              "Active",
              "Status",
              "Products",
              "Created",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => (
            <motion.tr
              key={item.id || i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-4 px-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate max-w-[180px]">
                    {item.name || "—"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                    {item.key || `ID: ${item.id}`}
                  </p>
                </div>
              </td>
              <td className="py-4 px-4 max-w-[200px]">
                <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                  {item.description || "—"}
                </p>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-bold text-foreground">
                  {item.sortOrder ?? 0}
                </span>
              </td>
              <td className="py-4 px-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg",
                    item.isActive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-gray-500/10 text-gray-500"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.isActive ? "bg-emerald-500" : "bg-gray-400"
                    )}
                  />
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="py-4 px-4">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg",
                    item.isArchived
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      item.isArchived ? "bg-amber-500" : "bg-emerald-500"
                    )}
                  />
                  {item.isArchived ? "Archived" : "Live"}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-bold text-foreground">
                  {item.productsCount ?? item.products?.length ?? 0}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-muted-foreground">
                  {formatDate(item.createdAt)}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onView?.(item)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onEdit?.(item)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onManageProducts?.(item)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-purple-50 dark:hover:bg-purple-900/20 text-muted-foreground hover:text-purple-600 transition-all cursor-pointer"
                    title="Manage Products"
                  >
                    <Package className="h-3.5 w-3.5" />
                  </button>
                  {item.isArchived ? (
                    <button
                      onClick={() => onUnarchive?.(item)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer"
                      title="Unarchive"
                    >
                      <ArchiveRestore className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onArchive?.(item)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600 transition-all cursor-pointer"
                      title="Archive"
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete?.(item)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}