"use client";

import { motion } from "framer-motion";
import { Eye, Edit2, Archive, ArchiveRestore, Trash2, Package } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function SectionGridCard({ item, index, onView, onEdit, onArchive, onUnarchive, onDelete, onManageProducts }) {
  const { t } = useTranslation();
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-2xl p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.08)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground truncate">{item.name || "—"}</p>
          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{item.slug || `ID: ${item.id}`}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ms-2">
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", item.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
            {item.isActive ? t("sections.activeStatus") : t("sections.inactiveStatus")}
          </span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", item.isArchived ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600")}>
            {item.isArchived ? t("sections.archivedStatus") : t("sections.liveStatus")}
          </span>
        </div>
      </div>

      {item.description && (
        <p className="text-[11px] text-muted-foreground font-medium mb-3 line-clamp-2 leading-relaxed">{item.description}</p>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground font-medium">{t("sections.sort")}: {item.sortOrder ?? 0}</span>
        <span className="text-[10px] text-muted-foreground font-medium">{t("sections.products")}: {item.products?.length || 0}</span>
        <span className="text-[10px] text-muted-foreground font-medium">{formatDate(item.createdAt)}</span>
      </div>

      <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
        <button onClick={() => onView?.(item)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer" title={t("sections.view")}><Eye className="h-3.5 w-3.5 mx-auto" /></button>
        <button onClick={() => onEdit?.(item)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer" title={t("sections.edit")}><Edit2 className="h-3.5 w-3.5 mx-auto" /></button>
        <button onClick={() => onManageProducts?.(item)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer" title={t("sections.manageProducts")}><Package className="h-3.5 w-3.5 mx-auto" /></button>
        {item.isArchived ? (
          <button onClick={() => onUnarchive?.(item)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer" title={t("sections.unarchive")}><ArchiveRestore className="h-3.5 w-3.5 mx-auto" /></button>
        ) : (
          <button onClick={() => onArchive?.(item)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer" title={t("sections.archive")}><Archive className="h-3.5 w-3.5 mx-auto" /></button>
        )}
        <button onClick={() => onDelete?.(item)} className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer" title={t("sections.delete")}><Trash2 className="h-3.5 w-3.5 mx-auto" /></button>
      </div>
    </motion.div>
  );
}