"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, X, Clock, CheckCircle, RefreshCw, DollarSign,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import OrdersTable from "@/components/orders/OrdersTable";
import SearchInput from "@/components/common/SearchInput";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { fetchOrders, deleteOrder } from "@/store/actions/ordersActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Orders" },
  { id: "PENDING", label: "Pending" },
  { id: "CONFIRMED", label: "Confirmed" },
  { id: "SHIPPED", label: "Shipped" },
  { id: "DELIVERED", label: "Delivered" },
  { id: "CANCELLED", label: "Cancelled" },
];

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function OrdersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { orders, isLoading, pagination } = useSelector((state) => state.orders);

  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, order: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetched = useRef(false);

  const buildParams = useCallback((page, search, tab) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search && search.trim()) params.search = search.trim();
    if (tab !== "all") params.status = tab;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    dispatch(fetchOrders(buildParams(1, "", "all")));
  }, [dispatch, buildParams]);

  const triggerFetch = useCallback((page, search, tab) => {
    dispatch(fetchOrders(buildParams(page, search, tab)));
  }, [dispatch, buildParams]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", tab);
  }, [triggerFetch]);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab);
    }, DEBOUNCE_DELAY);
  }, [activeTab, triggerFetch]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab);
  }, [searchQuery, activeTab, triggerFetch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setCurrentPage(1);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    triggerFetch(1, "", activeTab);
  }, [activeTab, triggerFetch]);

  const handleRefresh = useCallback(() => {
    triggerFetch(currentPage, searchQuery, activeTab);
  }, [currentPage, searchQuery, activeTab, triggerFetch]);

  const handleDeleteConfirm = async () => {
    const { order } = deleteDialog;
    if (!order?.id) {
      setDeleteDialog({ open: false, order: null });
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteOrder(order.id));
      if (res?.success) {
        toast.success("Order deleted successfully");
      } else {
        toast.error(res?.message || "Failed to delete order");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, order: null });
    }
  };

  const safeOrders = Array.isArray(orders) ? orders.filter(Boolean) : [];
  const total = pagination?.total || safeOrders.length;
  const totalPages = pagination?.totalPages || 1;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const tabCounts = {
    all: safeOrders.length,
    PENDING: safeOrders.filter((o) => o.status === "PENDING").length,
    CONFIRMED: safeOrders.filter((o) => o.status === "CONFIRMED").length,
    SHIPPED: safeOrders.filter((o) => o.status === "SHIPPED").length,
    DELIVERED: safeOrders.filter((o) => o.status === "DELIVERED").length,
    CANCELLED: safeOrders.filter((o) => o.status === "CANCELLED").length,
  };

  const totalRevenue = safeOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Orders" description="Manage all orders across the marketplace" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Orders" value={total} icon={ShoppingCart} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Pending" value={tabCounts.PENDING} icon={Clock} color="rgba(245,158,11,0.08)" index={1} />
        <StatsCard title="Delivered" value={tabCounts.DELIVERED} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={2} />
        <StatsCard title="Revenue (AFN)" value={Number(totalRevenue).toLocaleString()} icon={DollarSign} color="rgba(99,102,241,0.08)" index={3} />
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
                placeholder="Search by order #, buyer..."
              />
            </div>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
              >
                <X className="h-3.5 w-3.5" />Clear
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
              {safeOrders.length} result{safeOrders.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading orders..." className="py-16" />
          ) : safeOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders found"
              description={searchQuery ? "Try adjusting your search" : "No orders yet"}
              action={
                searchQuery ? (
                  <button
                    onClick={handleClearSearch}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                ) : null
              }
            />
          ) : (
            <>
              <OrdersTable
                orders={safeOrders}
                onView={(o) => router.push(`/orders/${o.id}`)}
                onDelete={(o) => setDeleteDialog({ open: true, order: o })}
              />
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
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, order: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        description="Are you sure you want to delete this order? Only pending orders can be deleted."
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}