"use client";

import { motion } from "framer-motion";
import {
  Eye, Edit2, Trash2, Package, Archive, ArchiveRestore,
  CheckCircle, Clock,
} from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function ProductCard({ product, index = 0, onView, onEdit, onDelete, onArchive, onUnarchive, onToggleStatus }) {
  const { t } = useTranslation();
  if (!product) return null;

  const imageUrl = product.images?.[0] ? getFileUrl(product.images[0]) : null;
  const isOutOfStock = (product.stock ?? 0) === 0;
  const isLowStock = (product.stock ?? 0) > 0 && (product.stock ?? 0) <= (product.minStock ?? 10);
  const isApproved = product.status === "APPROVED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.1)] overflow-hidden"
    >
      <div className="relative h-44 bg-gray-50 dark:bg-white/[0.03] overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={product.name || ""} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute top-2 start-2 flex items-center gap-1 flex-wrap">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", product.isArchived ? "bg-amber-500/90 text-white" : "bg-emerald-500/90 text-white")}>
            {product.isArchived ? t("products.archived") : t("products.live")}
          </span>
          {isOutOfStock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/90 text-white">
              {t("products.outOfStock")}
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/90 text-white">
              {t("products.lowStock")}
            </span>
          )}
        </div>

        <div className="absolute top-2 end-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", isApproved ? "bg-emerald-500/90 text-white" : "bg-amber-500/80 text-white")}>
            {isApproved ? t("products.approved") : t("products.pending")}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-0 start-0 end-0 flex items-center justify-center gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onView?.(product)} className="h-8 px-3 rounded-lg bg-white/90 text-xs font-bold text-foreground hover:bg-white cursor-pointer transition-colors flex items-center gap-1">
            <Eye className="h-3 w-3" />{t("products.view")}
          </button>
          <button onClick={() => onEdit?.(product)} className="h-8 px-3 rounded-lg bg-[#0F69B0]/90 text-xs font-bold text-white hover:bg-[#0F69B0] cursor-pointer transition-colors flex items-center gap-1">
            <Edit2 className="h-3 w-3" />{t("products.edit")}
          </button>
          <button onClick={() => onDelete?.(product)} className="h-8 w-8 rounded-lg bg-red-500/90 flex items-center justify-center text-white hover:bg-red-500 cursor-pointer transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-2">
          <p className="text-xs font-semibold text-[#0F69B0] mb-0.5 truncate">{product.categoryName || "—"}</p>
          <h3 className="text-sm font-black text-foreground line-clamp-2 leading-tight">{product.name || "—"}</h3>
          {product.brand && (
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate">
              {product.brand} · {product.sku || ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-black text-foreground">
            {product.sellingPrice !== undefined ? `AFN ${Number(product.sellingPrice).toLocaleString()}` : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium mb-3">
          <span className={cn(isOutOfStock ? "text-red-500 font-bold" : isLowStock ? "text-orange-500 font-bold" : "")}>
            {isOutOfStock ? t("products.outOfStock") : `${product.stock ?? 0} ${t("products.inStockStat")}`}
          </span>
          <span>{product.unit || ""}</span>
          <span>{formatDate(product.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
          <button
            onClick={() => onToggleStatus?.(product)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1",
              isApproved ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            )}
          >
            {isApproved
              ? <><Clock className="h-3.5 w-3.5" />{t("products.setPending")}</>
              : <><CheckCircle className="h-3.5 w-3.5" />{t("products.approve")}</>
            }
          </button>

          {product.isArchived ? (
            <button onClick={() => onUnarchive?.(product)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer flex items-center justify-center gap-1">
              <ArchiveRestore className="h-3.5 w-3.5" />{t("products.unarchive")}
            </button>
          ) : (
            <button onClick={() => onArchive?.(product)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer flex items-center justify-center gap-1">
              <Archive className="h-3.5 w-3.5" />{t("products.archive")}
            </button>
          )}

          <button onClick={() => onDelete?.(product)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer flex items-center justify-center gap-1">
            <Trash2 className="h-3.5 w-3.5" />{t("products.delete")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}