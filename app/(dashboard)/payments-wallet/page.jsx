"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  DollarSign, Wallet, ArrowUpRight, RefreshCw,
  CreditCard, LayoutGrid, SlidersHorizontal, X,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import PaymentStats from "@/components/payments/PaymentStats";
import TransactionTable from "@/components/payments/TransactionTable";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ExportButton from "@/components/common/ExportButton";
import { fetchTransactions } from "@/store/actions/paymentsActions";
import { dummyPaymentStats } from "@/data/dummyPayments";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const mainTabs = [
  { id: "all", label: "All Transactions", icon: LayoutGrid },
  { id: "payment", label: "Payments", icon: CreditCard },
  { id: "withdrawal", label: "Withdrawals", icon: ArrowUpRight },
  { id: "refund", label: "Refunds", icon: RefreshCw },
  { id: "deposit", label: "Deposits", icon: DollarSign },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "processing", label: "Processing" },
];

const methodOptions = [
  { value: "all", label: "All Methods" },
  { value: "wallet", label: "Wallet" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "mobile_money", label: "Mobile Money" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amountHigh", label: "Amount: High to Low" },
  { value: "amountLow", label: "Amount: Low to High" },
];

export default function PaymentsWalletPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { transactions, isLoading } = useSelector((state) => state.payments);
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => { dispatch(fetchTransactions()); }, [dispatch]);

  const safe = Array.isArray(transactions) ? transactions.filter(Boolean) : [];

  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return safe;
    return safe.filter((t) => t.type === activeTab);
  }, [safe, activeTab]);

  const tabCounts = useMemo(() => ({
    all: safe.length,
    payment: safe.filter((t) => t.type === "payment").length,
    withdrawal: safe.filter((t) => t.type === "withdrawal").length,
    refund: safe.filter((t) => t.type === "refund").length,
    deposit: safe.filter((t) => t.type === "deposit").length,
  }), [safe]);

  const { query, setQuery, results: searched } = useSearch(tabFiltered, [
    "transactionId", "description", "from.name", "to.name", "orderId",
  ]);

  const { filters, filteredData: filtered, updateFilter, resetFilters } = useFilter(searched, {
    status: "all", paymentMethod: "all",
  });

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "oldest": return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "amountHigh": return arr.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      case "amountLow": return arr.sort((a, b) => (a.amount || 0) - (b.amount || 0));
      default: return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [filtered, sortBy]);

  const hasActiveFilters = filters.status !== "all" || filters.paymentMethod !== "all" || query.trim() !== "";
  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(sorted, 10);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Payments & Wallet" description="Monitor all transactions, wallets, withdrawals and refunds">
        <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
      </PageHeader>

      <PaymentStats stats={dummyPaymentStats} />

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center overflow-x-auto scrollbar-thin">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setQuery(""); resetFilters(); goToPage(1); }}
                  className={cn("flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2",
                    activeTab === tab.id ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]")}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {tab.label}
                  <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>{tabCounts[tab.id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={(v) => { setQuery(v); goToPage(1); }} placeholder="Search transaction ID, name, order..." />
            </div>
            <FilterDropdown label="Sort" value={sortBy} options={sortOptions} onChange={(v) => { setSortBy(v); goToPage(1); }} />
            <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap", showFilters || hasActiveFilters ? "border-[#0F69B0] bg-[#0F69B0]/8 text-[#0F69B0]" : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/30 hover:text-[#0F69B0]")}>
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
              {hasActiveFilters && <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap pt-3">
                  <FilterDropdown label="Status" value={filters.status || "all"} options={statusOptions} onChange={(v) => { updateFilter("status", v); goToPage(1); }} />
                  <FilterDropdown label="Method" value={filters.paymentMethod || "all"} options={methodOptions} onChange={(v) => { updateFilter("paymentMethod", v); goToPage(1); }} />
                  {hasActiveFilters && (
                    <button onClick={() => { resetFilters(); setQuery(""); goToPage(1); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer border border-red-200 dark:border-red-800/40 transition-colors">
                      <X className="h-3.5 w-3.5" /> Clear All
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground font-medium ml-auto">{sorted.length} results</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading transactions..." className="py-16" />
          ) : sorted.length === 0 ? (
            <EmptyState icon={DollarSign} title="No transactions found" description={hasActiveFilters ? "Try adjusting your filters" : "Transactions will appear here"} action={hasActiveFilters ? <button onClick={() => { resetFilters(); setQuery(""); goToPage(1); }} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground cursor-pointer">Clear Filters</button> : null} />
          ) : (
            <>
              <TransactionTable transactions={paginatedData} />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}