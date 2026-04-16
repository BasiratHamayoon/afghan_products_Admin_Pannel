"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Info, AlertTriangle, XCircle, SlidersHorizontal, X, RefreshCw } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ExportButton from "@/components/common/ExportButton";
import { fetchSystemLogs } from "@/store/actions/settingsActions";
import { logLevelOptions, logModuleOptions } from "@/data/dummySettings";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { formatDateTime } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const levelConfig = {
  info: { icon: Info, color: "#0F69B0", bg: "rgba(15,105,176,0.1)", label: "Info" },
  warning: { icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", label: "Warning" },
  error: { icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.1)", label: "Error" },
};

export default function SystemLogsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { systemLogs, isLoading } = useSelector((s) => s.settings);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { dispatch(fetchSystemLogs()); }, [dispatch]);

  const all = Array.isArray(systemLogs) ? systemLogs.filter(Boolean) : [];
  const { query, setQuery, results: searched } = useSearch(all, ["action", "description", "performedBy", "module", "ipAddress"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { level: "all", module: "all" });
  const hasActiveFilters = filters.level !== "all" || filters.module !== "all" || query.trim() !== "";
  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(filteredData, 15);

  const infoCount = all.filter((l) => l.level === "info").length;
  const warningCount = all.filter((l) => l.level === "warning").length;
  const errorCount = all.filter((l) => l.level === "error").length;

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="System Logs" description="Monitor platform activity and audit trail">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/settings")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <ArrowLeft className="h-4 w-4" />Back
          </button>
          <ExportButton onExport={(fmt) => toast.success(`Exporting logs as ${fmt}`)} />
          <button onClick={() => dispatch(fetchSystemLogs())} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
            <RefreshCw className="h-4 w-4" />Refresh
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Info", value: infoCount, color: "#0F69B0", bg: "rgba(15,105,176,0.08)", icon: Info },
          { label: "Warnings", value: warningCount, color: "#f59e0b", bg: "rgba(245,158,11,0.08)", icon: AlertTriangle },
          { label: "Errors", value: errorCount, color: "#ef4444", bg: "rgba(239,68,68,0.08)", icon: XCircle },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl p-5 bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] flex items-center gap-4">
            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.bg }}>
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]"><SearchInput value={query} onChange={setQuery} placeholder="Search logs by action, user, IP..." /></div>
            <button onClick={() => setShowFilters(!showFilters)} className={cn("flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap", showFilters || hasActiveFilters ? "border-[#0F69B0] bg-[#0F69B0]/8 text-[#0F69B0]" : "border-gray-200 dark:border-white/[0.08] text-muted-foreground hover:border-[#0F69B0]/30 hover:text-[#0F69B0]")}>
              <SlidersHorizontal className="h-3.5 w-3.5" />Filters
              {hasActiveFilters && <span className="h-4 w-4 rounded-full bg-[#0F69B0] text-white text-[9px] font-black flex items-center justify-center">!</span>}
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <FilterDropdown label="Level" value={filters.level || "all"} options={logLevelOptions} onChange={(v) => updateFilter("level", v)} />
                  <FilterDropdown label="Module" value={filters.module || "all"} options={logModuleOptions} onChange={(v) => updateFilter("module", v)} />
                  {hasActiveFilters && (
                    <button onClick={() => { resetFilters(); setQuery(""); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                      <X className="h-3.5 w-3.5" />Clear All
                    </button>
                  )}
                  <p className="text-[11px] text-muted-foreground font-medium ml-auto">{filteredData.length} result{filteredData.length !== 1 ? "s" : ""}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading system logs..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState icon={FileText} title="No logs found" description={hasActiveFilters ? "Try adjusting your filters" : "No system activity logged yet"} />
          ) : (
            <>
              <div className="space-y-2">
                {paginatedData.map((log, i) => {
                  const config = levelConfig[log.level] || levelConfig.info;
                  const Icon = config.icon;
                  return (
                    <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-start gap-3 p-3.5 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: config.bg }}>
                        <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <span className="text-xs font-black text-foreground">{log.action?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: config.bg, color: config.color }}>{log.level}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/[0.06] text-muted-foreground capitalize">{log.module}</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0">{formatDateTime(log.timestamp)}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium">{log.description}</p>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground font-medium">
                          <span>By: <span className="font-bold text-foreground">{log.performedBy}</span></span>
                          <span>IP: <span className="font-mono">{log.ipAddress}</span></span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}