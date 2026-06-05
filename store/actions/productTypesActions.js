import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setStatsLoading,
  setProductTypes,
  setStats,
  setPaginationMeta,
  addProductType,
  updateProductTypeInList,
  archiveProductTypeInList,
  unarchiveProductTypeInList,
  removeProductTypeFromList,
  updateStatsOnArchive,
  updateStatsOnUnarchive,
  updateStatsOnDelete,
  updateStatsOnCreate,
  setSelectedProductType,
  setError,
} from "@/store/slices/productTypesSlice";

const normalizeItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id || item.id,
    slug: item.slug || "",
    categoryName: item.category?.name || item.categoryName || "",
    categoryId: item.category?._id || item.category?.id || item.categoryId || "",
    subCategoryName: item.subCategory?.name || item.subCategoryName || "",
    subCategoryId: item.subCategory?._id || item.subCategory?.id || item.subCategoryId || "",
  };
};

export const fetchProductTypes = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", isArchived, categoryId, subCategoryId } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (isArchived !== undefined) query.set("isArchived", String(isArchived));
    if (categoryId) query.set("categoryId", categoryId);
    if (subCategoryId) query.set("subCategoryId", subCategoryId);

    const res = await axiosInstance.get(`/product_types?${query.toString()}`);
    const data = res.data;
    const raw = data.productTypes || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeItem).filter(Boolean) : [];

    dispatch(setProductTypes(normalized));
    dispatch(setPaginationMeta({
      page: data.page || data.currentPage || page,
      limit: data.limit || limit,
      total: data.total || data.totalCount || normalized.length,
      totalPages: data.totalPages || 1,
    }));
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch product types"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchProductTypeStats = () => async (dispatch) => {
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/product_types/stats");
    const data = res.data?.stats || res.data?.data || res.data;
    dispatch(setStats(data));
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setStatsLoading(false));
  }
};

export const fetchProductTypeBySlug = (slug) => async (dispatch) => {
  if (!slug) return { success: false };
  try {
    const res = await axiosInstance.get(`/product_types/${slug}`);
    const raw = res.data?.productType || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    dispatch(setSelectedProductType(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const fetchProductTypeById = (id) => async (dispatch, getState) => {
  if (!id) return { success: false };
  const existing = getState().productTypes.productTypes.find((p) => p.id === id);
  if (existing?.slug) {
    return dispatch(fetchProductTypeBySlug(existing.slug));
  }
  try {
    const res = await axiosInstance.get(`/product_types/${id}`);
    const raw = res.data?.productType || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    dispatch(setSelectedProductType(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const createProductType = (formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/product_types", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.productType || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    if (normalized) {
      dispatch(addProductType(normalized));
      dispatch(updateStatsOnCreate());
    }
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to create" };
  }
};

export const editProductType = (id, formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/product_types/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.productType || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    if (normalized) dispatch(updateProductTypeInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to update" };
  }
};

export const archiveProductTypeAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/product_types/${id}/archive`);
    dispatch(archiveProductTypeInList(id));
    dispatch(updateStatsOnArchive());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to archive" };
  }
};

export const unarchiveProductTypeAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/product_types/${id}/unarchive`);
    dispatch(unarchiveProductTypeInList(id));
    dispatch(updateStatsOnUnarchive());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to unarchive" };
  }
};

export const deleteProductTypeAction = (id, slug) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/product_types/${slug}/delete`);
    dispatch(removeProductTypeFromList(id));
    dispatch(updateStatsOnDelete());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete" };
  }
};