"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, FolderTree, Search, Filter, FolderOpen, Package } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SubCategoryList from "@/components/categories/SubCategoryList";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import { dummySubCategories, dummyCategories } from "@/data/dummyCategories";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import toast from "react-hot-toast";

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const levelOptions = [
  { value: "all", label: "All Levels" },
  { value: 2, label: "Level 2 (Sub)" },
  { value: 3, label: "Level 3 (Sub-Sub)" },
];

export default function SubCategoriesPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [parentFilter, setParentFilter] = useState("all");

  useEffect(() => {
    setTimeout(() => {
      setData(dummySubCategories);
      setIsLoading(false);
    }, 600);
  }, []);

  const parentOptions = [
    { value: "all", label: "All Parents" },
    ...dummyCategories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const parentFiltered = parentFilter === "all"
    ? data
    : data.filter((s) => s.parentId === parentFilter);

  const { query, setQuery, results: searched } = useSearch(parentFiltered, ["name", "slug", "description", "parentName"]);
  const { filters, filteredData, updateFilter } = useFilter(searched, { status: "all" });

  const {
    currentPage, totalPages, paginatedData,
    goToPage, from, to, total,
  } = usePagination(filteredData, 8);

  const handleDelete = async () => {
    setIsDeleting(true);
    await new Promise((r) => setTimeout(r, 600));
    setData((prev) => prev.filter((s) => s.id !== deleteDialog.item.id));
    setIsDeleting(false);
    setDeleteDialog({ open: false, item: null });
    toast.success("Subcategory deleted");
  };

  const level2Count = dummySubCategories.filter((s) => s.level === 2).length;
  const level3Count = dummySubCategories.filter((s) => s.level === 3).length;
  const activeCount = dummySubCategories.filter((s) => s.status === "active").length;
  const totalProducts = dummySubCategories.reduce((acc, s) => acc + (s.productsCount || 0), 0);

  return (
    <div>
      <Breadcrumb />
      <PageHeader
        title="Sub Categories"
        description="Manage all subcategories and nested categories"
      >
        <div className="flex items-center gap-3">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/categories/add")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Subcategory
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Subcategories"
          value={dummySubCategories.length}
          icon={FolderTree}
          color="rgba(15,105,176,0.08)"
          index={0}
        />
        <StatsCard
          title="Level 2 Sub"
          value={level2Count}
          icon={FolderOpen}
          color="rgba(124,58,237,0.08)"
          index={1}
        />
        <StatsCard
          title="Level 3 Sub-Sub"
          value={level3Count}
          icon={FolderTree}
          color="rgba(16,185,129,0.08)"
          index={2}
        />
        <StatsCard
          title="Total Products"
          value={totalProducts.toLocaleString()}
          icon={Package}
          color="rgba(245,158,11,0.08)"
          index={3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)]"
      >
        <div className="p-5 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search subcategories..."
              className="flex-1"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <FilterDropdown
                label="Parent"
                value={parentFilter}
                options={parentOptions}
                onChange={setParentFilter}
              />
              <FilterDropdown
                label="Status"
                value={filters.status || "all"}
                options={statusOptions}
                onChange={(v) => updateFilter("status", v)}
              />
              <FilterDropdown
                label="Level"
                value={filters.level || "all"}
                options={levelOptions}
                onChange={(v) => updateFilter("level", v === "all" ? "all" : Number(v))}
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading subcategories..." className="py-16" />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={FolderTree}
              title="No subcategories found"
              description="Try adjusting your search or filters"
              action={
                <button
                  onClick={() => router.push("/categories/add")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                >
                  <Plus className="h-4 w-4" />
                  Add Subcategory
                </button>
              }
            />
          ) : (
            <>
              <SubCategoryList
                subCategories={paginatedData}
                onView={(sub) => router.push(`/categories/${sub.id}`)}
                onEdit={(sub) => router.push(`/categories/${sub.id}`)}
                onDelete={(sub) => setDeleteDialog({ open: true, item: sub })}
                onAdd={() => router.push("/categories/add")}
              />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  from={from}
                  to={to}
                  total={total}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDelete}
        title="Delete Subcategory"
        description={`Are you sure you want to delete "${deleteDialog.item?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}