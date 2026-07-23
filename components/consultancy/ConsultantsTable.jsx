"use client";

import { motion } from "framer-motion";
import { Eye, Edit2, Trash2, Star, DollarSign } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { getFileUrl } from "@/lib/fileUrl";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

function RatingStars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={cn("h-3 w-3", s <= Math.round(rating) ? "text-amber-500 fill-amber-500" : "text-gray-300 dark:text-white/20")} />
      ))}
      <span className="ml-1 text-[10px] font-bold text-muted-foreground">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

export default function ConsultantsTable({ items = [], onView, onEdit, onDelete }) {
  const { t } = useTranslation();
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  const headers = [
    t("consultancy.consultant"),
    t("consultancy.specialization"),
    t("consultancy.rate"),
    t("consultancy.rating"),
    t("consultancy.sessions"),
    t("consultancy.languages"),
    t("consultancy.status"),
    t("consultancy.created"),
    t("consultancy.actions"),
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
            const imgUrl = item.profileImage ? getFileUrl(item.profileImage) : null;

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
                        <img src={imgUrl} alt={item.name} className="object-cover w-full h-full" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <span className="text-sm font-black text-muted-foreground">{item.name?.charAt(0) || "?"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[140px]">{item.name || "—"}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[140px]">{item.title || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600 capitalize whitespace-nowrap">{item.specialization || "—"}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-muted-foreground/50" />
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">{item.hourlyRateMin} - {item.hourlyRateMax}/hr</span>
                  </div>
                </td>
                <td className="py-4 px-4"><RatingStars rating={item.rating} /></td>
                <td className="py-4 px-4"><span className="text-sm font-bold text-foreground">{item.totalSessions}</span></td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1 flex-wrap max-w-[100px]">
                    {item.languages?.slice(0, 2).map((lang, j) => (
                      <span key={j} className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">{lang}</span>
                    ))}
                    {item.languages?.length > 2 && (
                      <span className="text-[10px] text-muted-foreground font-medium">+{item.languages.length - 2}</span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg", item.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-gray-500/10 text-gray-500")}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", item.isActive ? "bg-emerald-500" : "bg-gray-400")} />
                    {item.isActive ? t("consultancy.activeStatus") : t("consultancy.inactiveStatus")}
                  </span>
                </td>
                <td className="py-4 px-4"><span className="text-xs font-medium text-muted-foreground">{formatDate(item.createdAt)}</span></td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onView?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("consultancy.view")}><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onEdit?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title={t("consultancy.edit")}><Edit2 className="h-3.5 w-3.5" /></button>
                    <button onClick={() => onDelete?.(item)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title={t("consultancy.delete")}><Trash2 className="h-3.5 w-3.5" /></button>
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