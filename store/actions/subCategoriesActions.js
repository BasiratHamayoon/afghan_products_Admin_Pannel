import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setStatsLoading,
  setSubCategories,
  setStats,
  setPaginationMeta,
  addSubCategory,
  updateSubCategoryInList,
  removeSubCategoryFromList,
  archiveSubCategoryInList,
  unarchiveSubCategoryInList,
  updateStatsOnArchive,
  updateStatsOnUnarchive,
  updateStatsOnDelete,
  updateStatsOnCreate,
  setSelectedSubCategory,
  setError,
} from "@/store/slices/subCategoriesSlice";

const normalizeItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id || item.id,
    slug: item.slug || "",
    categoryName: item.category?.name || item.categoryName || "",
    categoryId: item.category?._id || item.category?.id || item.categoryId || "",
  };
};

export const fetchSubCategories = (params = {}) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", isArchived, categoryId } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (isArchived !== undefined) query.set("isArchived", String(isArchived));
    if (categoryId) query.set("categoryId", categoryId);

    const res = await axiosInstance.get(`/sub_categories?${query.toString()}`);
    const data = res.data;
    const raw = data.subCategories || data.data || [];
    const normalized = Array.isArray(raw) ? raw.map(normalizeItem).filter(Boolean) : [];

    dispatch(setSubCategories(normalized));
    dispatch(setPaginationMeta({
      page: data.page || data.currentPage || page,
      limit: data.limit || limit,
      total: data.total || data.totalCount || normalized.length,
      totalPages: data.totalPages || 1,
    }));
    return { success: true };
  } catch (err) {
    dispatch(setError(err.response?.data?.message || err.message || "Failed to fetch subcategories"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchSubCategoryStats = () => async (dispatch) => {
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/sub_categories/stats");
    const data = res.data?.stats || res.data?.data || res.data;
    dispatch(setStats(data));
    return { success: true, data };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  } finally {
    dispatch(setStatsLoading(false));
  }
};

export const fetchSubCategoryBySlug = (slug) => async (dispatch) => {
  if (!slug) return { success: false };
  try {
    const res = await axiosInstance.get(`/sub_categories/${slug}`);
    const raw = res.data?.subCategory || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    dispatch(setSelectedSubCategory(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const fetchSubCategoryById = (id) => async (dispatch, getState) => {
  if (!id) return { success: false };
  const existing = getState().subCategories.subCategories.find((s) => s.id === id);
  if (existing?.slug) {
    return dispatch(fetchSubCategoryBySlug(existing.slug));
  }
  try {
    const res = await axiosInstance.get(`/sub_categories/${id}`);
    const raw = res.data?.subCategory || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    dispatch(setSelectedSubCategory(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message };
  }
};

export const createSubCategory = (formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/sub_categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.subCategory || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    dispatch(addSubCategory(normalized));
    dispatch(updateStatsOnCreate());
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to create" };
  }
};

export const editSubCategory = (id, formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/sub_categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.subCategory || res.data?.data || res.data;
    const normalized = normalizeItem(raw);
    dispatch(updateSubCategoryInList(normalized));
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to update" };
  }
};

export const archiveSubCategoryAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/sub_categories/${id}/archive`);
    dispatch(archiveSubCategoryInList(id));
    dispatch(updateStatsOnArchive());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to archive" };
  }
};

export const unarchiveSubCategoryAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/sub_categories/${id}/unarchive`);
    dispatch(unarchiveSubCategoryInList(id));
    dispatch(updateStatsOnUnarchive());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to unarchive" };
  }
};

export const deleteSubCategoryAction = (id, slug) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/sub_categories/${slug}/delete`);
    dispatch(removeSubCategoryFromList(id));
    dispatch(updateStatsOnDelete());
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete" };
  }
};