"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, Users, List, Grid3X3 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import UserTable from "@/components/users/UserTable";
import UserCard from "@/components/users/UserCard";
import UserFilters from "@/components/users/UserFilters";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import {
  fetchUsers, removeUser, suspendUser,
  verifyUser, banUser,
} from "@/store/actions/usersActions";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function UsersSubPage({ role, title, description }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { users, isLoading } = useSelector((state) => state.users);
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
  const roleFiltered = useMemo(() => safeUsers.filter((u) => u.role === role), [safeUsers, role]);

  const { query, setQuery, results: searched } = useSearch(roleFiltered, ["name", "email", "phone", "business.name"]);

  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all", verified: "all", level: "all",
  });

  const sorted = useMemo(() => {
    const arr = [...filteredData];
    switch (sortBy) {
      case "oldest": return arr.sort((a, b) => new Date(a.joinedAt) - new Date(b.joinedAt));
      case "name": return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "revenue": return arr.sort((a, b) => (b.stats?.totalRevenue || 0) - (a.stats?.totalRevenue || 0));
      case "orders": return arr.sort((a, b) => (b.stats?.totalOrders || 0) - (a.stats?.totalOrders || 0));
      case "rating": return arr.sort((a, b) => (b.stats?.rating || 0) - (a.stats?.rating || 0));
      default: return arr.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));
    }
  }, [filteredData, sortBy]);

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.verified !== "all" ||
    filters.level !== "all" ||
    query.trim() !== "";

  const itemsPerPage = viewMode === "grid" ? 12 : 10;
  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(sorted, itemsPerPage);

  const handleDelete = async () => {
    const id = deleteDialog?.user?.id;
    if (!id) { setDeleteDialog({ open: false, user: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeUser(id));
      if (res?.success) toast.success("User deleted");
      else toast.error("Failed to delete");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, user: null }); }
  };

  const handleSuspend = async (user) => {
    if (!user?.id) return;
    const res = await dispatch(suspendUser(user.id));
    if (res?.success) toast.success(`User ${res.status === "suspended" ? "suspended" : "activated"}`);
    else toast.error("Failed");
  };

  const handleVerify = async (user) => {
    if (!user?.id) return;
    const res = await dispatch(verifyUser(user.id));
    if (res?.success) toast.success(`${user.name} verified`);
    else toast.error("Failed to verify");
  };

  const handleBan = async (user) => {
    if (!user?.id) return;
    const res = await dispatch(banUser(user.id));
    if (res?.success) toast.success(`User ${res.banned ? "banned" : "unbanned"}`);
    else toast.error("Failed");
  };

  const handleView = (u) => { if (u?.id) router.push(`/users-sellers/${u.id}`); };
  const handleEdit = (u) => { if (u?.id) router.push(`/users-sellers/${u.id}?tab=edit`);};
  const handleDeleteOpen = (u) => { if (u?.id) setDeleteDialog({ open: true, user: u }); };

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader title={title} description={`${roleFiltered.length} ${description}`}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/users-sellers/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add User
          </motion.button>
        </div>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-0">
              <UserFilters
                query={query}
                onQueryChange={(v) => { setQuery(v); goToPage(1); }}
                filters={filters}
                onFilterChange={(k, v) => { updateFilter(k, v); goToPage(1); }}
                onResetFilters={() => { resetFilters(); setQuery(""); goToPage(1); }}
                hasActiveFilters={hasActiveFilters}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters(!showFilters)}
                sortBy={sortBy}
                onSortChange={(v) => { setSortBy(v); goToPage(1); }}
                resultCount={sorted.length}
                hideRole
              />
            </div>
            <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden shrink-0">
              <button onClick={() => setViewMode("table")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("grid")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading..." className="py-16" />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={Users}
              title={`No ${role}s found`}
              description={hasActiveFilters ? "Try adjusting your filters" : `No ${role}s have been added yet`}
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {hasActiveFilters && (
                    <button onClick={() => { resetFilters(); setQuery(""); goToPage(1); }} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
                      Clear Filters
                    </button>
                  )}
                  <button onClick={() => router.push("/users-sellers")} className="px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                    View All Users
                  </button>
                </div>
              }
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedData.map((user, i) => (
                  <UserCard key={user.id} user={user} index={i} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteOpen} onSuspend={handleSuspend} onVerify={handleVerify} />
                ))}
              </div>
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <UserTable users={paginatedData} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteOpen} onSuspend={handleSuspend} onVerify={handleVerify} onBan={handleBan} />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, user: null })}
        onConfirm={handleDelete}
        title="Delete User"
        description={deleteDialog.user ? `Delete "${deleteDialog.user.name}"? This cannot be undone.` : "Are you sure?"}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}