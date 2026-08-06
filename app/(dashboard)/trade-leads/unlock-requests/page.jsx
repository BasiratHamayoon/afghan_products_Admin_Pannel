"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Unlock, RefreshCw, CheckCircle, XCircle, Clock,
  Mail, Building2, MapPin, AlertTriangle, ChevronRight,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchUnlockRequests,
  approveUnlockRequest,
  rejectUnlockRequest,
} from "@/store/actions/tradeLeadsActions";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

const PAGE_LIMIT = 10;

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function Avatar({ name, image, size = "md" }) {
  const sizeClass = size === "sm" ? "h-7 w-7 text-[9px]" : "h-9 w-9 text-[11px]";
  const baseUrl =
    process.env.NEXT_PUBLIC_API_DIRECT_URL?.replace("/v1", "") ||
    "https://api-afghanproduct.sanzylimited.com";

  if (image) {
    return (
      <img
        src={`${baseUrl}/uploads/${image}`}
        alt={name || ""}
        className={cn(sizeClass, "rounded-full object-cover shrink-0")}
        onError={(e) => { e.target.style.display = "none"; }}
      />
    );
  }

  return (
    <div
      className={cn(sizeClass, "rounded-full flex items-center justify-center font-black text-white shrink-0")}
      style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
    >
      {getInitials(name)}
    </div>
  );
}

