"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, FolderTree, List, Grid3X3,
  FolderOpen, Package, TrendingUp,
  SlidersHorizontal, X, Network,
  Layers, LayoutGrid,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import CategoryTable from "@/components/categories/CategoryTable";
import CategoryTree from "@/components/categories/CategoryTree";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import {
  fetchCategories,
  removeCategory,
  editCategory,
} from "@/store/actions/categoriesActions";
import { dummyCategoryStats, dummySubCategories } from "@/data/dummyCategories";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import StatusBadge from "@/components/common/StatusBadge";
import { Edit2, Eye, Trash2, Star, StarOff, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/helpers";

const statusFilterOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const levelFilterOptions = [
  { value: "all", label: "All Levels" },
  { value: 1, label: "Level 1 — Main" },
  { value: 2, label: "Level 2 — Sub" },
  { value: 3, label: "Level 3 — Sub-Sub" },
];

const featuredFilterOptions = [
  { value: "all", label: "All" },
  { value: "true", label: "Featured Only" },
  { value: "false", label: "Not Featured" },
];

const mainTabs = [
  { id: "all", label: "All Categories", icon: LayoutGrid },
  { id: "main", label: "Main (L1)", icon: FolderOpen },
  { id: "sub", label: "Sub (L2)", icon: Layers },
  { id: "subsub", label: "Sub-Sub (L3)", icon: Layers },
  { id: "tree", label: "Tree View", icon: Network },
];

export default function CategoriesPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { categories, isLoading } = useSelector((state) => state.categories);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const allItems = [
    ...(Array.isArray(categories) ? categories.filter(Boolean) : []),
    ...(Array.isArray(dummySubCategories) ? dummySubCategories.filter(Boolean) : []),
  ];

  const tabFiltered = (() => {
    if (activeTab === "all") return allItems;
    if (activeTab === "main") return allItems.filter((c) => c.level === 1);
    if (activeTab === "sub") return allItems.filter((c) => c.level === 2);
    if (activeTab === "subsub") return allItems.filter((c) => c.level === 3);
    return allItems;
  })();

  const { query, setQuery, results: searched } = useSearch(tabFiltered, ["name", "slug", "description", "parentName"]);

  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, {
    status: "all",
    featured: "all",
  });

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.featured !== "all" ||
    query.trim() !== "";

  const {
    currentPage, totalPages, paginatedData,
    goToPage, from, to, total,
  } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    const categoryId = deleteDialog?.category?.id;
    if (!categoryId) { setDeleteDialog({ open: false, category: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeCategory(categoryId));
      if (res?.success) toast.success("Category deleted successfully");
      else toast.error("Failed to delete category");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, category: null }); }
  };

  const handleToggleStatus = async (cat) => {
    if (!cat?.id) return;
    const newStatus = cat.status === "active" ? "inactive" : "active";
    await dispatch(editCategory(cat.id, { ...cat, status: newStatus }));
    toast.success(`Category ${newStatus === "active" ? "activated" : "deactivated"}`);
  };

  const handleToggleFeatured = async (cat) => {
    if (!cat?.id) return;
    await dispatch(editCategory(cat.id, { ...cat, featured: !cat.featured }));
    toast.success(`${!cat.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  const handleEdit = (cat) => { if (cat?.id) router.push(`/categories/${cat.id}`); };
  const handleView = (cat) => { if (cat?.id) router.push(`/categories/${cat.id}`); };
  const handleDeleteOpen = (cat) => { if (cat?.id) setDeleteDialog({ open: true, category: cat }); };
  const handleAddSub = (cat) => { if (cat?.id) router.push(`/categories/add?parentId=${cat.id}`); };

  const stats = dummyCategoryStats || { totalCategories: 0, activeCategories: 0, totalSubCategories: 0, totalProducts: 0 };

  const tabCounts = {
    all: allItems.length,
    main: allItems.filter((c) => c.level === 1).length,
    sub: allItems.filter((c) => c.level === 2).length,
    subsub: allItems.filter((c) => c.level === 3).length,
    tree: null,
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader title="Categories" description="Manage all product categories organized by levels">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/categories/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total Categories" value={stats.totalCategories} icon={FolderOpen} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Active" value={stats.activeCategories} icon={TrendingUp} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Subcategories" value={stats.totalSubCategories} icon={FolderTree} color="rgba(124,58,237,0.08)" index={2} />
        <StatsCard title="Total Products" value={(stats.totalProducts || 0).toLocaleString()} icon={Package} color="rgba(245,158,11,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const count = tabCounts[tab.id];
              return (
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
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {count !== null && (
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                        activeTab === tab.id
                          ? "bg-[#0F69B0] text-white"
                          : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "tree" ? (
            <motion.div
              key="tree"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-black text-foreground">Category Tree</h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Visual hierarchy of all categories and subcategories
                  </p>
                </div>
                <button
                  onClick={() => router.push("/categories/add")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                <div className="lg:col-span-2 xl:col-span-3 rounded-2xl border border-gray-100 dark:border-white/[0.06] p-4 bg-gray-50/50 dark:bg-white/[0.02]">
                  <CategoryTree onEdit={handleEdit} onAdd={handleAddSub} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-gray-50 dark:border-white/[0.04] space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <SearchInput value={query} onChange={setQuery} placeholder={`Search ${activeTab === "all" ? "all categories" : activeTab === "main" ? "main categories" : activeTab === "sub" ? "subcategories" : "sub-sub categories"}...`} />
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

                  <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setViewMode("table")}
                      title="Table view"
                      className={cn(
                        "h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
                        viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("grid")}
                      title="Grid view"
                      className={cn(
                        "h-9 w-9 flex items-center justify-center transition-colors cursor-pointer",
                        viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                      )}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                  </div>
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
                        <FilterDropdown
                          label="Status"
                          value={filters.status || "all"}
                          options={statusFilterOptions}
                          onChange={(v) => updateFilter("status", v)}
                        />
                        <FilterDropdown
                          label="Featured"
                          value={String(filters.featured || "all")}
                          options={featuredFilterOptions}
                          onChange={(v) => updateFilter("featured", v)}
                        />
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
                  <LoadingSpinner size="lg" text="Loading categories..." className="py-16" />
                ) : !filteredData || filteredData.length === 0 ? (
                  <EmptyState
                    icon={FolderOpen}
                    title="No categories found"
                    description={hasActiveFilters ? "Try adjusting your search or filters" : "Create your first category to get started"}
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
                          onClick={() => router.push("/categories/add")}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                          style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                        >
                          <Plus className="h-4 w-4" />
                          Add Category
                        </button>
                      </div>
                    }
                  />
                ) : viewMode === "grid" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                      {paginatedData.map((cat, i) => (
                        <CategoryGridCard
                          key={cat.id}
                          category={cat}
                          index={i}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDeleteOpen}
                          onToggleStatus={handleToggleStatus}
                          onToggleFeatured={handleToggleFeatured}
                        />
                      ))}
                    </div>
                    <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
                    </div>
                  </>
                ) : (
                  <>
                    <CategoryTable
                      categories={paginatedData}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDeleteOpen}
                      onToggleStatus={handleToggleStatus}
                      onToggleFeatured={handleToggleFeatured}
                    />
                    <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, category: null })}
        onConfirm={handleDelete}
        title="Delete Category"
        description={
          deleteDialog.category
            ? `Are you sure you want to delete "${deleteDialog.category.name}"? This will also remove all subcategories and cannot be undone.`
            : "Are you sure you want to delete this category?"
        }
        confirmLabel="Delete Category"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}

function CategoryGridCard({ category, index, onView, onEdit, onDelete, onToggleStatus, onToggleFeatured }) {
  const levelColors = {
    1: { bg: "rgba(15,105,176,0.1)", text: "#0F69B0", label: "L1 Main" },
    2: { bg: "rgba(124,58,237,0.1)", text: "#7c3aed", label: "L2 Sub" },
    3: { bg: "rgba(16,185,129,0.1)", text: "#10b981", label: "L3 Sub-Sub" },
  };
  const lvl = levelColors[category.level] || levelColors[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-2xl p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-[#0F69B0]/25 dark:hover:border-[#0F69B0]/20 transition-all hover:shadow-[0_4px_20px_rgba(15,105,176,0.08)]"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0"
          style={{ background: category.color ? `${category.color}18` : "rgba(15,105,176,0.08)" }}
        >
          {category.image ? (
            <img src={category.image} alt={category.name} className="h-full w-full object-cover rounded-xl" />
          ) : category.icon || "📦"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
            <p className="text-sm font-black text-foreground truncate">{category.name}</p>
            {category.featured && (
              <span className="text-yellow-500 shrink-0">⭐</span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground font-medium truncate">/{category.slug}</p>
          {category.parentName && (
            <p className="text-[10px] text-[#0F69B0] font-semibold mt-0.5 truncate">↳ {category.parentName}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <StatusBadge status={category.status || "inactive"} showDot />
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: lvl.bg, color: lvl.text }}
        >
          {lvl.label}
        </span>
        <span className="text-[10px] text-muted-foreground font-medium ml-auto">
          {(category.productsCount || 0).toLocaleString()} products
        </span>
      </div>

      {category.description && (
        <p className="text-[11px] text-muted-foreground font-medium mb-3 line-clamp-2 leading-relaxed">
          {category.description}
        </p>
      )}

      <div className="text-[10px] text-muted-foreground font-medium mb-3">
        {formatDate(category.createdAt)}
      </div>

      <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-white/[0.06]">
        <button
          onClick={() => onView?.(category)}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
          title="View"
        >
          <Eye className="h-3.5 w-3.5 mx-auto" />
        </button>
        <button
          onClick={() => onEdit?.(category)}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-[#0F69B0] hover:bg-[#0F69B0]/8 transition-all cursor-pointer"
          title="Edit"
        >
          <Edit2 className="h-3.5 w-3.5 mx-auto" />
        </button>
        <button
          onClick={() => onToggleFeatured?.(category)}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer"
          title={category.featured ? "Unfeature" : "Feature"}
        >
          {category.featured ? <StarOff className="h-3.5 w-3.5 mx-auto" /> : <Star className="h-3.5 w-3.5 mx-auto" />}
        </button>
        <button
          onClick={() => onToggleStatus?.(category)}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all cursor-pointer"
          title="Toggle Status"
        >
          {category.status === "active" ? <ToggleRight className="h-3.5 w-3.5 mx-auto" /> : <ToggleLeft className="h-3.5 w-3.5 mx-auto" />}
        </button>
        <button
          onClick={() => onDelete?.(category)}
          className="flex-1 py-1.5 rounded-lg text-[11px] font-bold text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5 mx-auto" />
        </button>
      </div>
    </motion.div>
  );
}