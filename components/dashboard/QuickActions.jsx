"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { fetchUserYearData } from "@/store/actions/dashboardActions";
import { setSelectedUserYear } from "@/store/slices/dashboardSlice";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { useTranslation } from "react-i18next";

const YEAR_OPTIONS = [2024, 2025, 2026];

const PENDING_COLORS = {
  "Pending Orders": "bg-blue-500",
  "Pending Trade Leads": "bg-purple-500",
  "Pending Products": "bg-amber-500",
  "Pending Seller/Business": "bg-red-500",
};

const PENDING_ROUTES = {
  "Pending Orders": "/orders",
  "Pending Trade Leads": "/trade-leads",
  "Pending Products": "/products",
  "Pending Seller/Business": "/verifications",
};

const PENDING_TRANSLATION_KEYS = {
  "Pending Orders": "dashboard.pendingOrders",
  "Pending Trade Leads": "dashboard.pendingTradeLeads",
  "Pending Products": "dashboard.pendingProducts",
  "Pending Seller/Business": "dashboard.pendingSellerBusiness",
};

function Skeleton({ className }) {
  return <div className={`rounded-xl bg-gray-100 dark:bg-white/[0.06] animate-pulse ${className}`} />;
}

function BarChartSkeleton() {
  return (
    <div className="relative w-full h-[240px]">
      <div className="absolute bottom-6 left-0 right-0 flex items-end gap-2 px-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex-1 flex gap-0.5 justify-center items-end">
            <Skeleton className="w-2/5 rounded-t" style={{ height: `${25 + (i % 4) * 15}%` }} />
            <Skeleton className="w-2/5 rounded-t opacity-50" style={{ height: `${15 + (i % 3) * 12}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickActionSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
      <Skeleton className="h-3.5 w-36" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-8 rounded-full" />
        <Skeleton className="h-3.5 w-3.5" />
      </div>
    </div>
  );
}

export default function QuickActions() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { userYearData, userYearLoading, selectedUserYear, pendingItems } = useSelector(
    (state) => state.dashboard
  );

  const handleYearChange = (year) => {
    dispatch(setSelectedUserYear(year));
    dispatch(fetchUserYearData(year));
  };

  const chartData = userYearData.map((item) => ({
    month: item.month,
    users: item.buyers || 0,
    sellers: item.sellers || 0,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="lg:col-span-2 rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-base font-black text-foreground">
              {t("dashboard.userGrowth")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              {t("dashboard.userGrowthSubtitle")} ({selectedUserYear})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedUserYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="h-8 px-2.5 rounded-xl text-[11px] font-bold border border-gray-100 dark:border-white/[0.08] bg-transparent text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0F69B0]/30"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#0F69B0]" />
                <span className="text-xs font-semibold text-muted-foreground">
                  {t("dashboard.buyers")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#0F69B0]/25" />
                <span className="text-xs font-semibold text-muted-foreground">
                  {t("dashboard.sellers")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {userYearLoading ? (
          <BarChartSkeleton />
        ) : chartData.length > 0 ? (
          <BarChartComponent
            data={chartData}
            bars={[
              { dataKey: "users", color: "#0F69B0", name: t("dashboard.buyers") },
              { dataKey: "sellers", color: "rgba(15,105,176,0.25)", name: t("dashboard.sellers") },
            ]}
            height={240}
            xKey="month"
            barSize={18}
            barGap={6}
          />
        ) : (
          <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground font-medium">
            {t("dashboard.noUserData")} {selectedUserYear}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        className="rounded-2xl p-6 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.2)]"
      >
        <div className="mb-5">
          <h2 className="text-base font-black text-foreground">
            {t("dashboard.quickActions")}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            {t("dashboard.quickActionsSubtitle")}
          </p>
        </div>

        {userYearLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <QuickActionSkeleton key={i} />
            ))}
          </div>
        ) : pendingItems.length > 0 ? (
          <div className="space-y-2">
            {pendingItems.map((item, i) => {
              const color = PENDING_COLORS[item.name] || "bg-gray-500";
              const route = PENDING_ROUTES[item.name] || "/dashboard";
              const translationKey = PENDING_TRANSLATION_KEYS[item.name];
              const displayName = translationKey ? t(translationKey) : item.name;
              return (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  whileHover={{ x: 3, transition: { duration: 0.15 } }}
                  onClick={() => router.push(route)}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-sm group cursor-pointer bg-[#0F69B0]/[0.03] dark:bg-[#0F69B0]/[0.06] border border-[#0F69B0]/[0.08] dark:border-[#0F69B0]/[0.12] hover:bg-[#0F69B0]/[0.08] dark:hover:bg-[#0F69B0]/[0.12] hover:border-[#0F69B0]/20"
                >
                  <span className="font-semibold text-foreground text-xs">{displayName}</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${color}`}>
                      {item.count}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-[#0F69B0] transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground font-medium">
            {t("dashboard.noPendingItems")} 🎉
          </div>
        )}
      </motion.div>
    </div>
  );
}