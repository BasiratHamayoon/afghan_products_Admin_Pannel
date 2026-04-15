// app/(dashboard)/investments/completed/page.jsx

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Plus, CheckCircle, DollarSign, Users, Target } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import InvestmentTable from "@/components/investments/InvestmentTable";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import { dummyInvestments, investmentTypeOptions } from "@/data/dummyInvestments";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import toast from "react-hot-toast";

const typeFilterOptions = [
  { value: "all", label: "All Types" },
  ...investmentTypeOptions.map((t) => ({ value: t.value, label: t.label })),
];

const riskFilterOptions = [
  { value: "all", label: "All Risk Levels" },
  { value: "low", label: "Low Risk" },
  { value: "medium", label: "Medium Risk" },
  { value: "high", label: "High Risk" },
];

export default function CompletedInvestmentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setData(dummyInvestments.filter((inv) => inv.status === "completed"));
      setIsLoading(false);
    }, 600);
  }, []);

  const { query, setQuery, results: searched } = useSearch(data, ["title", "slug", "description", "location", "category"]);
  const { filters, filteredData, updateFilter } = useFilter(searched, { type: "all", riskLevel: "all" });

  const {
    currentPage, totalPages, paginatedData,
    goToPage, from, to, total,
  } = usePagination(filteredData, 8);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 600));
    setData((prev) => prev.filter((inv) => inv.id !== deleteDialog.item.id));
    setIsDeleting(false);
    setDeleteDialog({ open: false, item: null });
    toast.success("Investment deleted");
  };

  const totalInvested = data.reduce((acc, inv) => acc + (inv.investedAmount || 0), 0);
  const totalReturns = data.reduce((acc, inv) => acc + (inv.returnAmount || 0), 0);
  const totalInvestors = data.reduce((acc, inv) => acc + (inv.investorsCount || 0), 0);
  const avgRoi = data.length > 0 ? (data.reduce((acc, inv) => acc + (inv.roi || 0), 0) / data.length).toFixed(1) : 0;

  return (
    <div>
      <Breadcrumb />
      <PageHeader title="Completed Investments" description="Successfully completed investment projects">
        <div className="flex items-center gap-3">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/investments/add")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Investment
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard title="Completed" value={data.length} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={0} />
        <StatsCard title="Total Invested" value={`$${(totalInvested / 1000).toFixed(0)}K`} icon={DollarSign} color="rgba(15,105,176,0.08)" index={1} />
        <StatsCard title="Total Returns" value={`$${(totalReturns / 1000).toFixed(0)}K`} icon={Target} color="rgba(124,58,237,0.08)" index={2} />
        <StatsCard title="Avg ROI" value={`${avgRoi}%`} icon={CheckCircle} color="rgba(245,158,11,0.08)" index={3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
      >
        <div className="p-5 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search completed investments..." className="flex-1" />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterDropdown label="Type" value={filters.type || "all"} options={typeFilterOptions} onChange={(v) => updateFilter("type", v)} />
              <FilterDropdown label="Risk" value={filters.riskLevel || "all"} options={riskFilterOptions} onChange={(v) => updateFilter("riskLevel", v)} />
            </div>
          </div>
        </div>

        <div className="p-5">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading completed investments..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No completed investments found"
              description="Completed investments will appear here once projects finish"
              action={
                <button
                  onClick={() => router.push("/investments")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                >
                  View All Investments
                </button>
              }
            />
          ) : (
            <>
              <InvestmentTable
                investments={paginatedData}
                onView={(inv) => router.push(`/investments/${inv.id}`)}
                onEdit={(inv) => router.push(`/investments/${inv.id}`)}
                onDelete={(inv) => setDeleteDialog({ open: true, item: inv })}
                onToggleStatus={(inv) => toast.success(`Toggle status for ${inv.title}`)}
                onToggleFeatured={(inv) => toast.success(`Toggle featured for ${inv.title}`)}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Investment"
        description={`Are you sure you want to delete "${deleteDialog.item?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}