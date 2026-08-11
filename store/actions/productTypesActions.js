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

const normalizeMultilingual = (raw) => {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return {
      en: typeof raw.en === "string" ? raw.en.trim() : "",
      fa: typeof raw.fa === "string" ? raw.fa.trim() : "",
      ps: typeof raw.ps === "string" ? raw.ps.trim() : "",
    };
  }
  if (typeof raw === "string" && raw.trim() !== "") {
    return { en: raw.trim(), fa: "", ps: "" };
  }
  return { en: "", fa: "", ps: "" };
};

const getFlatValue = (multiObj) =>
  multiObj.en || multiObj.fa || multiObj.ps || "";

const resolveRelationName = (raw) => {
  if (!raw) return "";
  const nameRaw = raw.name;
  if (!nameRaw) return "";
  if (typeof nameRaw === "object" && !Array.isArray(nameRaw)) {
    return nameRaw.en || nameRaw.fa || nameRaw.ps || "";
  }
  return typeof nameRaw === "string" ? nameRaw : "";
};

const normalizeItem = (item) => {
  if (!item) return null;

  const nameMultilingual = normalizeMultilingual(item.name);
  const descriptionMultilingual = normalizeMultilingual(item.description);

  const flatName = getFlatValue(nameMultilingual);
  const flatDescription = getFlatValue(descriptionMultilingual);

  return {
    ...item,
    id: item._id || item.id,
    nameMultilingual,
    descriptionMultilingual,
    name: flatName,
    description: flatDescription,
    slug: item.slug || "",
    image: item.image || null,
    sortOrder: item.sortOrder ?? 0,
    isArchived: item.isArchived ?? false,
    categoryId: item.category?._id || item.category?.id || item.categoryId || "",
    categoryName: resolveRelationName(item.category) || item.categoryName || "",
    subCategoryId: item.subCategory?._id || item.subCategory?.id || item.subCategoryId || "",
    subCategoryName: resolveRelationName(item.subCategory) || item.subCategoryName || "",
    productCount: item.productCount ?? 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
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
      page: data.pagination?.page || data.page || data.currentPage || page,
      limit: data.pagination?.limit || data.limit || limit,
      total: data.pagination?.total || data.total || data.totalCount || normalized.length,
      totalPages: data.pagination?.totalPages || data.totalPages || 1,
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