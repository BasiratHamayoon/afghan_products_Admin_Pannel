"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, Users, Calendar, DollarSign,
  SlidersHorizontal, X, List, Grid3X3,
  MessageSquare, Clock, CheckCircle,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ConsultantTable from "@/components/consulting/ConsultantTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import StatusBadge from "@/components/common/StatusBadge";
import { fetchConsultants, fetchSessions, fetchRequests, removeConsultant, editConsultant } from "@/store/actions/consultingActions";
import { dummyConsultingStats, consultingCategoryOptions, availabilityOptions } from "@/data/dummyConsulting";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { formatDate } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Edit2, Eye, Trash2, Star as StarIcon, StarOff } from "lucide-react";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const availabilityFilterOptions = [
  { value: "all", label: "All Availability" },
  ...availabilityOptions.map((a) => ({ value: a.value, label: a.label })),
];

const featuredFilterOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "Featured Only" },
  { value: "false", label: "Not Featured" },
];

const mainTabs = [
  { id: "consultants", label: "Consultants" },
  { id: "sessions", label: "Sessions" },
  { id: "requests", label: "Requests" },
];

export default function ConsultingPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { consultants, sessions, requests, isLoading } = useSelector((state) => state.consulting);
  const [activeTab, setActiveTab] = useState("consultants");
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchConsultants());
    dispatch(fetchSessions());
    dispatch(fetchRequests());
  }, [dispatch]);

  const allConsultants = Array.isArray(consultants) ? consultants.filter(Boolean) : [];
  const allSessions = Array.isArray(sessions) ? sessions.filter(Boolean) : [];
  const allRequests = Array.isArray(requests) ? requests.filter(Boolean) : [];

  const activeData =
    activeTab === "consultants" ? allConsultants
    : activeTab === "sessions" ? allSessions
    : allRequests;

  const searchFields =
    activeTab === "consultants" ? ["name", "title", "location", "email"]
    : activeTab === "sessions" ? ["title", "consultantName", "clientName", "category"]
    : ["title", "description", "category"];

  const { query, setQuery, results: searched } = useSearch(activeData, searchFields);

  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all",
    availability: "all",
    featured: "all",
  });

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.availability !== "all" ||
    filters.featured !== "all" ||
    query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    const itemId = deleteDialog?.item?.id;
    if (!itemId) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeConsultant(itemId));
      if (res?.success) toast.success("Consultant deleted successfully");
      else toast.error("Failed to delete consultant");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, item: null }); }
  };

  const handleToggleFeatured = async (con) => {
    if (!con?.id) return;
    await dispatch(editConsultant(con.id, { ...con, featured: !con.featured }));
    toast.success(`${!con.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  const handleToggleStatus = async (con) => {
    if (!con?.id) return;
    const newStatus = con.status === "active" ? "inactive" : "active";
    await dispatch(editConsultant(con.id, { ...con, status: newStatus }));
    toast.success(`Status changed to ${newStatus}`);
  };

  const stats = dummyConsultingStats || {};

  const tabCounts = {
    consultants: allConsultants.length,
    sessions: allSessions.length,
    requests: allRequests.length,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Consulting" description="Manage consultants, sessions, and client requests">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/consulting/consultants/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Consultant
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Consultants" value={stats.totalConsultants || 0} icon={Users} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Active Sessions" value={stats.inProgressSessions || 0} icon={Calendar} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Pending Requests" value={stats.pendingRequests || 0} icon={Clock} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title="Total Revenue" value={`$${((stats.totalRevenue || 0) / 1000).toFixed(0)}K`} icon={DollarSign} color="rgba(124,58,237,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setQuery(""); resetFilters(); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2 relative",
                  activeTab === tab.id
                    ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                )}
              >
                <span>{tab.label}</span>
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                  activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground"
                )}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={query} onChange={setQuery} placeholder={`Search ${activeTab}...`} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                showFilters || hasActiveFilters
                  ? "border-[#0F69B0] bg-[#0F69B0]/8 text-[#0F69B0]"
                  : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/30 hover:text-[#0F69B0]"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {hasActiveFilters && (
                <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>
              )}
            </button>
            {activeTab === "consultants" && (
              <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
                    viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
                    viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                  )}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <FilterDropdown label="Status" value={filters.status || "all"} options={statusFilterOptions} onChange={(v) => updateFilter("status", v)} />
                  {activeTab === "consultants" && (
                    <FilterDropdown label="Availability" value={filters.availability || "all"} options={availabilityFilterOptions} onChange={(v) => updateFilter("availability", v)} />
                  )}
                  <FilterDropdown label="Featured" value={String(filters.featured || "all")} options={featuredFilterOptions} onChange={(v) => updateFilter("featured", v)} />
                  {hasActiveFilters && (
                    <button
                      onClick={() => { resetFilters(); setQuery(""); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear All
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground font-medium ml-auto">
                    {filteredData.length} result{filteredData.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Users}
              title={`No ${activeTab} found`}
              description={hasActiveFilters ? "Try adjusting your search or filters" : `Add your first ${activeTab.slice(0, -1)} to get started`}
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {hasActiveFilters && (
                    <button
                      onClick={() => { resetFilters(); setQuery(""); }}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/consulting/consultants/add")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Consultant
                  </button>
                </div>
              }
            />
          ) : activeTab === "consultants" ? (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {paginatedData.map((con, i) => (
                    <ConsultantGridCard
                      key={con.id}
                      consultant={con}
                      index={i}
                      onView={() => router.push(`/consulting/${con.id}`)}
                      onEdit={() => router.push(`/consulting/${con.id}?tab=Edit`)}
                      onDelete={() => setDeleteDialog({ open: true, item: con })}
                      onToggleFeatured={() => handleToggleFeatured(con)}
                    />
                  ))}
                </div>
              ) : (
                <ConsultantTable
                  consultants={paginatedData}
                  onView={(con) => router.push(`/consulting/${con.id}`)}
                  onEdit={(con) => router.push(`/consulting/${con.id}?tab=Edit`)}
                  onDelete={(con) => setDeleteDialog({ open: true, item: con })}
                  onToggleStatus={handleToggleStatus}
                  onToggleFeatured={handleToggleFeatured}
                />
              )}
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : activeTab === "sessions" ? (
            <>
              <SessionsInlineList
                sessions={paginatedData}
                onView={(ses) => router.push(`/consulting/sessions/${ses.id}`)}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <RequestsInlineList
                requests={paginatedData}
                onView={(req) => router.push(`/consulting/requests/${req.id}`)}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Consultant"
        description={`Are you sure you want to delete "${deleteDialog.item?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

function ConsultantGridCard({ consultant, index, onView, onEdit, onDelete, onToggleFeatured }) {
  const con = consultant;
  const avail = availabilityOptions.find((a) => a.value === con.availability) || availabilityOptions[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-2xl p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.08)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="relative shrink-0">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black text-white"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            {con.name?.charAt(0) || "?"}
          </div>
          {con.verified && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-sm font-black text-foreground truncate">{con.name}</p>
            {con.featured && <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400 shrink-0" />}
          </div>
          <p className="text-[10px] text-muted-foreground font-medium truncate">{con.title}</p>
          <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5">{con.location}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <StatusBadge status={con.status} />
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: `${avail.color}15`, color: avail.color }}
        >
          {avail.label}
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium mb-3">
        <span className="flex items-center gap-1">
          <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          {con.rating?.toFixed(1)}
        </span>
        <span>{con.sessionsCompleted} sessions</span>
        <span className="font-black text-foreground">${con.hourlyRate}/hr</span>
      </div>
      {(con.specializations || []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {con.specializations.slice(0, 2).map((s) => (
            <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#0F69B0]/8 text-[#0F69B0]">{s}</span>
          ))}
          {con.specializations.length > 2 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-muted-foreground">
              +{con.specializations.length - 2}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
        <button
          onClick={onView}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
          title="View"
        >
          <Eye className="h-3.5 w-3.5 mx-auto" />
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5 mx-auto" />
        </button>
        <button
          onClick={onToggleFeatured}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer"
        >
          {con.featured ? <StarOff className="h-3.5 w-3.5 mx-auto" /> : <StarIcon className="h-3.5 w-3.5 mx-auto" />}
        </button>
        <button
          onClick={onDelete}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5 mx-auto" />
        </button>
      </div>
    </motion.div>
  );
}

function SessionsInlineList({ sessions, onView }) {
  return (
    <div className="space-y-2">
      {sessions.map((ses, i) => (
        <motion.div
          key={ses.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onView?.(ses)}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-xl bg-[#0F69B0]/10 flex items-center justify-center text-[#0F69B0] shrink-0">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{ses.title}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              {ses.consultantName} → {ses.clientName} · {formatDate(ses.scheduledAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-black text-foreground">${ses.price}</span>
            <StatusBadge status={ses.status} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RequestsInlineList({ requests, onView }) {
  const priorityColors = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
  return (
    <div className="space-y-2">
      {requests.map((req, i) => (
        <motion.div
          key={req.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          onClick={() => onView?.(req)}
          className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0f1420] hover:border-[#0F69B0]/20 transition-all cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{req.title}</p>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
              {req.requestedBy?.name} · {req.category} · Budget: ${req.budget}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
              style={{ background: `${priorityColors[req.priority]}15`, color: priorityColors[req.priority] }}
            >
              {req.priority}
            </span>
            <StatusBadge status={req.status === "pending" ? "pending" : req.status === "assigned" ? "active" : "completed"} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}