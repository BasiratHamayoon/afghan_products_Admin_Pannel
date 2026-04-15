"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { Plus, Package, CheckCircle, XCircle, List, Grid3X3 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import Breadcrumb from "@/components/layout/Breadcrumb";
import ProductTable from "@/components/products/ProductTable";
import ProductCard from "@/components/products/ProductCard";
import ProductFilter from "@/components/products/ProductFilters";
import Pagination from "@/components/common/Pagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ExportButton from "@/components/common/ExportButton";
import {
  fetchProducts, removeProduct, editProduct,
  approveProduct, rejectProduct,
} from "@/store/actions/productsActions";
import { useSearch } from "@/hooks/useSearch";
import { useFilter } from "@/hooks/useFilter";
import { usePagination } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function ProductsSubPage({ status, title, description }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { products, isLoading } = useSelector((state) => state.products);
  const [viewMode, setViewMode] = useState("table");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
  const filtered = useMemo(() => safeProducts.filter((p) => p.status === status), [safeProducts, status]);

  const { query, setQuery, results: searched } = useSearch(filtered, ["name", "slug", "brand", "sku", "category", "seller"]);
  const { filters, filteredData, updateFilter, resetFilters } = useFilter(searched, { category: "all", stock: "all", featured: "all" });

  const sorted = useMemo(() => {
    const arr = [...filteredData];
    switch (sortBy) {
      case "priceHigh": return arr.sort((a, b) => b.price - a.price);
      case "priceLow": return arr.sort((a, b) => a.price - b.price);
      case "rating": return arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "sold": return arr.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
      case "oldest": return arr.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      default: return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [filteredData, sortBy]);

  const hasActiveFilters = filters.category !== "all" || filters.stock !== "all" || filters.featured !== "all" || query.trim() !== "";

  const { currentPage, totalPages, paginatedData, goToPage, from, to, total } = usePagination(sorted, viewMode === "grid" ? 12 : 10);

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

  const handleApprove = async (p) => {
    if (!p?.id) return;
    const res = await dispatch(approveProduct(p.id));
    if (res?.success) toast.success(`${p.name} approved`);
    else toast.error("Failed to approve");
  };

  const handleReject = async (p) => {
    if (!p?.id) return;
    const res = await dispatch(rejectProduct(p.id));
    if (res?.success) toast.success(`${p.name} rejected`);
    else toast.error("Failed to reject");
  };

  const handleToggleFeatured = async (p) => {
    if (!p?.id) return;
    await dispatch(editProduct(p.id, { ...p, featured: !p.featured }));
    toast.success(`${!p.featured ? "Featured" : "Unfeatured"}`);
  };

  const handleView = (p) => { if (p?.id) router.push(`/products/${p.id}`); };
  const handleEdit = (p) => { if (p?.id) router.push(`/products/${p.id}`); };
  const handleDeleteOpen = (p) => { if (p?.id) setDeleteDialog({ open: true, product: p }); };

  return (
    <div className="space-y-5">
      <Breadcrumb />

      <PageHeader title={title} description={`${filtered.length} ${description.toLowerCase()}`}>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ExportButton onExport={(fmt) => toast.success(`Exporting as ${fmt}`)} />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/products/add")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer shadow-lg shadow-[#0F69B0]/25"
            style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </motion.button>
        </div>
      </PageHeader>

      <div className="rounded-2xl bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.06] shadow-[0_2px_12px_rgba(15,105,176,0.06)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <ProductFilter
              query={query}
              onQueryChange={setQuery}
              filters={filters}
              onFilterChange={updateFilter}
              onResetFilters={() => { resetFilters(); setQuery(""); }}
              hasActiveFilters={hasActiveFilters}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultCount={sorted.length}
            />
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
            <LoadingSpinner size="lg" text="Loading products..." className="py-16" />
          ) : sorted.length === 0 ? (
            <EmptyState
              icon={Package}
              title={`No ${status} products`}
              description={hasActiveFilters ? "Try adjusting your filters" : `There are no ${status} products yet`}
              action={
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  {hasActiveFilters && (
                    <button onClick={() => { resetFilters(); setQuery(""); }} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/[0.08] text-sm font-bold text-muted-foreground hover:bg-gray-50 dark:hover:bg-white/[0.04] cursor-pointer">
                      Clear Filters
                    </button>
                  )}
                  <button onClick={() => router.push("/products")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #0F69B0 0%, #0c5a9e 100%)" }}>
                    View All Products
                  </button>
                </div>
              }
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedData.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteOpen} onApprove={handleApprove} onReject={handleReject} />
                ))}
              </div>
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
              </div>
            </>
          ) : (
            <>
              <ProductTable products={paginatedData} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteOpen} onApprove={handleApprove} onReject={handleReject} onToggleFeatured={handleToggleFeatured} />
              <div className="mt-4 border-t border-gray-50 dark:border-white/[0.04] pt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={goToPage} from={from} to={to} total={total} />
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
        description={deleteDialog.product ? `Delete "${deleteDialog.product.name}"? This cannot be undone.` : "Are you sure?"}
        confirmLabel="Delete"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}