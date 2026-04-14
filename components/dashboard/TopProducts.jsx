"use client";

import { motion } from "framer-motion";
import { Package, TrendingUp } from "lucide-react";
import { topProducts } from "@/data/dummyStats";
import { formatCurrency } from "@/lib/formatters";

export default function TopProducts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="rounded-2xl p-6 mb-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-black text-foreground">Top Products</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Best performing products this month
          </p>
        </div>
        <button className="text-[11px] font-bold cursor-pointer px-3 py-1.5 rounded-xl text-[#0F69B0] bg-[#0F69B0]/10 dark:bg-[#0F69B0]/15 hover:bg-[#0F69B0]/15 dark:hover:bg-[#0F69B0]/20 transition-colors">
          View All →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-50 dark:border-white/[0.04]">
              {["#", "Product", "Sales", "Revenue", "Growth"].map((h) => (
                <th
                  key={h}
                  className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topProducts.map((product, i) => (
              <motion.tr
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 + i * 0.06 }}
                className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-4 px-4">
                  <span
                    className="text-xs font-black"
                    style={{ color: i < 3 ? "#0F69B0" : "#94a3b8" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: i < 3
                          ? "linear-gradient(135deg, rgba(15,105,176,0.15) 0%, rgba(15,105,176,0.06) 100%)"
                          : "rgba(0,0,0,0.04)",
                      }}
                    >
                      <Package
                        className="h-4 w-4"
                        style={{ color: i < 3 ? "#0F69B0" : "#94a3b8" }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{product.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                        SKU #{String(product.id).padStart(4, "0")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-bold text-foreground">{product.sales}</span>
                  <p className="text-[10px] text-muted-foreground font-medium">units</p>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(product.revenue)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  >
                    <TrendingUp className="h-3 w-3" />
                    {product.growth}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}