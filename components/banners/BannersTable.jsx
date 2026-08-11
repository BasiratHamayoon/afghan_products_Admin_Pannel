"use client";

import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const resolveField = (multiObj, flatFallback, lang) => {
  if (multiObj && typeof multiObj === "object" && !Array.isArray(multiObj)) {
    return multiObj[lang] || multiObj.en || multiObj.fa || multiObj.ps || (typeof flatFallback === "string" ? flatFallback : "") || "";
  }
  return typeof flatFallback === "string" ? flatFallback : "";
};

export default function BannersTable({ items = [], onView, onEdit, onDelete, onToggle }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  const POSITION_LABELS = {
    HOME_TOP: t("banners.positionHomeTop"),
    HOME_MIDDLE: t("banners.positionHomeMiddle"),
    HOME_BOTTOM: t("banners.positionHomeBottom"),
    CATEGORY_TOP: t("banners.positionCategoryTop"),
    PRODUCT_TOP: t("banners.positionProductTop"),
    SIDEBAR: t("banners.positionSidebar"),
  };

  const headers = [
    t("banners.banner"),
    t("banners.position"),
    t("banners.type"),
    t("banners.order"),
    t("banners.status"),
    t("banners.created"),
    t("banners.actions"),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {headers.map((h) => (
              <th key={h} className="text-start py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => {
            if (!item?.id) return null;
            const mediaUrl = item.media ? getFileUrl(item.media) : null;
            const displayTitle = resolveField(item.titleMultilingual, item.title, lang) || "—";
            const displaySubtitle = resolveField(item.subtitleMultilingual, item.subtitle, lang);

            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-20 rounded-lg overflow-hidden border border-gray-100 dark:border-white/[0.08] shrink-0 bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center">
                      {mediaUrl ? (
                        <img src={mediaUrl} alt={displayTitle} className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <span className="text-lg">🖼️</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[180px]">{displayTitle}</p>
                      {displaySubtitle && (
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[160px]">{displaySubtitle}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 whitespace-nowrap">
                    {POSITION_LABELS[item.position] || item.position || "—"}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600">
                    {item.mediaType === "IMAGE" ? t("banners.mediaImage") : item.mediaType === "VIDEO" ? t("banners.mediaVideo") : item.mediaType || "IMAGE"}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-sm font-bold text-foreground">{item.sortOrder ?? 0}</span>
                </td>

                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg", item.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", item.isActive ? "bg-emerald-500" : "bg-gray-400")} />
                    {item.isActive ? t("banners.activeStatus") : t("banners.inactiveStatus")}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground">{formatDate(item.createdAt)}</span>
                </td>

                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("banners.view")}><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onEdit?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("banners.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
                    <button
                      onClick={() => onToggle?.(item)}
                      className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer", item.isActive ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600")}
                      title={item.isActive ? t("banners.deactivate") : t("banners.activate")}
                    >
                      {item.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => onDelete?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("banners.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
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