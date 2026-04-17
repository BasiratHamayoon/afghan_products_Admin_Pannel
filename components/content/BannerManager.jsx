"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, ExternalLink, Star, StarOff, ToggleLeft, ToggleRight } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/helpers";
import { bannerPositionOptions } from "@/data/dummyContent";
import { cn } from "@/lib/utils";

function PositionBadge({ position }) {
  const opt = bannerPositionOptions.find((p) => p.value === position);
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0F69B0]/8 text-[#0F69B0]">
      {opt?.label || position}
    </span>
  );
}

function StatPill({ label, value }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
      <p className="text-xs font-black text-foreground">{value}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  );
}

export default function BannerManager({ banners, onView, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  return (
    <div className="space-y-3">
      {(banners || []).map((banner, i) => (
        <motion.div
          key={banner.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="group rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all shadow-[0_1px_6px_rgba(15,105,176,0.04)] overflow-hidden"
        >
          <div className="flex items-start gap-4 p-4">
            <div className="h-20 w-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/[0.04] shrink-0 border border-gray-100 dark:border-white/[0.06]">
              {banner.image ? (
                <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="text-sm font-black text-foreground truncate">{banner.title}</h3>
                    {banner.featured && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">{banner.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PositionBadge position={banner.position} />
                  <StatusBadge status={banner.status} />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="text-[10px] text-muted-foreground font-medium">
                  🔗 <span className="text-[#0F69B0] font-semibold">{banner.link}</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {formatDate(banner.startDate)} → {formatDate(banner.endDate)}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground">Priority: #{banner.priority}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <StatPill label="Impressions" value={(banner.impressions || 0).toLocaleString()} />
                  <StatPill label="Clicks" value={(banner.clicks || 0).toLocaleString()} />
                  <StatPill label="CTR" value={banner.impressions ? `${((banner.clicks / banner.impressions) * 100).toFixed(1)}%` : "0%"} />
                </div>
                <div className="ml-auto flex items-center gap-1 transition-opacity">
                  <button onClick={() => onView?.(banner)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="View">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onEdit?.(banner)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onToggleFeatured?.(banner)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-muted-foreground hover:text-yellow-500 transition-all cursor-pointer">
                    {banner.featured ? <StarOff className="h-3.5 w-3.5" /> : <Star className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => onToggleStatus?.(banner)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-all cursor-pointer">
                    {banner.status === "active" ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => onDelete?.(banner)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}