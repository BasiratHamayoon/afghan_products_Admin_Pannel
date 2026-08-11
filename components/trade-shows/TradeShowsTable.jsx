"use client";

import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, MapPin, Calendar, Star, ImageIcon } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const resolveField = (multiObj, flatFallback, lang) => {
  if (multiObj && typeof multiObj === "object" && !Array.isArray(multiObj)) {
    return multiObj[lang] || multiObj.en || multiObj.fa || multiObj.ps || (typeof flatFallback === "string" ? flatFallback : "") || "";
  }
  return typeof flatFallback === "string" ? flatFallback : "";
};

export default function TradeShowsTable({ items = [], onView, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  const formatDateRange = (start, end) => {
    if (!start) return "—";
    const s = new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!end) return s;
    const e = new Date(end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${s} - ${e}`;
  };

  const getStatus = (item) => {
    if (!item.isActive) return { label: t("tradeShows.statusInactive"), bg: "bg-gray-500/10", text: "text-gray-500", dot: "bg-gray-400" };
    const now = new Date();
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);
    if (now < start) return { label: t("tradeShows.statusUpcoming"), bg: "bg-blue-500/10", text: "text-blue-600", dot: "bg-blue-500" };
    if (now >= start && now <= end) return { label: t("tradeShows.statusOngoing"), bg: "bg-emerald-500/10", text: "text-emerald-600", dot: "bg-emerald-500" };
    return { label: t("tradeShows.statusEnded"), bg: "bg-amber-500/10", text: "text-amber-600", dot: "bg-amber-500" };
  };

  const headers = [
    t("tradeShows.tradeShow"),
    t("tradeShows.location"),
    t("tradeShows.dates"),
    t("tradeShows.image"),
    t("tradeShows.status"),
    t("tradeShows.featuredLabel"),
    t("tradeShows.created"),
    t("tradeShows.actions"),
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
            const status = getStatus(item);
            const hasImage = !!item.image;
            const galleryCount = item.gallery?.length || 0;

            const displayTitle = resolveField(item.titleMultilingual, item.title, lang) || "—";
            const displayOrganizer = resolveField(item.organizerMultilingual, item.organizer, lang);
            const displayCity = resolveField(item.cityMultilingual, item.city, lang);
            const displayCountry = resolveField(item.countryMultilingual, item.country, lang);

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
                    <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08] shrink-0 bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center">
                      {hasImage ? (
                        <img src={item.image} alt={displayTitle} className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"; }} />
                      ) : null}
                      <span className="text-xl" style={{ display: hasImage ? "none" : "flex" }}>🎪</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[180px]">{displayTitle}</p>
                      {displayOrganizer && (
                        <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[160px]">
                          {t("tradeShows.byOrganizer")} {displayOrganizer}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]">
                      {[displayCity, displayCountry].filter(Boolean).join(", ") || "—"}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{formatDateRange(item.startDate, item.endDate)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {hasImage ? "✓" : "—"}
                      {galleryCount > 0 && <span className="ml-1 text-[10px] text-[#0F69B0]">+{galleryCount}</span>}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap", status.bg, status.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />{status.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {item.isFeatured
                    ? <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    : <Star className="h-4 w-4 text-gray-300 dark:text-white/20" />
                  }
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground">{formatDate(item.createdAt)}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("tradeShows.view")}><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onEdit?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("tradeShows.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onDelete?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("tradeShows.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
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