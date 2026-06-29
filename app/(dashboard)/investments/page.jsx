"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Briefcase, X, RefreshCw, CheckCircle, Clock,
  XCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import InvestmentsTable from "@/components/investments/InvestmentsTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchInvestments,
  toggleInvestmentApproval,
  deleteInvestment,
} from "@/store/actions/investmentsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
];

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 20;

export default function InvestmentsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { investments, isLoading, pagination } = useSelector(
    (state) => state.investments
  );

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    item: null,
  });
  const [approvalDialog, setApprovalDialog] = useState({
    open: false,
    item: null,
    action: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab === "pending") params.status = "pending";
    else if (tab === "approved") params.status = "active";
    else if (tab === "rejected") params.status = "rejected";
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    dispatch(fetchInvestments(buildParams(1, "", "all")));
  }, [dispatch, buildParams]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current)
        clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback(
    (page, search, tab) => {
      dispatch(fetchInvestments(buildParams(page, search, tab)));
    },
    [dispatch, buildParams]
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current)
      clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", tab);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current)
      clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab);
    }, DEBOUNCE_DELAY);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current)
      clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", activeTab);
  };

  const handleRefresh = () =>
    triggerFetch(currentPage, searchQuery, activeTab);

  const handleApprovalConfirm = async () => {
    const { item, action } = approvalDialog;
    if (!item?.id || !action) {
      setApprovalDialog({ open: false, item: null, action: null });
      return;
    }
    setIsApproving(true);
    try {
      const res = await dispatch(
        toggleInvestmentApproval(item.id, action)
      );
      if (res?.success) {
        toast.success(
          action === "APPROVED"
            ? "Investment approved"
            : "Investment rejected"
        );
        triggerFetch(currentPage, searchQuery, activeTab);
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsApproving(false);
      setApprovalDialog({ open: false, item: null, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) {
      setDeleteDialog({ open: false, item: null });
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteInvestment(item.id));
      if (res?.success) toast.success("Investment deleted");
      else toast.error(res?.message || "Failed");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const safeItems = Array.isArray(investments) ? investments : [];
  const total = pagination?.total || safeItems.length;
  const totalPages = pagination?.totalPages || 1;
  const from =
    total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: safeItems.length,
    pending: safeItems.filter(
      (i) => i.approvalStatus === "PENDING"
    ).length,
    approved: safeItems.filter(
      (i) => i.approvalStatus === "APPROVED"
    ).length,
    rejected: safeItems.filter(
      (i) => i.approvalStatus === "REJECTED"
    ).length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader
        title="Investments"
        description="Review and manage investment listings"
      >
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
          title="Refresh"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title="Total"
          value={total}
          icon={Briefcase}
          color="rgba(15,105,176,0.08)"
          index={0}
        />
        <StatsCard
          title="Pending"
          value={tabCounts.pending}
          icon={Clock}
          color="rgba(245,158,11,0.08)"
          index={1}
        />
        <StatsCard
          title="Approved"
          value={tabCounts.approved}
          icon={CheckCircle}
          color="rgba(16,185,129,0.08)"
          index={2}
        />
        <StatsCard
          title="Rejected"
          value={tabCounts.rejected}
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
            <div className="flex-1 min-w-[180px]">
              <SearchInput
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search investments..."
              />
            </div>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
              >
                <X className="h-3.5 w-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <p className="text-[11px] text-muted-foreground font-medium">
              {safeItems.length} result
              {safeItems.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner
              size="lg"
              text="Loading investments..."
              className="py-16"
            />
          ) : safeItems.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="No investments found"
              description={
                searchQuery
                  ? "Try adjusting your search"
                  : "No investment listings yet"
              }
              action={
                searchQuery ? (
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <InvestmentsTable
                items={safeItems}
                onView={(it) =>
                  router.push(`/investments/${it.id}`)
                }
                onApprove={(it) =>
                  setApprovalDialog({
                    open: true,
                    item: it,
                    action: "APPROVED",
                  })
                }
                onReject={(it) =>
                  setApprovalDialog({
                    open: true,
                    item: it,
                    action: "REJECTED",
                  })
                }
                onDelete={(it) =>
                  setDeleteDialog({ open: true, item: it })
                }
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
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
        open={approvalDialog.open}
        onClose={() =>
          setApprovalDialog({
            open: false,
            item: null,
            action: null,
          })
        }
        onConfirm={handleApprovalConfirm}
        title={
          approvalDialog.action === "APPROVED"
            ? "Approve Investment"
            : "Reject Investment"
        }
        description={
          approvalDialog.item
            ? `Are you sure you want to ${
                approvalDialog.action === "APPROVED"
                  ? "approve"
                  : "reject"
              } "${approvalDialog.item.title}"?`
            : "Are you sure?"
        }
        confirmLabel={
          approvalDialog.action === "APPROVED"
            ? "Approve"
            : "Reject"
        }
        isLoading={isApproving}
        variant={
          approvalDialog.action === "APPROVED"
            ? "primary"
            : "danger"
        }
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() =>
          setDeleteDialog({ open: false, item: null })
        }
        onConfirm={handleDeleteConfirm}
        title="Delete Investment"
        description={
          deleteDialog.item
            ? `Delete "${deleteDialog.item.title}"? This cannot be undone.`
            : "Are you sure?"
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}