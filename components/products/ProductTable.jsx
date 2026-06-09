"use client";

import { motion } from "framer-motion";
import {
  Edit2, Trash2, Eye, Package,
  Archive, ArchiveRestore, CheckCircle, Clock,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";

export default function ProductTable({
  products = [],
  onView,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  onToggleStatus,
}) {
  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  if (safeProducts.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Product", "Category", "Price", "Stock", "Status", "Approval", "Created", "Actions"].map((h) => (
              <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeProducts.map((product, i) => {
            if (!product?.id) return null;
            const imageUrl = product.images?.[0] ? getFileUrl(product.images[0]) : null;
            const isOutOfStock = (product.stock ?? 0) === 0;
            const isLowStock = (product.stock ?? 0) > 0 && (product.stock ?? 0) <= (product.minStock ?? 10);
            const isApproved = product.status === "APPROVED";

            return (
              <motion.tr
                key={product.id || i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] shrink-0">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name || ""} className="h-full w-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[160px]">{product.name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[160px]">{product.sku || `ID: ${product.id}`}</p>
                      {product.brand && <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5">{product.brand}</p>}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-semibold text-foreground whitespace-nowrap">{product.categoryName || "—"}</p>
                  {product.subCategoryName && <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{product.subCategoryName}</p>}
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-black text-foreground whitespace-nowrap">
                    {product.sellingPrice !== undefined ? `AFN ${Number(product.sellingPrice).toLocaleString()}` : "—"}
                  </p>
                  {product.purchasePrice !== undefined && (
                    <p className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                      Cost: AFN {Number(product.purchasePrice).toLocaleString()}
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap",
                    isOutOfStock
                      ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                      : isLowStock
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                      : "bg-green-50 dark:bg-green-900/20 text-green-600"
                  )}>
                    {isOutOfStock ? "Out of Stock" : `${product.stock} left`}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg",
                    product.isArchived
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", product.isArchived ? "bg-amber-500" : "bg-emerald-500")} />
                    {product.isArchived ? "Archived" : "Live"}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg",
                    isApproved
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-amber-500/10 text-amber-600"
                  )}>
                    {isApproved
                      ? <CheckCircle className="h-3 w-3" />
                      : <Clock className="h-3 w-3" />
                    }
                    {isApproved ? "Approved" : "Pending"}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{formatDate(product.createdAt)}</span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onView?.(product)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit?.(product)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onToggleStatus?.(product)}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        isApproved
                          ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600"
                          : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600"
                      )}
                      title={isApproved ? "Set Pending" : "Approve"}
                    >
                      {isApproved
                        ? <Clock className="h-3.5 w-3.5" />
                        : <CheckCircle className="h-3.5 w-3.5" />
                      }
                    </button>
                    {product.isArchived ? (
                      <button
                        onClick={() => onUnarchive?.(product)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer"
                        title="Unarchive"
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onArchive?.(product)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600 transition-all cursor-pointer"
                        title="Archive"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete?.(product)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}