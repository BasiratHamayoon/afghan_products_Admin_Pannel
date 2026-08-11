"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { useTranslation } from "react-i18next";

const resolveField = (multiObj, flatFallback, lang) => {
  if (multiObj && typeof multiObj === "object" && !Array.isArray(multiObj)) {
    return multiObj[lang] || multiObj.en || multiObj.fa || multiObj.ps || (typeof flatFallback === "string" ? flatFallback : "") || "";
  }
  return typeof flatFallback === "string" ? flatFallback : "";
};

export default function AboutTable({ items = [], onView, onEdit, onDelete }) {
  const { t, i18n, ready } = useTranslation();
  const lang = i18n.language || "en";
  const [mounted, setMounted] = useState(false);
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !ready || safeItems.length === 0) return null;

  const headers = [
    t("about.headlineField"),
    t("about.subHeadlineField"),
    t("about.missionTitleField"),
    t("about.featuresLabel"),
    t("about.liveStats"),
    t("about.createdField"),
    t("about.actions"),
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {headers.map((h) => (
              <th
                key={h}
                className="text-start py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((item, i) => {
            if (!item?.id) return null;

            const displayHeadline = resolveField(item.headlineMultilingual, item.headline, lang) || "—";
            const displaySubHeadline = resolveField(item.subHeadlineMultilingual, item.subHeadline, lang) || "—";
            const displayMissionTitle = resolveField(item.missionTitleMultilingual, item.missionTitle, lang) || "—";

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
                    <div className="h-10 w-10 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                      <span className="text-lg">📄</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[200px]">
                        {displayHeadline}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 max-w-[180px]">
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                    {displaySubHeadline}
                  </p>
                </td>
                <td className="py-4 px-4 max-w-[160px]">
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2">
                    {displayMissionTitle}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-600">
                    {item.features?.length || 0}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600">
                    {item.stats?.length || 0}
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
                      title={t("about.view")}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit?.(item)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                      title={t("about.edit")}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete?.(item)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                      title={t("about.delete")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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