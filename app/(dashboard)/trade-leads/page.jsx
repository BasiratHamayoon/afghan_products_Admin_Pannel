"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { TrendingUp, X, AlertTriangle, Clock, Package, RefreshCw } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import TradeLeadTable from "@/components/trade-leads/TradeLeadTable";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchTradeLeads, removeTradeLead, updateTradeLeadStatus } from "@/store/actions/tradeLeadsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function TradeLeadsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { tradeLeads, isLoading, pagination } = useSelector((state) => state.tradeLeads);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, lead: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusDialog, setStatusDialog] = useState({ open: false, lead: null, status: null });
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetched = useRef(false);

  const TABS = [
    { id: "all", label: t("tradeLeads.allLeads") },
    { id: "PENDING", label: t("tradeLeads.pending") },
    { id: "APPROVED", label: t("tradeLeads.approved") },
    { id: "REJECTED", label: t("tradeLeads.rejected") },
    { id: "EXPIRED", label: t("tradeLeads.expired") },
  ];

  const URGENCY_OPTIONS = [
    { value: "all", label: t("tradeLeads.allUrgency") },
    { value: "LOW", label: t("tradeLeads.urgencyLow") },
    { value: "MEDIUM", label: t("tradeLeads.urgencyMedium") },
    { value: "HIGH", label: t("tradeLeads.urgencyHigh") },
  ];

  const buildParams = useCallback((page, search, tab, urgency) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search && search.trim()) params.search = search.trim();
    if (tab !== "all") params.status = tab;
    if (urgency !== "all") params.urgency = urgency;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchTradeLeads(buildParams(1, "", "all", "all")));
  }, [dispatch, buildParams]);

  const triggerFetch = useCallback((page, search, tab, urgency) => {
    dispatch(fetchTradeLeads(buildParams(page, search, tab, urgency)));
  }, [dispatch, buildParams]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", tab, urgencyFilter);
  }, [urgencyFilter, triggerFetch]);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab, urgencyFilter);
    }, DEBOUNCE_DELAY);
  }, [activeTab, urgencyFilter, triggerFetch]);

  const handleUrgencyChange = useCallback((val) => {
    setUrgencyFilter(val);
    setCurrentPage(1);
    triggerFetch(1, searchQuery, activeTab, val);
  }, [searchQuery, activeTab, triggerFetch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab, urgencyFilter);
  }, [searchQuery, activeTab, urgencyFilter, triggerFetch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", activeTab, urgencyFilter);
  }, [activeTab, urgencyFilter, triggerFetch]);

  const handleRefresh = useCallback(() => {
    triggerFetch(currentPage, searchQuery, activeTab, urgencyFilter);
  }, [currentPage, searchQuery, activeTab, urgencyFilter, triggerFetch]);

  const handleStatusRequest = useCallback((lead, newStatus) => {
    setStatusDialog({ open: true, lead, status: newStatus });
  }, []);

  const handleStatusConfirm = async () => {
    const { lead, status } = statusDialog;
    if (!lead?.id || !status) { setStatusDialog({ open: false, lead: null, status: null }); return; }
    setIsUpdatingStatus(true);
    const res = await dispatch(updateTradeLeadStatus(lead.id, status));
    setIsUpdatingStatus(false);
    if (res?.success) {
      toast.success(`${t("tradeLeads.statusUpdatedTo")} ${status}`);
    } else {
      toast.error(res?.message || t("tradeLeads.failedToUpdateStatus"));
    }
    setStatusDialog({ open: false, lead: null, status: null });
  };

  const handleDeleteConfirm = async () => {
    const { lead } = deleteDialog;
    if (!lead?.id) { setDeleteDialog({ open: false, lead: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeTradeLead(lead.id));
      if (res?.success) {
        toast.success(t("tradeLeads.tradeLeadDeleted"));
      } else {
        toast.error(res?.message || t("tradeLeads.failedToDelete"));
      }
    } catch {
      toast.error(t("tradeLeads.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, lead: null });
    }
  };

  const safeLeads = Array.isArray(tradeLeads) ? tradeLeads.filter(Boolean) : [];
  const total = pagination?.total || safeLeads.length;
  const totalPages = pagination?.totalPages || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: safeLeads.length,
    PENDING: safeLeads.filter((l) => l.status === "PENDING").length,
    APPROVED: safeLeads.filter((l) => l.status === "APPROVED").length,
    REJECTED: safeLeads.filter((l) => l.status === "REJECTED").length,
    EXPIRED: safeLeads.filter((l) => l.status === "EXPIRED").length,
  };

  const urgencyCounts = {
    LOW: safeLeads.filter((l) => l.urgency === "LOW").length,
    MEDIUM: safeLeads.filter((l) => l.urgency === "MEDIUM").length,
    HIGH: safeLeads.filter((l) => l.urgency === "HIGH").length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("tradeLeads.title")} description={t("tradeLeads.description")} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("tradeLeads.totalLeads")} value={total} icon={TrendingUp} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("tradeLeads.highUrgency")} value={urgencyCounts.HIGH} icon={AlertTriangle} color="rgba(239,68,68,0.08)" index={1} />
        <StatsCard title={t("tradeLeads.mediumUrgency")} value={urgencyCounts.MEDIUM} icon={Clock} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title={t("tradeLeads.lowUrgency")} value={urgencyCounts.LOW} icon={Package} color="rgba(16,185,129,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn("flex items-center gap-2 px-5 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2", activeTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]")}
            >
              {tab.label}
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                {tabCounts[tab.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder={t("tradeLeads.searchPlaceholder")} />
            </div>
            <FilterDropdown label={t("tradeLeads.urgency")} value={urgencyFilter} options={URGENCY_OPTIONS} onChange={handleUrgencyChange} />
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />{t("tradeLeads.clear")}
              </button>
            )}
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title={t("tradeLeads.refresh")}>
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <p className="text-[11px] text-muted-foreground font-medium">
              {safeLeads.length} {safeLeads.length !== 1 ? t("tradeLeads.resultsPlural") : t("tradeLeads.results")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("tradeLeads.loadingTradeLeads")} className="py-16" />
          ) : safeLeads.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title={t("tradeLeads.noTradeLeadsFound")}
              description={searchQuery ? t("tradeLeads.tryAdjustingSearch") : t("tradeLeads.noTradeLeadsYet")}
              action={searchQuery ? (
                <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  {t("tradeLeads.clearSearch")}
                </button>
              ) : null}
            />
          ) : (
            <>
              <TradeLeadTable
                leads={safeLeads}
                onView={(l) => router.push(`/trade-leads/${l.id}`)}
                onDelete={(l) => setDeleteDialog({ open: true, lead: l })}
                onUpdateStatus={handleStatusRequest}
              />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, lead: null })}
        onConfirm={handleDeleteConfirm}
        title={t("tradeLeads.deleteTradeLead")}
        description={t("tradeLeads.deleteTradeLeadDesc")}
        confirmLabel={t("tradeLeads.delete")}
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmDialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, lead: null, status: null })}
        onConfirm={handleStatusConfirm}
        title={
          statusDialog.status === "APPROVED" ? t("tradeLeads.approveTitle")
            : statusDialog.status === "REJECTED" ? t("tradeLeads.rejectTitle")
            : t("tradeLeads.updateTitle")
        }
        description={
          statusDialog.status === "APPROVED" ? t("tradeLeads.approveDesc")
            : statusDialog.status === "REJECTED" ? t("tradeLeads.rejectDesc")
            : `${t("tradeLeads.updateDesc")} ${statusDialog.status}?`
        }
        confirmLabel={
          statusDialog.status === "APPROVED" ? t("tradeLeads.approve")
            : statusDialog.status === "REJECTED" ? t("tradeLeads.reject")
            : t("tradeLeads.approve")
        }
        isLoading={isUpdatingStatus}
        variant={
          statusDialog.status === "APPROVED" ? "primary"
            : statusDialog.status === "REJECTED" ? "danger"
            : "warning"
        }
      />
    </div>
  );
}