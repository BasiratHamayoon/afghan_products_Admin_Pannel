"use client";

import { motion } from "framer-motion";
import {
  Edit2, Trash2, Eye, Star, StarOff,
  CheckCircle, XCircle, AlertTriangle,
  Package, ToggleLeft, ToggleRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/common/StatusBadge";

const statusConfig = {
  approved: { label: "Approved", bg: "rgba(16,185,129,0.1)", text: "#10b981" },
  pending: { label: "Pending", bg: "rgba(245,158,11,0.1)", text: "#f59e0b" },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
  reported: { label: "Reported", bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
};

export default function ProductTable({
  products = [],
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onToggleFeatured,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {[
              "Product",
              "Category",
              "Price",
              "Stock",
              "Status",
              "Rating",
              "Seller",
              "Date",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => {
            if (!product?.id) return null;
            const status = statusConfig[product.status] || statusConfig.pending;
            const isOutOfStock = product.stock === 0;
            const isLowStock =
              product.stock > 0 &&
              product.stock <= (product.lowStockThreshold || 10);

            return (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.035 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors group"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] shrink-0">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-foreground truncate max-w-[160px]">
                          {product.name}
                        </p>
                        {product.featured && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[160px]">
                        {product.sku}
                      </p>
                      <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5">
                        {product.brand}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                    {product.category}
                  </p>
                  {product.subCategory && (
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5 whitespace-nowrap">
                      {product.subCategory}
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-black text-foreground whitespace-nowrap">
                    {formatCurrency(product.price)}
                  </p>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <p className="text-[10px] text-muted-foreground line-through whitespace-nowrap">
                      {formatCurrency(product.comparePrice)}
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-lg whitespace-nowrap",
                      isOutOfStock
                        ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                        : isLowStock
                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-500"
                        : "bg-green-50 dark:bg-green-900/20 text-green-600"
                    )}
                  >
                    {isOutOfStock ? "Out of Stock" : `${product.stock} left`}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                    style={{ background: status.bg, color: status.text }}
                  >
                    {status.label}
                  </span>
                  {product.reportCount > 0 && (
                    <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                      {product.reportCount} reports
                    </p>
                  )}
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold text-foreground">
                      {product.rating || 0}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {product.reviewsCount || 0} reviews
                  </p>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs font-semibold text-foreground whitespace-nowrap max-w-[100px] truncate">
                    {product.seller}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <p className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                    {formatDate(product.createdAt)}
                  </p>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      onClick={() => onToggleFeatured?.(product)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-muted-foreground hover:text-yellow-500 transition-all cursor-pointer"
                      title={product.featured ? "Unfeature" : "Feature"}
                    >
                      {product.featured ? (
                        <StarOff className="h-3.5 w-3.5" />
                      ) : (
                        <Star className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {(product.status === "pending" ||
                      product.status === "reported") && (
                      <button
                        onClick={() => onApprove?.(product)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-all cursor-pointer"
                        title="Approve"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {product.status !== "rejected" && (
                      <button
                        onClick={() => onReject?.(product)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-orange-50 dark:hover:bg-orange-900/20 text-muted-foreground hover:text-orange-500 transition-all cursor-pointer"
                        title="Reject"
                      >
                        <XCircle className="h-3.5 w-3.5" />
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