import axiosInstance from "@/lib/axiosInstance";
import {
  setLoading,
  setStatsLoading,
  setCategories,
  setStats,
  setPaginationMeta,
  addCategory,
  updateCategoryInList,
  archiveCategoryInList,
  unarchiveCategoryInList,
  removeCategoryFromList,
  setError,
} from "@/store/slices/categoriesSlice";
import { loadCategoryOptions } from "@/store/actions/selectActions";

const normalizeCategory = (item) => {
  if (!item) return null;

  const rawName = item.name;
  const rawDescription = item.description;

  let nameMultilingual = { en: "", fa: "", ps: "" };
  if (rawName && typeof rawName === "object" && !Array.isArray(rawName)) {
    nameMultilingual = {
      en: typeof rawName.en === "string" ? rawName.en.trim() : "",
      fa: typeof rawName.fa === "string" ? rawName.fa.trim() : "",
      ps: typeof rawName.ps === "string" ? rawName.ps.trim() : "",
    };
  } else if (typeof rawName === "string" && rawName.trim() !== "") {
    nameMultilingual = { en: rawName.trim(), fa: "", ps: "" };
  }

  let descriptionMultilingual = { en: "", fa: "", ps: "" };
  if (rawDescription && typeof rawDescription === "object" && !Array.isArray(rawDescription)) {
    descriptionMultilingual = {
      en: typeof rawDescription.en === "string" ? rawDescription.en.trim() : "",
      fa: typeof rawDescription.fa === "string" ? rawDescription.fa.trim() : "",
      ps: typeof rawDescription.ps === "string" ? rawDescription.ps.trim() : "",
    };
  } else if (typeof rawDescription === "string" && rawDescription.trim() !== "") {
    descriptionMultilingual = { en: rawDescription.trim(), fa: "", ps: "" };
  }

  const flatName =
    nameMultilingual.en ||
    nameMultilingual.fa ||
    nameMultilingual.ps ||
    "";

  const flatDescription =
    descriptionMultilingual.en ||
    descriptionMultilingual.fa ||
    descriptionMultilingual.ps ||
    "";

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
    subCategoryCount: item.subCategoryCount ?? 0,
    productCount: item.productCount ?? 0,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  };
};

let _listFetchInProgress = false;
let _statsFetchInProgress = false;
let _statsFetchDone = false;
const _byIdCache = {};

export const fetchCategories = (params = {}) => async (dispatch) => {
  if (_listFetchInProgress) return;
  _listFetchInProgress = true;
  dispatch(setLoading(true));
  try {
    const { page = 1, limit = 10, search = "", isArchived } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (isArchived !== undefined) query.set("isArchived", String(isArchived));

    const res = await axiosInstance.get(`/categories?${query.toString()}`);
    const data = res.data;
    const raw = data.categories || data.data || [];
    const normalized = Array.isArray(raw)
      ? raw.map(normalizeCategory).filter(Boolean)
      : [];

    dispatch(setCategories(normalized));
    dispatch(
      setPaginationMeta({
        page: data.pagination?.page || data.page || data.currentPage || page,
        limit: data.pagination?.limit || data.limit || limit,
        total: data.pagination?.total || data.total || data.totalCount || normalized.length,
        totalPages: data.pagination?.totalPages || data.totalPages || 1,
      })
    );
    return { success: true };
  } catch (err) {
    dispatch(
      setError(err.response?.data?.message || err.message || "Failed to fetch categories")
    );
    return { success: false };
  } finally {
    dispatch(setLoading(false));
    _listFetchInProgress = false;
  }
};

export const fetchCategoryStats = () => async (dispatch) => {
  if (_statsFetchInProgress || _statsFetchDone) return;
  _statsFetchInProgress = true;
  dispatch(setStatsLoading(true));
  try {
    const res = await axiosInstance.get("/categories/stats");
    const data = res.data?.data || res.data?.stats || res.data;
    dispatch(setStats(data));
    _statsFetchDone = true;
    return { success: true, data };
  } catch (err) {
    _statsFetchDone = false;
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  } finally {
    dispatch(setStatsLoading(false));
    _statsFetchInProgress = false;
  }
};

export const fetchCategoryById = (id) => async () => {
  if (!id) return { success: false };
  if (_byIdCache[id] && _byIdCache[id] !== "loading") {
    return { success: true, data: _byIdCache[id] };
  }
  if (_byIdCache[id] === "loading") {
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (_byIdCache[id] && _byIdCache[id] !== "loading") {
          clearInterval(interval);
          resolve({ success: true, data: _byIdCache[id] });
        }
        if (attempts > 50) {
          clearInterval(interval);
          resolve({ success: false });
        }
      }, 100);
    });
  }
  _byIdCache[id] = "loading";
  try {
    const res = await axiosInstance.get(`/categories/${id}`);
    const raw = res.data?.data || res.data?.category || res.data;
    const normalized = normalizeCategory(raw);
    _byIdCache[id] = normalized;
    return { success: true, data: normalized };
  } catch (err) {
    delete _byIdCache[id];
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  }
};

export const clearCategoryByIdCache = (id) => {
  if (id && _byIdCache[id]) delete _byIdCache[id];
};

export const createCategory = (formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/categories", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.data || res.data?.category || res.data;
    const normalized = normalizeCategory(raw);
    if (normalized) dispatch(addCategory(normalized));
    dispatch(loadCategoryOptions(true));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create",
    };
  }
};

export const editCategory = (id, formData) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/categories/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const raw = res.data?.data || res.data?.category || res.data;
    const normalized = normalizeCategory(raw);
    if (normalized) dispatch(updateCategoryInList(normalized));
    clearCategoryByIdCache(id);
    dispatch(loadCategoryOptions(true));
    return { success: true, data: normalized };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update",
    };
  }
};

export const archiveCategoryAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/categories/${id}/archive`);
    dispatch(archiveCategoryInList(id));
    clearCategoryByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to archive",
    };
  }
};

export const unarchiveCategoryAction = (id) => async (dispatch) => {
  try {
    await axiosInstance.patch(`/categories/${id}/unarchive`);
    dispatch(unarchiveCategoryInList(id));
    clearCategoryByIdCache(id);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to unarchive",
    };
  }
};

export const deleteCategoryAction = (id, slug) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/categories/${slug}/delete`);
    dispatch(removeCategoryFromList(id));
    clearCategoryByIdCache(id);
    dispatch(loadCategoryOptions(true));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete",
    };
  }
};