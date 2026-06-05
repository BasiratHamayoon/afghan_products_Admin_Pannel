"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Trash2, Star, User, Building, Package } from "lucide-react";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";

function ReviewTypeIcon({ type, productName, businessName }) {
  if (type === "SELLER" || businessName) return <Building className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />;
  return <Package className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />;
}

function getSubjectLabel(review) {
  if (review.productName) return { name: review.productName, type: "Product" };
  if (review.businessName) return { name: review.businessName, type: "Business" };
  if (review.type === "SELLER") return { name: "Seller Review", type: "Seller" };
  if (review.type === "PRODUCT") return { name: "Product Review", type: "Product" };
  return { name: "—", type: "—" };
}

export default function ReviewTable({ items, onToggleVisibility, onDelete }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
            {["User", "Subject", "Rating", "Comment", "Type", "Visibility", "Date", "Actions"].map((h) => (
              <th
                key={h}
                className="text-left py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeItems.map((review, i) => {
            const subject = getSubjectLabel(review);
            return (
              <motion.tr
                key={review.id || i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-[#0F69B0]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground truncate max-w-[140px]">
                        {review.userName || "Unknown"}
                      </p>
                      {review.userEmail && (
                        <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">
                          {review.userEmail}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <ReviewTypeIcon type={review.type} productName={review.productName} businessName={review.businessName} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate max-w-[160px]">
                        {subject.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {subject.type}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3 w-3",
                          s <= (review.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-200 dark:text-white/10"
                        )}
                      />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-1">
                      {review.rating || 0}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 max-w-[250px]">
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 leading-relaxed">
                    {review.comment || "No comment"}
                  </p>
                </td>
                <td className="py-4 px-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0F69B0]/10 text-[#0F69B0] whitespace-nowrap">
                    {review.type || "—"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg",
                      review.isVisible
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-500"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        review.isVisible ? "bg-emerald-500" : "bg-red-500"
                      )}
                    />
                    {review.isVisible ? "Visible" : "Hidden"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                    {formatDate(review.createdAt)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleVisibility?.(review)}
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                        review.isVisible
                          ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500"
                          : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-muted-foreground hover:text-emerald-600"
                      )}
                      title={review.isVisible ? "Hide Review" : "Show Review"}
                    >
                      {review.isVisible ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete?.(review)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                      title="Delete"
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