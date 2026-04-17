// components/consulting/ConsultantTable.jsx

"use client";

import { motion } from "framer-motion";
import { Edit2, Trash2, Eye, Star, CheckCircle, XCircle } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/helpers";
import { availabilityOptions } from "@/data/dummyConsulting";

function AvailabilityBadge({ availability }) {
  const opt = availabilityOptions.find((a) => a.value === availability) || availabilityOptions[2];
  return (
    <span
      className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
      style={{ background: `${opt.color}15`, color: opt.color }}
    >
      {opt.label}
    </span>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      <span className="text-xs font-bold text-foreground">{rating?.toFixed(1) || "N/A"}</span>
    </div>
  );
}

export default function ConsultantTable({ consultants, onView, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Consultant", "Specialization", "Rate", "Rating", "Sessions", "Availability", "Status", "Actions"].map((h) => (
              <th key={h} className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(consultants || []).map((con, i) => (
            <motion.tr
              key={con.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black text-white"
                      style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                    >
                      {con.name?.charAt(0) || "?"}
                    </div>
                    {con.verified && (
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-foreground truncate max-w-[160px]">{con.name}</p>
                      {con.featured && <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[160px]">{con.title}</p>
                    <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5">{con.location}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-wrap gap-1 max-w-[180px]">
                  {(con.specializations || []).slice(0, 2).map((spec) => (
                    <span key={spec} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0F69B0]/8 text-[#0F69B0]">
                      {spec}
                    </span>
                  ))}
                  {(con.specializations || []).length > 2 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">
                      +{con.specializations.length - 2}
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-black text-foreground">${con.hourlyRate}</span>
                <p className="text-[10px] text-muted-foreground font-medium">/hour</p>
              </td>
              <td className="py-4 px-4">
                <StarRating rating={con.rating} />
                <p className="text-[10px] text-muted-foreground font-medium">{con.reviewsCount} reviews</p>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-bold text-foreground">{con.sessionsCompleted}</span>
                <p className="text-[10px] text-muted-foreground font-medium">completed</p>
              </td>
              <td className="py-4 px-4">
                <AvailabilityBadge availability={con.availability} />
              </td>
              <td className="py-4 px-4">
                <StatusBadge status={con.status} />
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 transition-opacity">
                  <button onClick={() => onView?.(con)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="View">
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onEdit?.(con)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer" title="Edit">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => onDelete?.(con)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}