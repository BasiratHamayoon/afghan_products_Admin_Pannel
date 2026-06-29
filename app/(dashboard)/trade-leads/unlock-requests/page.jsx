"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Unlock, RefreshCw, CheckCircle, XCircle, Clock,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import UnlockRequestsTable from "@/components/trade-leads/UnlockRequestsTable";
import { fetchUnlockRequests } from "@/store/actions/tradeLeadsActions";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Mail, Link } from "lucide-react";

const TABS = [
  { id: "all", label: "All Requests" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
];

const statusConfig = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    dot: "bg-amber-500",
  },
  APPROVED: {
    label: "Approved",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-red-500/10",
    text: "text-red-500",
    dot: "bg-red-500",
  },
};

const PAGE_LIMIT = 10;

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function UnlockRequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { unlockRequests, unlockRequestsLoading, unlockPagination } =
    useSelector((state) => state.tradeLeads);

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const hasFetched = useRef(false);

  const triggerFetch = useCallback(
    (page, status) => {
      dispatch(
        fetchUnlockRequests({
          page,
          limit: PAGE_LIMIT,
          status: status !== "all" ? status : undefined,
        })
      );
    },
    [dispatch]
  );

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    triggerFetch(1, "all");
  }, [triggerFetch]);

  const handleTabChange = useCallback(
    (tab) => {
      setActiveTab(tab);
      setCurrentPage(1);
      triggerFetch(1, tab);
    },
    [triggerFetch]
  );

  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page);
      triggerFetch(page, activeTab);
    },
    [activeTab, triggerFetch]
  );

  const handleRefresh = useCallback(() => {
    triggerFetch(currentPage, activeTab);
  }, [currentPage, activeTab, triggerFetch]);

  const safeRequests = Array.isArray(unlockRequests)
    ? unlockRequests.filter(Boolean)
    : [];
  const total = unlockPagination?.total || safeRequests.length;
  const totalPages = unlockPagination?.totalPages || 1;
  const from =
    total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: safeRequests.length,
    PENDING: safeRequests.filter((r) => r.status === "PENDING").length,
    APPROVED: safeRequests.filter((r) => r.status === "APPROVED").length,
    REJECTED: safeRequests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Unlock Requests"
        description="View seller requests to unlock trade lead contact details"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title="Total Requests"
          value={total}
          icon={Unlock}
          color="rgba(15,105,176,0.08)"
          index={0}
        />
        <StatsCard
          title="Pending"
          value={tabCounts.PENDING}
          icon={Clock}
          color="rgba(245,158,11,0.08)"
          index={1}
        />
        <StatsCard
          title="Approved"
          value={tabCounts.APPROVED}
          icon={CheckCircle}
          color="rgba(16,185,129,0.08)"
          index={2}
        />
        <StatsCard
          title="Rejected"
          value={tabCounts.REJECTED}
          icon={XCircle}
          color="rgba(239,68,68,0.08)"
          index={3}
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2",
                activeTab === tab.id
                  ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                  activeTab === tab.id
                    ? "bg-[#0F69B0] text-white"
                    : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground"
                )}
              >
                {tabCounts[tab.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <p className="text-[11px] text-muted-foreground font-medium">
              {safeRequests.length} request
              {safeRequests.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="p-4">
          {unlockRequestsLoading ? (
            <LoadingSpinner
              size="lg"
              text="Loading unlock requests..."
              className="py-16"
            />
          ) : safeRequests.length === 0 ? (
            <EmptyState
              icon={Unlock}
              title="No unlock requests"
              description="No sellers have requested to unlock trade leads yet"
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        borderBottom:
                          "2px solid rgba(15,105,176,0.06)",
                      }}
                    >
                      {[
                        "Seller",
                        "Trade Lead",
                        "Status",
                        "Requested At",
                      ].map((h) => (
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
                    {safeRequests.map((req, i) => {
                      if (!req?.id) return null;
                      const sc =
                        statusConfig[req.status] ||
                        statusConfig.PENDING;

                      return (
                        <motion.tr
                          key={req.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.035 }}
                          className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)",
                                }}
                              >
                                {getInitials(req.sellerName)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-foreground truncate max-w-[130px]">
                                  {req.sellerName || "—"}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Mail className="h-3 w-3 text-muted-foreground/50" />
                                  <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[130px]">
                                    {req.sellerEmail || "—"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5">
                              <Link className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                              <button
                                onClick={() =>
                                  req.tradeLeadId &&
                                  router.push(
                                    `/trade-leads/${req.tradeLeadId}`
                                  )
                                }
                                className="text-xs font-medium text-[#0F69B0] hover:underline cursor-pointer truncate max-w-[150px]"
                              >
                                {req.tradeLeadProduct ||
                                  (req.tradeLeadId
                                    ? req.tradeLeadId
                                        .toString()
                                        .slice(0, 12) + "..."
                                    : "—")}
                              </button>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap",
                                sc.bg,
                                sc.text
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  sc.dot
                                )}
                              />
                              {sc.label}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {formatDate(req.createdAt)}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  from={from}
                  to={to}
                  total={total}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}