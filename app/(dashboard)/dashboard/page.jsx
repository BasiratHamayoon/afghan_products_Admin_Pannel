"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RevenueChart from "@/components/dashboard/RevenueChart";
import QuickActions from "@/components/dashboard/QuickActions";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import TopProducts from "@/components/dashboard/TopProducts";

export default function DashboardPage() {
  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here is your store overview."
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #0F69B0 0%, #0A4F85 100%)",
            boxShadow: "0 4px 14px rgba(15,105,176,0.3)",
          }}
        >
          <Download className="h-4 w-4" />
          Download Report
        </motion.button>
      </PageHeader>

      <DashboardStats />
      <RevenueChart />
      <QuickActions />
      <ActivityFeed />
      <TopProducts />
    </div>
  );
}