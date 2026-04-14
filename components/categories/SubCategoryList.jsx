"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, ChevronRight, Plus } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function SubCategoryList({ subCategories, onEdit, onDelete, onView, onAdd }) {
  if (!subCategories || subCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">📂</span>
        </div>
        <p className="text-sm font-bold text-foreground mb-1">No subcategories</p>
        <p className="text-xs text-muted-foreground font-medium">Create subcategories to organize this category</p>
        <button
          onClick={onAdd}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white mx-auto cursor-pointer"
          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
        >
          <Plus className="h-4 w-4" />
          Add Subcategory
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subCategories.map((sub, i) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 dark:hover:border-[#0F69B0]/15 transition-all group shadow-[0_1px_6px_rgba(15,105,176,0.04)]"
        >
          <div className="relative shrink-0">
            {sub.image ? (
              <div className="h-12 w-12 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                <img src={sub.image} alt={sub.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: `${sub.color}18` }}
              >
                {sub.icon}
              </div>
            )}
            <div
              className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
              style={{ background: sub.color }}
            >
              {sub.level}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-foreground truncate">{sub.name}</p>
              {sub.featured && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                  FEATURED
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium truncate mb-1">
              {sub.description}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-muted-foreground font-medium">
                {sub.productsCount} products
              </span>
              {sub.parentName && (
                <span className="text-[10px] text-[#0F69B0] font-semibold flex items-center gap-0.5">
                  <ChevronRight className="h-2.5 w-2.5" />
                  {sub.parentName}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground font-medium">
                {formatDate(sub.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={sub.status} />
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onView?.(sub)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onEdit?.(sub)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete?.(sub)}
                className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}