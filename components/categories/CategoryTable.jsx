"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Edit2, Trash2, Eye, ToggleLeft, ToggleRight, ChevronRight, Star, StarOff } from "lucide-react";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function CategoryTable({ categories, onEdit, onDelete, onView, onToggleStatus, onToggleFeatured }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["Category", "Level", "Products", "Status", "Featured", "Created", "Actions"].map((h) => (
              <th
                key={h}
                className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <motion.tr
              key={cat.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    {cat.image ? (
                      <div className="h-10 w-10 rounded-xl overflow-hidden border border-gray-100 dark:border-white/[0.08]">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                        style={{ background: `${cat.color}18` }}
                      >
                        {cat.icon}
                      </div>
                    )}
                    {cat.level > 1 && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#0F69B0] flex items-center justify-center">
                        <span className="text-[8px] text-white font-black">{cat.level}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate max-w-[180px]">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5 truncate max-w-[180px]">
                      /{cat.slug}
                    </p>
                    {cat.parentName && (
                      <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5 flex items-center gap-1">
                        <ChevronRight className="h-2.5 w-2.5" />
                        {cat.parentName}
                      </p>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span
                  className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
                  style={{
                    background: cat.level === 1 ? "rgba(15,105,176,0.1)" : cat.level === 2 ? "rgba(124,58,237,0.1)" : "rgba(16,185,129,0.1)",
                    color: cat.level === 1 ? "#0F69B0" : cat.level === 2 ? "#7c3aed" : "#10b981",
                  }}
                >
                  Level {cat.level}
                </span>
              </td>
              <td className="py-4 px-4">
                <span className="text-sm font-bold text-foreground">{cat.productsCount?.toLocaleString()}</span>
                <p className="text-[10px] text-muted-foreground font-medium">products</p>
              </td>
              <td className="py-4 px-4">
                <StatusBadge status={cat.status} />
              </td>
              <td className="py-4 px-4">
                <button
                  onClick={() => onToggleFeatured?.(cat)}
                  className="cursor-pointer transition-colors"
                >
                  {cat.featured ? (
                    <Star className="h-4.5 w-4.5 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4.5 w-4.5 text-muted-foreground/40 hover:text-yellow-400 transition-colors" />
                  )}
                </button>
              </td>
              <td className="py-4 px-4">
                <span className="text-xs font-medium text-muted-foreground">{formatDate(cat.createdAt)}</span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 transition-opacity">
                  <button
                    onClick={() => onView?.(cat)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                    title="View"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onEdit?.(cat)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-[#0F69B0]/10 text-muted-foreground hover:text-[#0F69B0] transition-all cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onToggleStatus?.(cat)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-green-50 dark:hover:bg-green-900/20 text-muted-foreground hover:text-green-600 transition-all cursor-pointer"
                    title="Toggle Status"
                  >
                    {cat.status === "active" ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => onDelete?.(cat)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                    title="Delete"
                  >
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