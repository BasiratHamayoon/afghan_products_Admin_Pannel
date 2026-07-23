"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />
      <DashboardStats />
      <RevenueChart />
      <QuickActions />
    </div>
  );
}