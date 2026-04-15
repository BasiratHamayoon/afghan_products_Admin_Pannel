"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Wallet } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import WalletDetails from "@/components/payments/WalletDetails";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ExportButton from "@/components/common/ExportButton";
import StatsCard from "@/components/common/StatCard";
import { fetchWallets, freezeWallet } from "@/store/actions/paymentsActions";
import { dummyPaymentStats } from "@/data/dummyPayments";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import toast from "react-hot-toast";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "frozen", label: "Frozen" },
];

const roleOptions = [
  { value: "all", label: "All Roles" },
  { value: "seller", label: "Sellers" },
  { value: "buyer", label: "Buyers" },
];

export default function WalletsPage() {
  const dispatch = useDispatch();
  const { wallets, isLoading } = useSelector((state) => state.payments);
  const [sortBy, setSortBy] = useState("balanceHigh");

  useEffect(() => { dispatch(fetchWallets()); }, [dispatch]);

  const safe = Array.isArray(wallets) ? wallets.filter(Boolean) : [];
  const { query, setQuery, results: searched } = useSearch(safe, ["userName", "userEmail", "userRole"]);
  const { filters, filteredData, updateFilter } = useFilter(searched, { status: "all", userRole: "all" });

  const sorted = useMemo(() => {
    const arr = [...filteredData];
    switch (sortBy) {
      case "balanceLow": return arr.sort((a, b) => (a.balance || 0) - (b.balance || 0));
      case "name": return arr.sort((a, b) => a.userName.localeCompare(b.userName));
      default: return arr.sort((a, b) => (b.balance || 0) - (a.balance || 0));
    }
  }, [filteredData, sortBy]);

  const handleFreezeWallet = async (wallet) => {
    if (!wallet?.id) return;
    const res = await dispatch(freezeWallet(wallet.id));
    if (res?.success) toast.success(`Wallet ${res.frozen ? "frozen" : "unfrozen"} successfully`);
    else toast.error("Failed to update wallet");
  };

  const stats = dummyPaymentStats || {};

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Wallets" description={`${safe.length} user wallets`}>
        <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Wallets" value={stats.totalWallets || 0} icon={Wallet} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Active Wallets" value={stats.activeWallets || 0} icon={Wallet} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Frozen Wallets" value={stats.frozenWallets || 0} icon={Wallet} color="rgba(239,68,68,0.08)" index={2} />
        <StatsCard title="Total Balance" value={`AFN ${(stats.totalWalletBalance || 0).toLocaleString()}`} icon={Wallet} color="rgba(245,158,11,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder="Search user name, email..." />
            </div>
            <FilterDropdown label="Status" value={filters.status || "all"} options={statusOptions} onChange={(v) => updateFilter("status", v)} />
            <FilterDropdown label="Role" value={filters.userRole || "all"} options={roleOptions} onChange={(v) => updateFilter("userRole", v)} />
            <FilterDropdown label="Sort" value={sortBy} options={[{ value: "balanceHigh", label: "Balance: High to Low" }, { value: "balanceLow", label: "Balance: Low to High" }, { value: "name", label: "Name A-Z" }]} onChange={setSortBy} />
          </div>
        </div>
        <div className="p-4">
          {isLoading ? <LoadingSpinner size="lg" text="Loading wallets..." className="py-16" /> : sorted.length === 0 ? (
            <EmptyState icon={Wallet} title="No wallets found" description="No wallets match your search" />
          ) : (
            <WalletDetails wallets={sorted} onFreezeWallet={handleFreezeWallet} />
          )}
        </div>
      </div>
    </div>
  );
}