"use client";

import { motion } from "framer-motion";
import { Star, Eye, ShoppingCart, Package, Tag, Truck, BarChart2, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { formatDateTime } from "@/lib/helpers";
import ImagePreview from "@/components/common/ImagePreview";
import StatusBadge from "@/components/common/StatusBadge";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import { cn } from "@/lib/utils";

export default function ProductDetail({ product }) {
  if (!product) return null;

  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 10);
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const stats = [
    { label: "Total Views", value: product.views || 0, icon: Eye, color: "#0F69B0", bg: "rgba(15,105,176,0.1)" },
    { label: "Units Sold", value: product.soldCount || 0, icon: ShoppingCart, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "In Stock", value: product.stock || 0, icon: Package, color: isOutOfStock ? "#ef4444" : isLowStock ? "#f59e0b" : "#10b981", bg: isOutOfStock ? "rgba(239,68,68,0.1)" : isLowStock ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)" },
    { label: "Reviews", value: product.reviewsCount || 0, icon: Star, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="rounded-2xl p-4 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]"
          >
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: stat.bg }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-foreground">
              <AnimatedCounter value={stat.value} duration={1000} />
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06]">
          <ImagePreview images={product.images || (product.thumbnail ? [product.thumbnail] : [])} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] space-y-4">
          <div>
            <p className="text-xs font-semibold text-[#0F69B0] mb-1">{product.category} {product.subCategory ? `› ${product.subCategory}` : ""}</p>
            <h2 className="text-lg font-black text-foreground leading-tight mb-2">{product.name}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={product.status} />
              {product.featured && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">★ Featured</span>}
              {product.reportCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500">
                  <AlertTriangle className="h-2.5 w-2.5" /> {product.reportCount} Reports
                </span>
              )}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-2xl font-black text-foreground">{formatCurrency(product.price)}</span>
            {product.comparePrice > product.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.comparePrice)}</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600">{discount}% OFF</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={cn("h-4 w-4", s <= Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-200 dark:text-white/10")} />
              ))}
            </div>
            <span className="text-sm font-bold text-foreground">{product.rating || 0}</span>
            <span className="text-xs text-muted-foreground">({product.reviewsCount || 0} reviews)</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "SKU", value: product.sku, icon: Tag },
              { label: "Brand", value: product.brand, icon: Package },
              { label: "Seller", value: product.seller, icon: BarChart2 },
              { label: "Weight", value: product.weight ? `${product.weight} kg` : "N/A", icon: Truck },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
                <div className="h-7 w-7 rounded-lg bg-[#0F69B0]/8 flex items-center justify-center shrink-0">
                  <item.icon className="h-3.5 w-3.5 text-[#0F69B0]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                  <p className="text-xs font-bold text-foreground truncate">{item.value || "N/A"}</p>
                </div>
              </div>
            ))}
          </div>

          {product.tags?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#0F69B0]/8 text-[#0F69B0]">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {product.description && (
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Description</p>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 dark:border-white/[0.06] grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Created", value: formatDateTime(product.createdAt), icon: Clock },
              { label: "Updated", value: formatDateTime(product.updatedAt), icon: Clock },
              product.approvedAt && { label: "Approved", value: formatDateTime(product.approvedAt), icon: CheckCircle },
            ].filter(Boolean).map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <item.icon className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase">{item.label}</p>
                  <p className="text-[10px] font-medium text-foreground">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}