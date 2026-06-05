"use client";

import { motion } from "framer-motion";
import { Eye, Edit2, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function SharedGridCard({
  item,
  index,
  onView,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  extraInfo,
  defaultEmoji,
}) {
  const imageUrl = item.image ? getFileUrl(item.image) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-2xl p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.08)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="h-12 w-12 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] shrink-0 bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.name}
              width={48}
              height={48}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <span className="text-2xl">{defaultEmoji || "📦"}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-foreground truncate">{item.name}</p>
          {extraInfo && (
            <div className="mt-0.5 space-y-0.5">
              {extraInfo.map((info, idx) => (
                <p
                  key={idx}
                  className="text-[10px] font-semibold truncate"
                  style={{ color: info.color || "#6b7280" }}
                >
                  {info.prefix && `${info.prefix} `}
                  {item[info.key] || ""}
                </p>
              ))}
            </div>
          )}
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full",
            item.isArchived
              ? "bg-amber-500/10 text-amber-600"
              : "bg-emerald-500/10 text-emerald-600"
          )}
        >
          {item.isArchived ? "Archived" : "Active"}
        </span>
      </div>

      {item.description && (
        <p className="text-[11px] text-muted-foreground font-medium mb-3 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-muted-foreground font-medium">
          Sort: {item.sortOrder ?? 0}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">
          {formatDate(item.createdAt)}
        </span>
      </div>

      <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
        <button
          onClick={() => onView?.(item)}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
          title="View"
        >
          <Eye className="h-3.5 w-3.5 mx-auto" />
        </button>
        <button
          onClick={() => onEdit?.(item)}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5 mx-auto" />
        </button>
        {item.isArchived ? (
          <button
            onClick={() => onUnarchive?.(item)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer"
            title="Unarchive"
          >
            <ArchiveRestore className="h-3.5 w-3.5 mx-auto" />
          </button>
        ) : (
          <button
            onClick={() => onArchive?.(item)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all cursor-pointer"
            title="Archive"
          >
            <Archive className="h-3.5 w-3.5 mx-auto" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete?.(item)}
            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 mx-auto" />
          </button>
        )}
      </div>
    </motion.div>
  );
}