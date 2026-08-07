"use client";

import { motion } from "framer-motion";
import { Edit2, Eye, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const getDisplayName = (item) =>
  item?.displayName ||
  (typeof item?.name === "string" ? item.name : null) ||
  item?.name?.en ||
  item?.name?.fa ||
  item?.name?.ps ||
  "—";

const getDisplayDescription = (item) =>
  item?.displayDescription ||
  (typeof item?.description === "string" ? item.description : null) ||
  item?.description?.en ||
  item?.description?.fa ||
  item?.description?.ps ||
  "";

export default function SharedTable({ items, extraColumns, onEdit, onView, onArchive, onUnarchive, onDelete }) {
  const { t } = useTranslation();
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const safeColumns = Array.isArray(extraColumns) ? extraColumns : [];
  const allHeaders = [
    t("categories.item"),
    ...safeColumns.map((c) => c.label),
    t("categories.description"),
    t("categories.sort"),
    t("categories.status"),
    t("categories.created"),
    t("categories.actions"),
  ];

  if (safeItems.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {allHeaders.map((h) => (
              <th
                key={h}
                className="text-start py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => {
            if (!item) return null;
            const imageUrl = item.image ? getFileUrl(item.image) : null;
            const displayName = getDisplayName(item);
            const displayDescription = getDisplayDescription(item);

            return (
              <motion.tr
                key={item.id || item._id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] shrink-0 bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={displayName}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling)
                              e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <span
                        className="text-xl"
                        style={{ display: imageUrl ? "none" : "flex" }}
                      >
                        📦
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[160px]">
                        {displayName}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        {item.slug || `ID: ${item.id || item._id}`}
                      </p>
                    </div>
                  </div>
                </td>
                {safeColumns.map((col) => (
                  <td key={col.key} className="py-4 px-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      {item[col.key] ?? "—"}
                    </span>
                  </td>
                ))}
                <td className="py-4 px-4 max-w-[180px]">
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                    {displayDescription || "—"}
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
                    {item.isArchived
                      ? t("categories.archivedStatus")
                      : t("categories.activeStatus")}
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
                      title={t("categories.view")}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit?.(item)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title={t("categories.edit")}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {item.isArchived ? (
                      <button
                        onClick={() => onUnarchive?.(item)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600 transition-all cursor-pointer"
                        title={t("categories.unarchive")}
                      >
                        <ArchiveRestore className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onArchive?.(item)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600 transition-all cursor-pointer"
                        title={t("categories.archive")}
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete?.(item)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                        title={t("categories.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
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