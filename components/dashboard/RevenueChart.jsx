"use client";

import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { fetchRevenueByYear } from "@/store/actions/dashboardActions";
import { setSelectedRevenueYear } from "@/store/slices/dashboardSlice";
import { formatCurrency } from "@/lib/formatters";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import DoughnutChart from "@/components/charts/DoughnutChartComponent";

const CATEGORY_COLORS = [
  "#0F69B0", "#7c3aed", "#10b981",
  "#f59e0b", "#ef4444", "#06b6d4",
  "#6366f1", "#ec4899", "#14b8a6",
];

const YEAR_OPTIONS = [2024, 2025, 2026];

function Skeleton({ className }) {
  return <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />;
}

function AreaChartSkeleton() {
  return (
    <div className="relative w-full overflow-hidden h-[260px]">
      <div className="absolute bottom-6 left-0 right-0 flex items-end gap-0 px-2">
        {Array.from({ length: 12 }).map((_, i) => {
          const h = 30 + ((Math.sin(i * 0.8) + 1) / 2) * 55;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <Skeleton className="w-full rounded-t" style={{ height: `${h}%` }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryRowSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-2.5 w-2.5 rounded-full" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-2.5 w-16" />
        <Skeleton className="h-1 w-14 rounded-full" />
        <Skeleton className="h-2.5 w-8" />
      </div>
    </div>
  );
}

export default function RevenueChart() {
  const dispatch = useDispatch();
  const { revenueData, revenueLoading, selectedRevenueYear, categories } = useSelector(
    (state) => state.dashboard
  );

  const handleYearChange = (year) => {
    dispatch(setSelectedRevenueYear(year));
    dispatch(fetchRevenueByYear(year));
  };

  const totalRevenue = revenueData.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalProducts = categories.reduce((sum, c) => sum + (c.productsCount || 0), 0);

  const categoryDistribution = categories.map((c, i) => ({
    name: c.categoryName || `Category ${i + 1}`,
    value: totalProducts > 0 ? Math.round((c.productsCount / totalProducts) * 100) : 0,
    count: c.productsCount || 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-black text-foreground">Revenue Overview</h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Monthly revenue performance for {selectedRevenueYear}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedRevenueYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="h-8 px-2.5 rounded-xl text-[11px] font-bold border border-gray-100 dark:border-white/[0.08] bg-transparent text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F69B0]/30"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {totalRevenue > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#0F69B0]/10 dark:bg-[#0F69B0]/15 text-[#0F69B0]">
                <TrendingUp className="h-3 w-3" />
                {formatCurrency(totalRevenue)}
              </div>
            )}
          </div>
        </div>

        {revenueLoading ? (
          <AreaChartSkeleton />
        ) : revenueData.length > 0 ? (
          <AreaChartComponent
            data={revenueData}
            areas={[{ dataKey: "revenue", color: "#0F69B0", name: "Revenue" }]}
            height={260}
            xKey="month"
            formatter={formatCurrency}
            yTickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : String(v)}
          />
        ) : (
          <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground font-medium">
            No revenue data for {selectedRevenueYear}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl p-6 flex flex-col bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="mb-4">
          <h2 className="text-base font-black text-foreground">Categories</h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            Product distribution ({totalProducts} total)
          </p>
        </div>

        {revenueLoading ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-center my-4">
              <Skeleton className="h-[150px] w-[150px] rounded-full" />
            </div>
            <div className="space-y-2.5 mt-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CategoryRowSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : categoryDistribution.length > 0 ? (
          <>
            <DoughnutChart
              data={categoryDistribution}
              height={180}
              innerRadius={48}
              outerRadius={75}
              centerValue={`${categories.length}`}
              centerLabel="Categories"
            />
            <div className="space-y-2.5 mt-4">
              {categoryDistribution.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-[100px]">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium">{cat.count} products</span>
                    <div className="h-1 w-14 rounded-full overflow-hidden bg-gray-100 dark:bg-white/[0.06]">
                      <div className="h-full rounded-full" style={{ width: `${Math.max(cat.value, 2)}%`, backgroundColor: cat.color }} />
                    </div>
                    <span className="text-xs font-black text-foreground w-8 text-right">{cat.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground font-medium">
            No category data
          </div>
        )}
      </motion.div>
    </div>
  );
}