export default function UnlockRequestsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const { unlockRequests, unlockRequestsLoading, unlockPagination } = useSelector(
    (state) => state.tradeLeads
  );

  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    requestId: null,
    label: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const hasFetched = useRef(false);

  const statusConfig = {
    PENDING: {
      label: t("tradeLeads.statusPending"),
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      dot: "bg-amber-500",
    },
    APPROVED: {
      label: t("tradeLeads.statusApproved"),
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    REJECTED: {
      label: t("tradeLeads.statusRejected"),
      bg: "bg-red-500/10",
      text: "text-red-500 dark:text-red-400",
      dot: "bg-red-500",
    },
  };

  const urgencyConfig = {
    HIGH: { label: t("tradeLeads.urgencyHigh"), color: "text-red-500", bg: "bg-red-500/10" },
    MEDIUM: { label: t("tradeLeads.urgencyMedium"), color: "text-amber-500", bg: "bg-amber-500/10" },
    LOW: { label: t("tradeLeads.urgencyLow"), color: "text-emerald-500", bg: "bg-emerald-500/10" },
  };

  const TABS = [
    { id: "all", label: t("tradeLeads.allRequests") },
    { id: "PENDING", label: t("tradeLeads.pending") },
    { id: "APPROVED", label: t("tradeLeads.approved") },
    { id: "REJECTED", label: t("tradeLeads.rejected") },
  ];

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

  const openConfirm = (type, requestId, label) => {
    setConfirmDialog({ open: true, type, requestId, label });
  };

  const closeConfirm = () => {
    setConfirmDialog({ open: false, type: null, requestId: null, label: "" });
  };

  const handleConfirmAction = async () => {
    const { type, requestId } = confirmDialog;
    if (!requestId) return;
    setActionLoading(true);
    try {
      const action = type === "approve" ? approveUnlockRequest : rejectUnlockRequest;
      const res = await dispatch(action(requestId));
      if (res?.success) {
        toast.success(
          type === "approve"
            ? t("tradeLeads.statusApproved")
            : t("tradeLeads.statusRejected")
        );
      } else {
        toast.error(res?.message || t("tradeLeads.somethingWentWrong"));
      }
    } catch {
      toast.error(t("tradeLeads.somethingWentWrong"));
    } finally {
      setActionLoading(false);
      closeConfirm();
    }
  };

  const safeRequests = Array.isArray(unlockRequests) ? unlockRequests.filter(Boolean) : [];
  const total = unlockPagination?.total || safeRequests.length;
  const totalPages = unlockPagination?.totalPages || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: total,
    PENDING: safeRequests.filter((r) => r.status === "PENDING").length,
    APPROVED: safeRequests.filter((r) => r.status === "APPROVED").length,
    REJECTED: safeRequests.filter((r) => r.status === "REJECTED").length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title={t("tradeLeads.unlockRequestsTitle")}
        description={t("tradeLeads.unlockRequestsDesc")}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title={t("tradeLeads.totalRequests")}
          value={total}
          icon={Unlock}
          color="rgba(15,105,176,0.08)"
          index={0}
        />
        <StatsCard
          title={t("tradeLeads.pending")}
          value={tabCounts.PENDING}
          icon={Clock}
          color="rgba(245,158,11,0.08)"
          index={1}
        />
        <StatsCard
          title={t("tradeLeads.approved")}
          value={tabCounts.APPROVED}
          icon={CheckCircle}
          color="rgba(16,185,129,0.08)"
          index={2}
        />
        <StatsCard
          title={t("tradeLeads.rejected")}
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
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("tradeLeads.refresh")}
            </button>
            <p className="text-[11px] text-muted-foreground font-medium">
              {safeRequests.length}{" "}
              {safeRequests.length !== 1
                ? t("tradeLeads.requestsPlural")
                : t("tradeLeads.requests")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {unlockRequestsLoading ? (
            <LoadingSpinner
              size="lg"
              text={t("tradeLeads.loadingUnlockRequests")}
              className="py-16"
            />
          ) : safeRequests.length === 0 ? (
            <EmptyState
              icon={Unlock}
              title={t("tradeLeads.noUnlockRequests")}
              description={t("tradeLeads.noUnlockRequestsDesc")}
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(15,105,176,0.06)" }}>
                      {[
                        t("tradeLeads.seller"),
                        t("tradeLeads.tradeLead"),
                        t("tradeLeads.postedBy"),
                        t("tradeLeads.urgency"),
                        t("tradeLeads.status"),
                        t("tradeLeads.requestedAt"),
                        t("tradeLeads.actions"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-start py-3.5 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeRequests.map((req, i) => {
                      if (!req?.id) return null;
                      const sc = statusConfig[req.status] || statusConfig.PENDING;
                      const urgency = req.tradeLead?.urgency
                        ? urgencyConfig[req.tradeLead.urgency]
                        : null;
                      const isPending = req.status === "PENDING";

                      return (
                        <motion.tr
                          key={req.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-gray-50 dark:border-white/[0.03] last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/[0.015] transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar
                                name={req.requestedBy?.fullName}
                                image={req.requestedBy?.image}
                              />
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-foreground truncate max-w-[140px]">
                                  {req.requestedBy?.fullName || "—"}
                                </p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Mail className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                  <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">
                                    {req.requestedBy?.email || "—"}
                                  </p>
                                </div>
                                {req.requestedBy?.businessName && (
                                  <div className="flex items-center gap-1 mt-0.5">
                                    <Building2 className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                    <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[140px]">
                                      {req.requestedBy.businessName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1 min-w-0">
                              <button
                                onClick={() =>
                                  req.tradeLead?.id &&
                                  router.push(`/trade-leads/${req.tradeLead.id}`)
                                }
                                className="flex items-center gap-1 text-[11px] font-bold text-[#0F69B0] hover:underline cursor-pointer"
                              >
                                <ChevronRight className="h-3 w-3 shrink-0" />
                                <span className="truncate max-w-[140px]">
                                  {req.tradeLead?.category || t("tradeLeads.tradeLead")}
                                </span>
                              </button>
                              {req.tradeLead?.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    {req.tradeLead.location}
                                  </span>
                                </div>
                              )}
                              {req.tradeLead?.detailDescription && (
                                <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[150px]">
                                  {req.tradeLead.detailDescription}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <Avatar
                                name={req.tradeLead?.postedBy?.fullName}
                                image={req.tradeLead?.postedBy?.image}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-foreground truncate max-w-[120px]">
                                  {req.tradeLead?.postedBy?.fullName || "—"}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                                  {req.tradeLead?.postedBy?.email || "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            {urgency ? (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap",
                                  urgency.bg,
                                  urgency.color
                                )}
                              >
                                <AlertTriangle className="h-3 w-3" />
                                {urgency.label}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">—</span>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap",
                                sc.bg,
                                sc.text
                              )}
                            >
                              <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", sc.dot)} />
                              {sc.label}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {formatDate(req.createdAt)}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            {isPending ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    openConfirm(
                                      "approve",
                                      req.id,
                                      req.requestedBy?.fullName || t("tradeLeads.tradeLead")
                                    )
                                  }
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800/40 whitespace-nowrap"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  {t("tradeLeads.approve")}
                                </button>
                                <button
                                  onClick={() =>
                                    openConfirm(
                                      "reject",
                                      req.id,
                                      req.requestedBy?.fullName || t("tradeLeads.tradeLead")
                                    )
                                  }
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40 whitespace-nowrap"
                                >
                                  <XCircle className="h-3 w-3" />
                                  {t("tradeLeads.reject")}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-medium italic">
                                {req.status === "APPROVED"
                                  ? t("tradeLeads.statusApproved")
                                  : t("tradeLeads.statusRejected")}
                              </span>
                            )}
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

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={closeConfirm}
        onConfirm={handleConfirmAction}
        title={
          confirmDialog.type === "approve"
            ? t("tradeLeads.approveTitle")
            : t("tradeLeads.rejectTitle")
        }
        description={
          confirmDialog.type === "approve"
            ? `${t("tradeLeads.approveDesc")} "${confirmDialog.label}"?`
            : `${t("tradeLeads.rejectDesc")} "${confirmDialog.label}"?`
        }
        confirmLabel={
          confirmDialog.type === "approve"
            ? t("tradeLeads.approve")
            : t("tradeLeads.reject")
        }
        isLoading={actionLoading}
        variant={confirmDialog.type === "approve" ? "success" : "danger"}
      />
    </div>
  );
}