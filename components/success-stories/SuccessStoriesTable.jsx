"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, ToggleLeft, ToggleRight, Star, MapPin } from "lucide-react";
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

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3 w-3",
            s <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-white/20"
          )}
        />
      ))}
    </div>
  );
}

export default function SuccessStoriesTable({ items = [], onView, onEdit, onDelete, onToggle }) {
  const { t, i18n, ready } = useTranslation();
  const lang = i18n.language || "en";
  const [mounted, setMounted] = useState(false);
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !ready || safeItems.length === 0) return null;

  const headers = [
    t("successStories.person"),
    t("successStories.company"),
    t("successStories.rating"),
    t("successStories.location"),
    t("successStories.order"),
    t("successStories.status"),
    t("successStories.date"),
    t("successStories.actions"),
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
            const imgUrl = item.profilePicture ? getFileUrl(item.profilePicture) : null;

            const displayFullName = resolveField(item.fullNameMultilingual, item.fullName, lang) || "—";
            const displayCompanyName = resolveField(item.companyNameMultilingual, item.companyName, lang) || "—";
            const displayLocation = resolveField(item.locationMultilingual, item.location, lang) || "—";

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
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100 dark:border-white/[0.08] shrink-0 bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={displayFullName}
                          className="object-cover w-full h-full"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-sm font-black text-muted-foreground">
                          {displayFullName?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[140px]">
                        {displayFullName}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <p className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                    {displayCompanyName}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <RatingStars rating={item.rating} />
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[100px]">
                      {displayLocation}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-sm font-bold text-foreground">{item.displayOrder ?? 0}</span>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg", item.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", item.isActive ? "bg-emerald-500" : "bg-gray-400")} />
                    {item.isActive ? t("successStories.activeStatus") : t("successStories.inactiveStatus")}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground">
                    {formatDate(item.storyDate || item.createdAt)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("successStories.view")}><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onEdit?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("successStories.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
                    <button
                      onClick={() => onToggle?.(item)}
                      className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer", item.isActive ? "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-muted-foreground hover:text-amber-600" : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600")}
                      title={item.isActive ? t("successStories.deactivate") : t("successStories.activate")}
                    >
                      {item.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => onDelete?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("successStories.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
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