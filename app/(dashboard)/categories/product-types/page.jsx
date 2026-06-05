"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, Tag, X, List, Grid3X3,
  FolderOpen, Package, Layers, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import SharedTable from "@/components/categories/SharedTable";
import SharedGridCard from "@/components/categories/SharedGridCard";
import StatsCard from "@/components/common/StatCard";
import SearchInput from "@/components/common/SearchInput";
import FilterDropdown from "@/components/common/FilterDropdown";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  fetchProductTypes,
  fetchProductTypeStats,
  archiveProductTypeAction,
  unarchiveProductTypeAction,
  deleteProductTypeAction,
} from "@/store/actions/productTypesActions";
import { loadCategoryOptions, loadSubCategoryOptions } from "@/store/actions/selectActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "archived", label: "Archived" },
];

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function ProductTypesPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { productTypes, isLoading, pagination, stats } = useSelector((state) => state.productTypes);
  const { categoryOptions: reduxCatOptions, subCategoryOptions: reduxSubCatOptions } = useSelector((state) => state.select);

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [archiveDialog, setArchiveDialog] = useState({ open: false, item: null, action: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [isActioning, setIsActioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);
  const prevCategoryFilterRef = useRef("all");

  const categoryFilterOptions = [
    { value: "all", label: "All Categories" },
    ...reduxCatOptions.map((c) => ({ value: c.id || c._id, label: c.name })),
  ];

  const subCategoryFilterOptions = [
    { value: "all", label: "All Subcategories" },
    ...reduxSubCatOptions.map((s) => ({ value: s.id || s._id, label: s.name })),
  ];

  const buildParams = useCallback((page, search, tab, catId, subCatId) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab === "active") params.isArchived = false;
    else if (tab === "archived") params.isArchived = true;
    if (catId && catId !== "all") params.categoryId = catId;
    if (subCatId && subCatId !== "all") params.subCategoryId = subCatId;
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    if (!productTypes || productTypes.length === 0) {
      dispatch(fetchProductTypes(buildParams(1, "", "all", "all", "all")));
    }
    if (!stats) dispatch(fetchProductTypeStats());
    dispatch(loadCategoryOptions());
  }, []);

  useEffect(() => {
    if (categoryFilter === prevCategoryFilterRef.current) return;
    prevCategoryFilterRef.current = categoryFilter;
    if (categoryFilter === "all") return;
    dispatch(loadSubCategoryOptions(categoryFilter));
  }, [categoryFilter, dispatch]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback((page, search, tab, catId, subCatId) => {
    dispatch(fetchProductTypes(buildParams(page, search, tab, catId, subCatId)));
  }, [dispatch, buildParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    triggerFetch(1, "", tab, categoryFilter, subCategoryFilter);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab, categoryFilter, subCategoryFilter);
    }, DEBOUNCE_DELAY);
  };

  const handleCategoryFilterChange = (val) => {
    setCategoryFilter(val);
    setSubCategoryFilter("all");
    setCurrentPage(1);
    triggerFetch(1, searchQuery, activeTab, val, "all");
  };

  const handleSubCategoryFilterChange = (val) => {
    setSubCategoryFilter(val);
    setCurrentPage(1);
    triggerFetch(1, searchQuery, activeTab, categoryFilter, val);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab, categoryFilter, subCategoryFilter);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    triggerFetch(1, "", activeTab, categoryFilter, subCategoryFilter);
  };

  const handleRefresh = () => {
    triggerFetch(currentPage, searchQuery, activeTab, categoryFilter, subCategoryFilter);
    dispatch(fetchProductTypeStats());
  };

  const handleArchiveConfirm = async () => {
    const { item, action } = archiveDialog;
    if (!item?.id) { setArchiveDialog({ open: false, item: null, action: null }); return; }
    setIsActioning(true);
    try {
      const fn = action === "archive" ? archiveProductTypeAction : unarchiveProductTypeAction;
      const res = await dispatch(fn(item.id));
      if (res?.success) {
        toast.success(action === "archive" ? "Product type archived" : "Product type unarchived");
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, item: null, action: null });
    }
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id || !item?.slug) {
      setDeleteDialog({ open: false, item: null });
      toast.error("Missing data for deletion");
      return;
    }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteProductTypeAction(item.id, item.slug));
      if (res?.success) {
        toast.success("Product type deleted");
      } else {
        toast.error(res?.message || "Failed to delete");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const safeItems = Array.isArray(productTypes) ? productTypes : [];

  const filteredItems = (() => {
    if (activeTab === "active") return safeItems.filter((p) => !p.isArchived);
    if (activeTab === "archived") return safeItems.filter((p) => p.isArchived);
    return safeItems;
  })();

  const totalPages = pagination?.totalPages || Math.ceil(filteredItems.length / PAGE_LIMIT) || 1;
  const total = pagination?.total || filteredItems.length;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const allCount = safeItems.length;
  const activeCount = safeItems.filter((p) => !p.isArchived).length;
  const archivedCount = safeItems.filter((p) => p.isArchived).length;
  const tabCounts = { all: allCount, active: activeCount, archived: archivedCount };

  const totalFromStats = stats?.total ?? total;
  const activeFromStats = stats?.active ?? activeCount;
  const archivedFromStats = stats?.archived ?? archivedCount;

  const commonCardProps = {
    onView: (it) => {
      if (it?.slug) {
        router.push(`/categories/product-types/${it.slug}`);
      } else {
        toast.error("Slug not available");
      }
    },
    onEdit: (it) => router.push(`/categories/product-types/add?edit=${it.id}&slug=${it.slug || ""}`),
    onArchive: (it) => setArchiveDialog({ open: true, item: it, action: "archive" }),
    onUnarchive: (it) => setArchiveDialog({ open: true, item: it, action: "unarchive" }),
    onDelete: (it) => setDeleteDialog({ open: true, item: it }),
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title="Product Types" description="Manage all product types">
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/categories/product-types/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Product Type
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title="Total" value={totalFromStats} icon={Tag} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title="Active" value={activeFromStats} icon={FolderOpen} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title="Archived" value={archivedFromStats} icon={Layers} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title="Shown" value={filteredItems.length} icon={Package} color="rgba(124,58,237,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.06] overflow-x-auto scrollbar-thin">
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
              <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                {tabCounts[tab.id]}
              </span>
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder="Search product types..." />
            </div>
            <FilterDropdown label="Category" value={categoryFilter} options={categoryFilterOptions} onChange={handleCategoryFilterChange} />
            <FilterDropdown label="Subcategory" value={subCategoryFilter} options={subCategoryFilterOptions} onChange={handleSubCategoryFilterChange} />
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />Clear
              </button>
            )}
            <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer border border-gray-200 dark:border-white/[0.08]" title="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center border border-gray-200 dark:border-white/[0.08] rounded-xl overflow-hidden">
              <button onClick={() => setViewMode("table")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "table" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <List className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode("grid")} className={cn("h-9 w-9 flex items-center justify-center transition-colors cursor-pointer", viewMode === "grid" ? "bg-[#0F69B0] text-white" : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]")}>
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">{filteredItems.length} result{filteredItems.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading product types..." className="py-16" />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              icon={Tag}
              title="No product types found"
              description={searchQuery ? "Try adjusting your search" : activeTab === "archived" ? "No archived product types" : activeTab === "active" ? "No active product types" : "Create your first product type"}
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {searchQuery && (
                    <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                      Clear Search
                    </button>
                  )}
                  <button onClick={() => router.push("/categories/product-types/add")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                    <Plus className="h-4 w-4" />Add Product Type
                  </button>
                </div>
              }
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredItems.map((item, i) => (
                  <SharedGridCard key={item.id} item={item} index={i} defaultEmoji="🏷️" extraInfo={[{ key: "categoryName", color: "#0F69B0" }, { key: "subCategoryName", color: "#7c3aed", prefix: "↳" }]} {...commonCardProps} />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <SharedTable items={filteredItems} extraColumns={[{ key: "categoryName", label: "Category" }, { key: "subCategoryName", label: "Subcategory" }]} {...commonCardProps} />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, item: null, action: null })}
        onConfirm={handleArchiveConfirm}
        title={archiveDialog.action === "archive" ? "Archive Product Type" : "Unarchive Product Type"}
        description={archiveDialog.item ? `Are you sure you want to ${archiveDialog.action} "${archiveDialog.item.name}"?` : "Are you sure?"}
        confirmLabel={archiveDialog.action === "archive" ? "Archive" : "Unarchive"}
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Type"
        description={deleteDialog.item ? `Are you sure you want to permanently delete "${deleteDialog.item.name}"? This cannot be undone.` : "Are you sure?"}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}