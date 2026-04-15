"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Plus, Package, CheckCircle, Clock,
  AlertTriangle, XCircle, List, Grid3X3,
  LayoutGrid,
} from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductTable from "@/components/products/ProductTable";
import ProductCard from "@/components/products/ProductCard";
import ProductFilter from "@/components/products/ProductFilters";
import StatsCard from "@/components/common/StatCard";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import {
  fetchProducts, removeProduct, editProduct,
  approveProduct, rejectProduct,
} from "@/store/actions/productsActions";
import { dummyProductStats } from "@/data/dummyProducts";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const mainTabs = [
  { id: "all", label: "All Products", icon: LayoutGrid },
  { id: "approved", label: "Approved", icon: CheckCircle },
  { id: "pending", label: "Pending", icon: Clock },
  { id: "reported", label: "Reported", icon: AlertTriangle },
  { id: "rejected", label: "Rejected", icon: XCircle },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { products, isLoading } = useSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];

  const tabFiltered = useMemo(() => {
    if (activeTab === "all") return safeProducts;
    return safeProducts.filter((p) => p.status === activeTab);
  }, [safeProducts, activeTab]);

  const tabCounts = useMemo(() => ({
    all: safeProducts.length,
    approved: safeProducts.filter((p) => p.status === "approved").length,
    pending: safeProducts.filter((p) => p.status === "pending").length,
    reported: safeProducts.filter((p) => p.status === "reported").length,
    rejected: safeProducts.filter((p) => p.status === "rejected").length,
  }), [safeProducts]);

  const { query, setQuery, results: searched } = useSearch(tabFiltered, [
    "name", "slug", "brand", "sku", "category", "seller",
  ]);

  const { filters, filteredData: filtered, updateFilter, resetFilters } = useFilter(searched, {
    status: "all", category: "all", stock: "all", featured: "all",
  });

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "newest": return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "oldest": return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case "priceHigh": return arr.sort((a, b) => b.price - a.price);
      case "priceLow": return arr.sort((a, b) => a.price - b.price);
      case "rating": return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "sold": return arr.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      default: return arr;
    }
  }, [filtered, sortBy]);

  const stockFiltered = useMemo(() => {
    if (!filters.stock || filters.stock === "all") return sorted;
    if (filters.stock === "outOfStock") return sorted.filter((p) => p.stock === 0);
    if (filters.stock === "lowStock") return sorted.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold || 10));
    if (filters.stock === "inStock") return sorted.filter((p) => p.stock > (p.lowStockThreshold || 10));
    return sorted;
  }, [sorted, filters.stock]);

  const hasActiveFilters =
    filters.status !== "all" ||
    filters.category !== "all" ||
    filters.stock !== "all" ||
    filters.featured !== "all" ||
    query.trim() !== "";

  const itemsPerPage = viewMode === "grid" ? 12 : 10;

  const {
    currentPage, totalPages, paginatedData,
    goToPage, from, to, total,
  } = usePagination(stockFiltered, itemsPerPage);

  const handleDelete = async () => {
    const id = deleteDialog?.product?.id;
    if (!id) { setDeleteDialog({ open: false, product: null }); return; }
    setIsDeleting(true);
    try {
      const res = await dispatch(removeProduct(id));
      if (res?.success) toast.success("Product deleted");
      else toast.error("Failed to delete");
    } catch { toast.error("Something went wrong"); }
    finally { setIsDeleting(false); setDeleteDialog({ open: false, product: null }); }
  };

  const handleApprove = async (product) => {
    if (!product?.id) return;
    const res = await dispatch(approveProduct(product.id));
    if (res?.success) toast.success(`${product.name} approved`);
    else toast.error("Failed to approve");
  };

  const handleReject = async (product) => {
    if (!product?.id) return;
    const res = await dispatch(rejectProduct(product.id));
    if (res?.success) toast.success(`${product.name} rejected`);
    else toast.error("Failed to reject");
  };

  const handleToggleFeatured = async (product) => {
    if (!product?.id) return;
    await dispatch(editProduct(product.id, { ...product, featured: !product.featured }));
    toast.success(`${!product.featured ? "Featured" : "Unfeatured"} successfully`);
  };

  const handleView = (p) => { if (p?.id) router.push(`/products/${p.id}`); };
  const handleEdit = (p) => { if (p?.id) router.push(`/products/${p.id}`); };
  const handleDeleteOpen = (p) => { if (p?.id) setDeleteDialog({ open: true, product: p }); };

  const stats = dummyProductStats || {};

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader
        title="Products"
        description="Manage all products across the marketplace"
      >
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/products/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25 whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </motion.button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatsCard
          title="Total Products"
          value={stats.totalProducts || 0}
          icon={Package}
          color="rgba(15,105,176,0.08)"
          index={0}
        />
        <StatsCard
          title="Approved"
          value={stats.approvedProducts || 0}
          icon={CheckCircle}
          color="rgba(16,185,129,0.08)"
          index={1}
        />
        <StatsCard
          title="Pending Review"
          value={stats.pendingProducts || 0}
          icon={Clock}
          color="rgba(245,158,11,0.08)"
          index={2}
        />
        <StatsCard
          title="Reported"
          value={stats.reportedProducts || 0}
          icon={AlertTriangle}
          color="rgba(239,68,68,0.08)"
          index={3}
        />
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center overflow-x-auto scrollbar-thin">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const count = tabCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setQuery("");
                    resetFilters();
                    goToPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-4 text-xs font-bold transition-all cursor-pointer whitespace-nowrap border-b-2",
                    activeTab === tab.id
                      ? "border-[#0F69B0] text-[#0F69B0] bg-[#0F69B0]/[0.04]"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-white/[0.03]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {tab.label}
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
                </button>
              );
            })}

            <div className="ml-auto flex items-center gap-1 px-3 shrink-0 border-l border-gray-100 dark:border-white/[0.06]">
              <button
                onClick={() => setViewMode("table")}
                title="Table view"
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer",
                  viewMode === "table"
                    ? "bg-[#0F69B0] text-white"
                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                title="Grid view"
                className={cn(
                  "h-9 w-9 flex items-center justify-center rounded-xl transition-colors cursor-pointer",
                  viewMode === "grid"
                    ? "bg-[#0F69B0] text-white"
                    : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04]"
                )}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <ProductFilter
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
            resultCount={stockFiltered.length}
          />
        </div>

        <div className="p-4">
          {isLoading ? (
            <LoadingSpinner size="lg" text="Loading products..." className="py-16" />
          ) : stockFiltered.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description={
                hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Add your first product to get started"
              }
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {hasActiveFilters && (
                    <button
                      onClick={() => { resetFilters(); setQuery(""); goToPage(1); }}
                      className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => router.push("/products/add")}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>
              }
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedData.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDeleteOpen}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                ))}
              </div>
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
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
          ) : (
            <>
              <ProductTable
                products={paginatedData}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDeleteOpen}
                onApprove={handleApprove}
                onReject={handleReject}
                onToggleFeatured={handleToggleFeatured}
              />
              <div className="mt-5 border-t border-gray-50 dark:border-white/[0.04] pt-4">
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
      </div>

      <ConfirmDialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, product: null })}
        onConfirm={handleDelete}
        title="Delete Product"
        description={
          deleteDialog.product
            ? `Are you sure you want to delete "${deleteDialog.product.name}"? This cannot be undone.`
            : "Are you sure?"
        }
        confirmLabel="Delete Product"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}