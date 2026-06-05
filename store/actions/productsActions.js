import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setStatsLoading,
  setProducts,
  setStats,
  setPaginationMeta,
  updateProductInList,
  archiveProductInList,
  unarchiveProductInList,
  toggleProductStatusInList,
  removeProduct,
  setSelectedProduct,
  setError,
} from "@/store/slices/productsSlice";

const normalizeProduct = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id || item.id,
    name: item.name || "",
    slug: item.slug || "",
    categoryId: item.categoryId?._id || item.categoryId?.id || item.categoryId,
    subCategoryId: item.subCategoryId?._id || item.subCategoryId?.id || item.subCategoryId,
    productTypeId: item.productTypeId?._id || item.productTypeId?.id || item.productTypeId,
    categoryName: item.categoryId?.name || item.categoryName || "",
    subCategoryName: item.subCategoryId?.name || item.subCategoryName || "",
    productTypeName: item.productTypeId?.name || item.productTypeName || "",
    sellerName: item.sellerId
      ? `${item.sellerId.firstName || ""} ${item.sellerId.lastName || ""}`.trim()
      : item.sellerName || "",
    sellerEmail: item.sellerId?.email || item.sellerEmail || "",
    isActive: item.isActive ?? true,
    isArchived: item.isArchived ?? false,
    stock: item.stock ?? 0,
    sellingPrice: item.sellingPrice ?? 0,
    images: item.images || [],
  };
};

let _listFetchInProgress = false;
let _statsFetchInProgress = false;
let _statsFetchDone = false;
const _bySlugCache = {};

export const fetchProducts = (params = {}) => async (dispatch) => {
  if (_listFetchInProgress) return;
  _listFetchInProgress = true;
  dispatch(setLoading(true));
  try {
    const {
      page = 1, limit = 10, search = "", isArchived, isActive,
      categoryId, subCategoryId, productTypeId, sortBy, sortOrder, stock,
    } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (isArchived !== undefined) query.set("isArchived", String(isArchived));
    if (isActive !== undefined) query.set("isActive", String(isActive));
    if (categoryId) query.set("categoryId", categoryId);
    if (subCategoryId) query.set("subCategoryId", subCategoryId);
    if (productTypeId) query.set("productTypeId", productTypeId);
    if (sortBy) query.set("sortBy", sortBy);
    if (sortOrder) query.set("sortOrder", sortOrder);
    if (stock) query.set("stock", stock);

    const res = await axiosInstance.get(`/products?${query.toString()}`);
    const data = res.data;
    const raw = data.products || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeProduct).filter(Boolean) : [];

    dispatch(setProducts(normalized));
    dispatch(setPaginationMeta({
      page: data.page || data.currentPage || page,
      limit: data.limit || limit,
      total: data.total || data.totalCount || normalized.length,
      totalPages: data.totalPages || 1,
    }));
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch products"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
    _listFetchInProgress = false;
  }
};

export const fetchProductStats = () => async (dispatch) => {
  if (_statsFetchInProgress || _statsFetchDone) return;
  _statsFetchInProgress = true;
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/products/stats");
    const data = res.data?.data || res.data?.stats || res.data;
    dispatch(setStats(data));
    _statsFetchDone = true;
    return { success: true, data };
  } catch (err) {
    _statsFetchDone = false;
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setStatsLoading(false));
    _statsFetchInProgress = false;
  }
};

export const fetchProductBySlug = (slug) => async (dispatch) => {
  if (!slug) return { success: false };

  if (_bySlugCache[slug] && _bySlugCache[slug] !== "loading") {
    dispatch(setSelectedProduct(_bySlugCache[slug]));
    return { success: true, data: _bySlugCache[slug] };
  }

  if (_bySlugCache[slug] === "loading") {
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (_bySlugCache[slug] && _bySlugCache[slug] !== "loading") {
          clearInterval(interval);
          dispatch(setSelectedProduct(_bySlugCache[slug]));
          resolve({ success: true, data: _bySlugCache[slug] });
        }
        if (attempts > 50) {
          clearInterval(interval);
          resolve({ success: false });
        }
      }, 100);
    });
  }

  _bySlugCache[slug] = "loading";
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get(`/products/slug/${slug}`);
    const raw = res.data?.product || res.data?.data?.product || res.data?.data || res.data;
    const normalized = normalizeProduct(raw);
    _bySlugCache[slug] = normalized;
    dispatch(setSelectedProduct(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    delete _bySlugCache[slug];
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch product"));
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchProductById = (id) => async (dispatch) => {
  if (!id) return { success: false };
  dispatch(setLoading(true));
  try {
    const res = await axiosInstance.get(`/products/${id}`);
    const raw = res.data?.product || res.data?.data?.product || res.data?.data || res.data;
    const normalized = normalizeProduct(raw);
    dispatch(setSelectedProduct(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch product"));
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setLoading(false));
  }
};

export const clearProductSlugCache = (slug) => {
  if (slug && _bySlugCache[slug]) delete _bySlugCache[slug];
};

export const createProduct = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.product || res.data?.data || res.data;
    const normalized = normalizeProduct(raw);
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create product",
    };
  }
};

export const editProduct = (id, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.product || res.data?.data || res.data;
    const normalized = normalizeProduct(raw);
    dispatch(updateProductInList(normalized));
    dispatch(setSelectedProduct(normalized));
    if (normalized?.slug) clearProductSlugCache(normalized.slug);
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update product",
    };
  }
};

export const toggleProductStatus = (id) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/products/${id}/toggle_status`);
    const raw = res.data?.data || res.data?.product || res.data;
    if (raw && (raw._id || raw.id)) {
      const normalized = normalizeProduct(raw);
      dispatch(updateProductInList(normalized));
      dispatch(setSelectedProduct(normalized));
      if (normalized?.slug) clearProductSlugCache(normalized.slug);
    } else {
      dispatch(toggleProductStatusInList(id));
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to toggle" };
  }
};

export const archiveProduct = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/products/${id}/archive`);
    dispatch(archiveProductInList(id));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to archive" };
  }
};

export const unarchiveProduct = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/products/${id}/unarchive`);
    dispatch(unarchiveProductInList(id));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to unarchive" };
  }
};

export const deleteProduct = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/products/${id}`);
    dispatch(removeProduct(id));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete" };
  }
};