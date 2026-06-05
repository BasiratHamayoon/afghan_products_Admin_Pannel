"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Users, ShoppingBag, Package,
  Shield, List, Grid3X3, LayoutGrid, X, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import UserTable from "@/components/users/UserTable";
import UserCard from "@/components/users/UserCard";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import FilterDropdown from "@/components/common/FilterDropdown";
import { fetchUsers, fetchUserStats, deleteUser, updateUserStatus } from "@/store/actions/usersActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All Users", icon: LayoutGrid },
  { id: "SELLER", label: "Sellers", icon: ShoppingBag },
  { id: "BUYER", label: "Buyers", icon: Package },
  { id: "ADMIN", label: "Admins", icon: Shield },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "BLOCKED", label: "Blocked" },
];

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function UsersSellersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { users, isLoading, pagination, stats } = useSelector((state) => state.users);

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, user: null, newStatus: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const buildParams = useCallback((page, search, tab, status) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab !== "all") params.role = tab;
    if (status !== "all") params.status = status;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    if (!users || users.length === 0) {
      dispatch(fetchUsers(buildParams(1, "", "all", "all")));
    }
    dispatch(fetchUserStats());
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback((page, search, tab, status) => {
    dispatch(fetchUsers(buildParams(page, search, tab, status)));
  }, [dispatch, buildParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    triggerFetch(1, "", tab, statusFilter);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab, statusFilter);
    }, DEBOUNCE_DELAY);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
    triggerFetch(1, searchQuery, activeTab, val);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab, statusFilter);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    triggerFetch(1, "", activeTab, statusFilter);
  };

  const handleRefresh = () => {
    triggerFetch(currentPage, searchQuery, activeTab, statusFilter);
  };

  const handleDeleteConfirm = async () => {
    const { user } = deleteDialog;
    if (!user?.id) {
      setDeleteDialog({ open: false, user: null });
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteUser(user.id));
      if (res?.success) {
        toast.success("User deleted");
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, user: null });
    }
  };

  const handleStatusConfirm = async () => {
    const { user, newStatus } = statusDialog;
    if (!user?.id || !newStatus) {
      setStatusDialog({ open: false, user: null, newStatus: null });
      return;
    }
    setIsUpdating(true);
    try {
      const res = await dispatch(updateUserStatus(user.id, newStatus));
      if (res?.success) {
        toast.success(newStatus === "BLOCKED" ? "User blocked" : "User activated");
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
      setStatusDialog({ open: false, user: null, newStatus: null });
    }
  };

  const handleSuspend = (user) => {
    const currentStatus = (user.status || "ACTIVE").toUpperCase();
    const newStatus = currentStatus === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    setStatusDialog({ open: true, user, newStatus });
  };

  const handleView = (u) => {
    if (u?.id) router.push(`/users-sellers/${u.id}`);
  };

  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || safeUsers.length;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const totalFromStats = stats?.totalUsers ?? total;
  const totalSellers = stats?.totalSellers ?? 0;
  const totalBuyers = stats?.totalBuyers ?? 0;
  const totalAdmins = stats?.totalAdmins ?? 0;

  const tabCounts = {
    all: total,
    SELLER: totalSellers,
    BUYER: totalBuyers,
    ADMIN: totalAdmins,
  };

  const commonProps = {
    onView: handleView,
    onDelete: (u) => setDeleteDialog({ open: true, user: u }),
    onSuspend: handleSuspend,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Users & Sellers" description="Manage all users on the platform" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Users" value={totalFromStats} icon={Users} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Sellers" value={totalSellers} icon={ShoppingBag} color="rgba(124,58,237,0.08)" index={1} />
        <StatsCard title="Buyers" value={totalBuyers} icon={Package} color="rgba(16,185,129,0.08)" index={2} />
        <StatsCard title="Admins" value={totalAdmins} icon={Shield} color="rgba(245,158,11,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-thin border-b border-gray-100 dark:border-white/[0.06]">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
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
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
                <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                  {tabCounts[tab.id] ?? 0}
                </span>
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-1 px-3 shrink-0 border-l border-gray-100 dark:border-white/[0.06]">
            <button onClick={() => setViewMode("table")} className={cn("h-9 w-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer", viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
              <List className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode("grid")} className={cn("h-9 w-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer", viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder="Search by name or email..." />
            </div>
            <FilterDropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={handleStatusFilterChange} />
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />Clear
              </button>
            )}
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <p className="text-[11px] text-muted-foreground font-medium">{total} result{total !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading users..." className="py-16" />
          ) : safeUsers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description={searchQuery ? "Try adjusting your search" : "No users yet"}
              action={searchQuery ? (
                <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  Clear Search
                </button>
              ) : null}
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {safeUsers.map((user, i) => (
                  <UserCard key={user.id} user={user} index={i} {...commonProps} />
                ))}
              </div>
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <UserTable users={safeUsers} {...commonProps} />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        description={deleteDialog.user ? `Are you sure you want to delete "${deleteDialog.user.name}"? This cannot be undone.` : "Are you sure?"}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmDialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, user: null, newStatus: null })}
        onConfirm={handleStatusConfirm}
        title={statusDialog.newStatus === "BLOCKED" ? "Block User" : "Activate User"}
        description={statusDialog.user ? `Are you sure you want to ${statusDialog.newStatus === "BLOCKED" ? "block" : "activate"} "${statusDialog.user.name}"?` : "Are you sure?"}
        confirmLabel={statusDialog.newStatus === "BLOCKED" ? "Block" : "Activate"}
        isLoading={isUpdating}
        variant={statusDialog.newStatus === "BLOCKED" ? "warning" : "primary"}
      />
    </div>
  );
}