"use client";

import { motion } from "framer-motion";
import { Star, Eye, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, Package } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

const statusConfig = {
  approved: { label: "Approved", bg: "rgba(16,185,129,0.1)", text: "#10b981", icon: CheckCircle },
  pending: { label: "Pending", bg: "rgba(245,158,11,0.1)", text: "#f59e0b", icon: AlertTriangle },
  rejected: { label: "Rejected", bg: "rgba(239,68,68,0.1)", text: "#ef4444", icon: XCircle },
  reported: { label: "Reported", bg: "rgba(239,68,68,0.1)", text: "#ef4444", icon: AlertTriangle },
};

export default function ProductCard({ product, index = 0, onView, onEdit, onDelete, onApprove, onReject }) {
  if (!product) return null;
  const status = statusConfig[product.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.1)] overflow-hidden"
    >
      <div className="relative h-44 bg-gray-50 dark:bg-white/[0.03] overflow-hidden">
        {product.thumbnail ? (
          <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex items-center gap-1 flex-wrap">
          <span
            className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: status.bg, color: status.text }}
          >
            <StatusIcon className="h-2.5 w-2.5" />
            {status.label}
          </span>
          {isOutOfStock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-900/80 text-white">Out of Stock</span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/90 text-white">Low Stock</span>
          )}
        </div>
        {product.featured && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-400 text-white flex items-center gap-1">
              <Star className="h-2.5 w-2.5 fill-white" />
              Featured
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView?.(product)} className="h-8 px-3 rounded-lg bg-white/90 text-xs font-bold text-foreground hover:bg-white cursor-pointer transition-colors flex items-center gap-1">
            <Eye className="h-3 w-3" /> View
          </button>
          <button onClick={() => onEdit?.(product)} className="h-8 px-3 rounded-lg bg-[#0F69B0]/90 text-xs font-bold text-white hover:bg-[#0F69B0] cursor-pointer transition-colors flex items-center gap-1">
            <Edit2 className="h-3 w-3" /> Edit
          </button>
          <button onClick={() => onDelete?.(product)} className="h-8 w-8 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 cursor-pointer transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <p className="text-xs font-semibold text-[#0F69B0] mb-0.5 truncate">{product.category}</p>
          <h3 className="text-sm font-black text-foreground line-clamp-2 leading-tight">{product.name}</h3>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">{product.brand} · {product.sku}</p>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-black text-foreground">{formatCurrency(product.price)}</span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">{formatCurrency(product.comparePrice)}</span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium mb-3">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{product.rating || 0}</span>
            <span>({product.reviewsCount || 0})</span>
          </div>
          <span>{product.soldCount || 0} sold</span>
          <span className={product.stock === 0 ? "text-red-500 font-bold" : product.stock <= product.lowStockThreshold ? "text-orange-500 font-bold" : ""}>
            {product.stock} in stock
          </span>
        </div>

        {(product.status === "pending" || product.status === "reported") && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onApprove?.(product)}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer"
            >
              ✓ Approve
            </button>
            <button
              onClick={() => onReject?.(product)}
              className="flex-1 py-1.5 rounded-lg text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
            >
              ✕ Reject
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}