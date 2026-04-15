"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, ToggleLeft, ToggleRight, TrendingUp } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/helpers";
import { adTypeOptions, adPlacementOptions } from "@/data/dummyContent";
import { cn } from "@/lib/utils";

function TypeBadge({ type }) {
  const opt = adTypeOptions.find((t) => t.value === type);
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: `${opt?.color || "#0F69B0"}15`, color: opt?.color || "#0F69B0" }}>
      {opt?.label || type}
    </span>
  );
}

function PlacementBadge({ placement }) {
  const opt = adPlacementOptions.find((p) => p.value === placement);
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">
      {opt?.label || placement}
    </span>
  );
}

function MetricBar({ label, value, max, color }) {
  const pct = max ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-black text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
      </div>
      <div className="h-1 rounded-full bg-gray-100 dark:bg-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function AdManager({ ads, onView, onEdit, onDelete, onToggleStatus }) {
  return (
    <div className="space-y-3">
      {(ads || []).map((ad, i) => (
        <motion.div
          key={ad.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="group rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all shadow-[0_1px_6px_rgba(15,105,176,0.04)] p-5"
        >
          <div className="flex items-start gap-4">
            <div className="h-16 w-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/[0.04] shrink-0 border border-gray-100 dark:border-white/[0.06]">
              {ad.image ? (
                <img src={ad.image} alt={ad.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-muted-foreground/30" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-foreground truncate mb-1">{ad.title}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <TypeBadge type={ad.type} />
                    <PlacementBadge placement={ad.placement} />
                    <StatusBadge status={ad.status} />
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => onView?.(ad)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="View">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onEdit?.(ad)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onToggleStatus?.(ad)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-all cursor-pointer">
                    {ad.status === "active" ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => onDelete?.(ad)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground font-medium mb-3 line-clamp-1">{ad.description}</p>

              <div className="flex items-center gap-4 flex-wrap text-[11px] text-muted-foreground font-medium mb-3">
                <span>By: <span className="font-bold text-foreground">{ad.advertiser?.name}</span></span>
                <span>Budget: <span className="font-bold text-foreground">${ad.budget}</span></span>
                <span>Spent: <span className="font-bold text-foreground">${ad.spent}</span></span>
                <span>CPC: <span className="font-bold text-foreground">${ad.cpc}</span></span>
                <span>{formatDate(ad.startDate)} → {formatDate(ad.endDate)}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <MetricBar label="Impressions" value={ad.impressions} max={50000} color="#0F69B0" />
                <MetricBar label="Clicks" value={ad.clicks} max={1000} color="#7c3aed" />
                <MetricBar label="Conversions" value={ad.conversions} max={100} color="#10b981" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}