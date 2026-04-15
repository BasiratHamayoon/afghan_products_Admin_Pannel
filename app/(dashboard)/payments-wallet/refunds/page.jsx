"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Clock, CheckCircle, XCircle, LayoutGrid } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import RefundForm from "@/components/payments/RefundForm";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ExportButton from "@/components/common/ExportButton";
import StatsCard from "@/components/common/StatCard";
import { fetchRefunds, approveRefund, rejectRefund } from "@/store/actions/paymentsActions";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const tabs = [
  { id: "all", label: "All Refunds", icon: LayoutGrid },
  { id: "pending", label: "Pending", icon: Clock },
  { id: "approved", label: "Approved", icon: CheckCircle },
  { id: "rejected", label: "Rejected", icon: XCircle },
];

export default function RefundsPage() {
  const dispatch = useDispatch();
  const { refunds, isLoading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => { dispatch(fetchRefunds()); }, [dispatch]);

  const safe = Array.isArray(refunds) ? refunds.filter(Boolean) : [];

  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return safe;
    return safe.filter((r) => r.status === activeTab);
  }, [safe, activeTab]);

  const tabCounts = useMemo(() => ({
    all: safe.length,
    pending: safe.filter((r) => r.status === "pending").length,
    approved: safe.filter((r) => r.status === "approved").length,
    rejected: safe.filter((r) => r.status === "rejected").length,
  }), [safe]);

  const { query, setQuery, results: searched } = useSearch(tabFiltered, ["userName", "userEmail", "refundId", "productName", "reason"]);
  const { filters, filteredData, updateFilter } = useFilter(searched, { priority: "all" });

  const sorted = useMemo(() => {
    const arr = [...filteredData];
    switch (sortBy) {
      case "oldest": return arr.sort((a, b) => new Date(a.requestedAt) - new Date(b.requestedAt));
      case "amountHigh": return arr.sort((a, b) => (b.refundAmount || 0) - (a.refundAmount || 0));
      default: return arr.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
    }
  }, [filteredData, sortBy]);

  const handleApprove = async (id, note) => {
    const res = await dispatch(approveRefund(id, note, user?.name || "Admin"));
    if (res?.success) toast.success("Refund approved successfully");
    else toast.error("Failed to approve refund");
  };

  const handleReject = async (id, note) => {
    const res = await dispatch(rejectRefund(id, note, user?.name || "Admin"));
    if (res?.success) toast.success("Refund rejected");
    else toast.error("Failed to reject refund");
  };

  const totalRefundAmount = safe.filter((r) => r.status === "approved").reduce((acc, r) => acc + (r.refundAmount || 0), 0);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Refund Requests" description="Review and process customer refund requests">
        <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Refunds" value={safe.length} icon={RefreshCw} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Pending" value={tabCounts.pending} icon={Clock} color="rgba(245,158,11,0.08)" index={1} />
        <StatsCard title="Approved" value={tabCounts.approved} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={2} />
        <StatsCard title="Rejected" value={tabCounts.rejected} icon={XCircle} color="rgba(239,68,68,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center overflow-x-auto scrollbar-thin">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setQuery(""); }}
                  className={cn("flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2",
                    activeTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]")}>
                  <Icon className="h-3.5 w-3.5 shrink-0" /> {tab.label}
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>{tabCounts[tab.id]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search customer, product, refund ID..." />
            </div>
            <FilterDropdown label="Priority" value={filters.priority || "all"} options={[{ value: "all", label: "All Priority" }, { value: "high", label: "High" }, { value: "medium", label: "Medium" }, { value: "low", label: "Low" }]} onChange={(v) => updateFilter("priority", v)} />
            <FilterDropdown label="Sort" value={sortBy} options={[{ value: "newest", label: "Newest First" }, { value: "oldest", label: "Oldest First" }, { value: "amountHigh", label: "Amount: High to Low" }]} onChange={setSortBy} />
          </div>
        </div>
        <div className="p-4">
          {isLoading ? <LoadingSpinner size="lg" text="Loading refund requests..." className="py-16" /> : sorted.length === 0 ? (
            <EmptyState icon={RefreshCw} title={`No ${activeTab === "all" ? "" : activeTab} refunds`} description="Refund requests submitted by customers will appear here" />
          ) : (
            <RefundForm refunds={sorted} onApprove={handleApprove} onReject={handleReject} />
          )}
        </div>
      </div>
    </div>
  );
}