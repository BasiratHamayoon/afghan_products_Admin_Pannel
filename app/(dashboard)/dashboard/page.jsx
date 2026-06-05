"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Download } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RevenueChart from "@/components/dashboard/RevenueChart";
import QuickActions from "@/components/dashboard/QuickActions";
import {
  fetchDashboardStats,
  fetchRevenueByYear,
  fetchUserYearData,
} from "@/store/actions/dashboardActions";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { selectedRevenueYear, selectedUserYear } = useSelector((state) => state.dashboard);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchDashboardStats());
    dispatch(fetchRevenueByYear(selectedRevenueYear));
    dispatch(fetchUserYearData(selectedUserYear));
  }, [dispatch]);

  return (
    <div>
      <Breadcrumb />
      <PageHeader title="Dashboard" description="Welcome back! Here is your store overview.">
      </PageHeader>

      <DashboardStats />
      <RevenueChart />
      <QuickActions />
    </div>
  );
}