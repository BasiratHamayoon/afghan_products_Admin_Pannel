"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Package, CheckCircle, Clock,
  AlertTriangle, List, Grid3X3,
  LayoutGrid, X, RefreshCw,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductTable from "@/components/products/ProductTable";
import ProductCard from "@/components/products/ProductCard";
import SearchInput from "@/components/common/SearchInput";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import FilterDropdown from "@/components/common/FilterDropdown";
import {
  fetchProducts,
  fetchProductStats,
  deleteProduct,
  archiveProduct,
  unarchiveProduct,
  toggleProductStatus,
} from "@/store/actions/productsActions";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const DEBOUNCE_DELAY = 500;
const PAGE_LIMIT = 10;

export default function ProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { products, isLoading, pagination, stats } = useSelector((state) => state.products);

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });
  const [archiveDialog, setArchiveDialog] = useState({ open: false, item: null, action: null });
  const [statusDialog, setStatusDialog] = useState({ open: false, item: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActioning, setIsActioning] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const searchDebounceRef = useRef(null);
  const hasFetchedRef = useRef(false);

  const TABS = [
    { id: "all", label: t("products.allProducts"), icon: LayoutGrid },
    { id: "active", label: t("products.active"), icon: CheckCircle },
    { id: "archived", label: t("products.archived"), icon: Clock },
  ];

  const STOCK_OPTIONS = [
    { value: "all", label: t("products.allStock") },
    { value: "inStock", label: t("products.inStock") },
    { value: "lowStock", label: t("products.lowStock") },
    { value: "outOfStock", label: t("products.outOfStock") },
  ];

  const SORT_OPTIONS = [
    { value: "createdAt_desc", label: t("products.newestFirst") },
    { value: "createdAt_asc", label: t("products.oldestFirst") },
    { value: "sellingPrice_desc", label: t("products.priceHighToLow") },
    { value: "sellingPrice_asc", label: t("products.priceLowToHigh") },
    { value: "stock_asc", label: t("products.stockLowToHigh") },
    { value: "stock_desc", label: t("products.stockHighToLow") },
  ];

  const buildParams = useCallback((page, search, tab, stock, sort) => {
    const params = { page, limit: PAGE_LIMIT };
    if (search?.trim()) params.search = search.trim();
    if (tab === "active") params.isArchived = false;
    else if (tab === "archived") params.isArchived = true;
    if (stock === "outOfStock") params.stock = "outOfStock";
    else if (stock === "lowStock") params.stock = "lowStock";
    else if (stock === "inStock") params.stock = "inStock";
    if (sort) {
      const [field, order] = sort.split("_");
      params.sortBy = field;
      params.sortOrder = order;
    }
    return params;
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    if (!products || products.length === 0) {
      dispatch(fetchProducts(buildParams(1, "", "all", "all", "createdAt_desc")));
    }
    if (!stats) dispatch(fetchProductStats());
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const triggerFetch = useCallback((page, search, tab, stock, sort) => {
    dispatch(fetchProducts(buildParams(page, search, tab, stock, sort)));
  }, [dispatch, buildParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    setCurrentPage(1);
    triggerFetch(1, "", tab, stockFilter, sortBy);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setCurrentPage(1);
      triggerFetch(1, val, activeTab, stockFilter, sortBy);
    }, DEBOUNCE_DELAY);
  };

  const handleStockFilterChange = (val) => {
    setStockFilter(val);
    setCurrentPage(1);
    triggerFetch(1, searchQuery, activeTab, val, sortBy);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setCurrentPage(1);
    triggerFetch(1, searchQuery, activeTab, stockFilter, val);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    triggerFetch(page, searchQuery, activeTab, stockFilter, sortBy);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
    triggerFetch(1, "", activeTab, stockFilter, sortBy);
  };

  const handleRefresh = () => {
    triggerFetch(currentPage, searchQuery, activeTab, stockFilter, sortBy);
  };

  const handleDeleteConfirm = async () => {
    const { item } = deleteDialog;
    if (!item?.id) { setDeleteDialog({ open: false, item: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(deleteProduct(item.id));
      if (res?.success) {
        toast.success(t("products.productDeleted"));
      } else {
        toast.error(res?.message || t("products.failedToDelete"));
      }
    } catch {
      toast.error(t("products.somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, item: null });
    }
  };

  const handleArchiveConfirm = async () => {
    const { item, action } = archiveDialog;
    if (!item?.id) { setArchiveDialog({ open: false, item: null, action: null }); return; }
    setIsActioning(true);
    try {
      const fn = action === "archive" ? archiveProduct : unarchiveProduct;
      const res = await dispatch(fn(item.id));
      if (res?.success) {
        toast.success(action === "archive" ? t("products.productArchived") : t("products.productUnarchived"));
      } else {
        toast.error(res?.message || t("products.actionFailed"));
      }
    } catch {
      toast.error(t("products.somethingWentWrong"));
    } finally {
      setIsActioning(false);
      setArchiveDialog({ open: false, item: null, action: null });
    }
  };

  const handleStatusConfirm = async () => {
    const { item } = statusDialog;
    if (!item?.id) { setStatusDialog({ open: false, item: null }); return; }
    setIsTogglingStatus(true);
    try {
      const res = await dispatch(toggleProductStatus(item.id, item.status));
      if (res?.success) {
        toast.success(t("products.statusUpdated"));
      } else {
        toast.error(res?.message || t("products.failedToUpdateStatus"));
      }
    } catch {
      toast.error(t("products.somethingWentWrong"));
    } finally {
      setIsTogglingStatus(false);
      setStatusDialog({ open: false, item: null });
    }
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const filteredProducts = (() => {
    if (activeTab === "active") return safeProducts.filter((p) => !p.isArchived);
    if (activeTab === "archived") return safeProducts.filter((p) => p.isArchived);
    return safeProducts;
  })();

  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || filteredProducts.length;
  const from = total === 0 ? 0 : (currentPage - 1) * PAGE_LIMIT + 1;
  const to = Math.min(currentPage * PAGE_LIMIT, total);

  const allCount = safeProducts.length;
  const activeCount = safeProducts.filter((p) => !p.isArchived).length;
  const archivedCount = safeProducts.filter((p) => p.isArchived).length;
  const tabCounts = { all: allCount, active: activeCount, archived: archivedCount };

  const totalFromStats = stats?.total ?? total;
  const activeFromStats = stats?.active ?? activeCount;
  const archivedFromStats = stats?.archived ?? archivedCount;
  const pendingFromStats = stats?.pending ?? 0;

  const commonProps = {
    onView: (p) => router.push(`/products/${p.slug || p.id}`),
    onDelete: (p) => setDeleteDialog({ open: true, item: p }),
    onArchive: (p) => setArchiveDialog({ open: true, item: p, action: "archive" }),
    onUnarchive: (p) => setArchiveDialog({ open: true, item: p, action: "unarchive" }),
    onToggleStatus: (p) => setStatusDialog({ open: true, item: p }),
  };

  return (
    <div className="space-y-5">
      <Breadcrumb />
      <PageHeader title={t("products.title")} description={t("products.description")} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard title={t("products.total")} value={totalFromStats} icon={Package} color="rgba(15,105,176,0.08)" index={0} />
        <StatsCard title={t("products.active")} value={activeFromStats} icon={CheckCircle} color="rgba(16,185,129,0.08)" index={1} />
        <StatsCard title={t("products.archived")} value={archivedFromStats} icon={Clock} color="rgba(245,158,11,0.08)" index={2} />
        <StatsCard title={t("products.pendingApproval")} value={pendingFromStats} icon={AlertTriangle} color="rgba(239,68,68,0.08)" index={3} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="flex items-center gap-0 border-b border-gray-100 dark:border-white/[0.06] overflow-x-auto scrollbar-thin">
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
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                <span className={cn("px-1.5 py-0.5 rounded-full text-[10px] font-black", activeTab === tab.id ? "bg-[#0F69B0] text-white" : "bg-gray-100 dark:bg-white/[0.08] text-muted-foreground")}>
                  {tabCounts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <SearchInput value={searchQuery} onChange={handleSearchChange} placeholder={t("products.searchPlaceholder")} />
            </div>
            <FilterDropdown label={t("products.stock")} value={stockFilter} options={STOCK_OPTIONS} onChange={handleStockFilterChange} />
            <FilterDropdown label={t("products.sort")} value={sortBy} options={SORT_OPTIONS} onChange={handleSortChange} />
            {searchQuery && (
              <button onClick={handleClearSearch} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer border border-red-200 dark:border-red-800/40">
                <X className="h-3.5 w-3.5" />
                {t("products.clear")}
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
            <p className="text-[11px] text-muted-foreground font-medium">
              {filteredProducts.length} {filteredProducts.length !== 1 ? t("products.resultsPlural") : t("products.results")}
            </p>
          </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text={t("products.loadingProducts")} className="py-16" />
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t("products.noProductsFound")}
              description={
                searchQuery
                  ? t("products.tryAdjustingSearch")
                  : activeTab === "archived"
                  ? t("products.noArchivedProducts")
                  : activeTab === "active"
                  ? t("products.noActiveProducts")
                  : t("products.noProductsYet")
              }
              action={searchQuery ? (
                <button onClick={handleClearSearch} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                  {t("products.clearSearch")}
                </button>
              ) : null}
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} {...commonProps} />
                ))}
              </div>
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <ProductTable products={filteredProducts} {...commonProps} />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} from={from} to={to} total={total} />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, item: null })}
        onConfirm={handleDeleteConfirm}
        title={t("products.deleteProduct")}
        description={deleteDialog.item ? `${t("products.deleteProductDesc")} "${deleteDialog.item.name}"${t("products.deleteProductSuffix")}` : t("products.areYouSure")}
        confirmLabel={t("products.delete")}
        isLoading={isDeleting}
        variant="danger"
      />

      <ConfirmDialog
        open={archiveDialog.open}
        onClose={() => setArchiveDialog({ open: false, item: null, action: null })}
        onConfirm={handleArchiveConfirm}
        title={archiveDialog.action === "archive" ? t("products.archiveProduct") : t("products.unarchiveProduct")}
        description={archiveDialog.item ? `${archiveDialog.action === "archive" ? t("products.archiveDesc") : t("products.unarchiveDesc")} "${archiveDialog.item.name}"?` : t("products.areYouSure")}
        confirmLabel={archiveDialog.action === "archive" ? t("products.archive") : t("products.unarchive")}
        isLoading={isActioning}
        variant={archiveDialog.action === "archive" ? "warning" : "primary"}
      />

      <ConfirmDialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, item: null })}
        onConfirm={handleStatusConfirm}
        title={t("products.changeApprovalStatus")}
        description={statusDialog.item ? `${t("products.approvalStatusDesc")} ${statusDialog.item.status === "APPROVED" ? t("products.approvalSetPending") : t("products.approve")} "${statusDialog.item.name}"?` : t("products.areYouSure")}
        confirmLabel={statusDialog.item?.status === "APPROVED" ? t("products.setPending") : t("products.approve")}
        isLoading={isTogglingStatus}
        variant={statusDialog.item?.status === "APPROVED" ? "warning" : "primary"}
      />
    </div>
  );
}