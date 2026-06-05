"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Trash2, Star, User, Building, Package } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

function getSubjectLabel(item) {
  if (item.productName) return { name: item.productName, type: "Product" };
  if (item.businessName) return { name: item.businessName, type: "Business" };
  if (item.type === "SELLER") return { name: "Seller Review", type: "Seller" };
  if (item.type === "PRODUCT") return { name: "Product Review", type: "Product" };
  return { name: "—", type: "—" };
}

export default function ReviewCard({ item, index, onToggleVisibility, onDelete }) {
  if (!item) return null;

  const subject = getSubjectLabel(item);
  const SubjectIcon = item.type === "SELLER" || item.businessName ? Building : Package;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.08)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-[#0F69B0]" />
          </div>
          <div>
            <p className="text-sm font-black text-foreground">{item.userName || "Unknown"}</p>
            {item.userEmail && (
              <p className="text-[10px] text-muted-foreground font-medium">{item.userEmail}</p>
            )}
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full",
            item.isVisible
              ? "bg-emerald-500/10 text-emerald-600"
              : "bg-red-500/10 text-red-500"
          )}
        >
          {item.isVisible ? "Visible" : "Hidden"}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "h-3.5 w-3.5",
                s <= (item.rating || 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-200 dark:text-white/10"
              )}
            />
          ))}
        </div>
        <span className="text-xs font-bold text-foreground">{item.rating || 0}/5</span>
        {item.type && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F69B0]/10 text-[#0F69B0] ml-auto">
            {item.type}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground font-medium line-clamp-3 leading-relaxed mb-3">
        {item.comment || "No comment"}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <SubjectIcon className="h-3 w-3 text-muted-foreground/50 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-[#0F69B0] truncate">{subject.name}</p>
          <p className="text-[9px] text-muted-foreground">{subject.type}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-medium">
          {formatDate(item.createdAt)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleVisibility?.(item)}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
              item.isVisible
                ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500"
                : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600"
            )}
            title={item.isVisible ? "Hide" : "Show"}
          >
            {item.isVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => onDelete?.(item)}
            className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}