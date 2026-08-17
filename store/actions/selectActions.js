import axiosInstance from "@/lib/axiosInstance";
import {
  setCategoryOptions,
  setCategoryOptionsLoading,
  setSubCategoryOptions,
  setSubCategoryOptionsLoading,
  setSubCategoryOptionsForId,
  setProductTypeOptions,
  setProductTypeOptionsLoading,
  setProductTypeOptionsForId,
} from "@/store/slices/selectSlice";

const resolveMultilingualName = (raw) => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw.en || raw.fa || raw.ps || "";
  }
  return "";
};

const normalizeSelectItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    id: item._id || item.id,
    name: resolveMultilingualName(item.name),
  };
};

const extractArray = (data, keys = []) => {
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
};

let _categoryFetchInProgress = false;

export const loadCategoryOptions = (forceRefresh = false) => async (dispatch, getState) => {
  const existing = getState().select.categoryOptions;
  if (!forceRefresh && existing && existing.length > 0) return existing;
  if (_categoryFetchInProgress) return;

  _categoryFetchInProgress = true;
  dispatch(setCategoryOptionsLoading(true));
  try {
    const res = await axiosInstance.get("/categories?limit=200&page=1");
    const raw = extractArray(res.data, ["categories", "data"]);
    const normalized = raw.map(normalizeSelectItem).filter(Boolean);
    dispatch(setCategoryOptions(normalized));
    return normalized;
  } catch {
    try {
      const res2 = await axiosInstance.get("/select/categories");
      const raw2 = extractArray(res2.data, ["categories", "data"]);
      const normalized2 = raw2.map(normalizeSelectItem).filter(Boolean);
      dispatch(setCategoryOptions(normalized2));
      return normalized2;
    } catch {
      return [];
    }
  } finally {
    _categoryFetchInProgress = false;
    dispatch(setCategoryOptionsLoading(false));
  }
};

export const loadSubCategoryOptions = (categoryId) => async (dispatch, getState) => {
  if (!categoryId) return [];
  const state = getState().select;
  if (
    state.subCategoryOptionsForId === categoryId &&
    state.subCategoryOptions.length > 0 &&
    !state.subCategoryOptionsLoading
  ) {
    return state.subCategoryOptions;
  }

  dispatch(setSubCategoryOptionsLoading(true));
  dispatch(setSubCategoryOptions([]));
  dispatch(setSubCategoryOptionsForId(null));
  try {
    const res = await axiosInstance.get(
      `/sub_categories?categoryId=${categoryId}&limit=100&page=1`
    );
    const raw = extractArray(res.data, ["subCategories", "subcategories", "data"]);
    const normalized = raw.map(normalizeSelectItem).filter(Boolean);
    dispatch(setSubCategoryOptions(normalized));
    dispatch(setSubCategoryOptionsForId(categoryId));
    return normalized;
  } catch {
    dispatch(setSubCategoryOptions([]));
    dispatch(setSubCategoryOptionsForId(null));
    return [];
  } finally {
    dispatch(setSubCategoryOptionsLoading(false));
  }
};

export const loadProductTypeOptions = (subCategoryId) => async (dispatch, getState) => {
  if (!subCategoryId) return [];
  const state = getState().select;
  if (
    state.productTypeOptionsForId === subCategoryId &&
    state.productTypeOptions.length > 0 &&
    !state.productTypeOptionsLoading
  ) {
    return state.productTypeOptions;
  }

  dispatch(setProductTypeOptionsLoading(true));
  dispatch(setProductTypeOptions([]));
  try {
    const res = await axiosInstance.get(
      `/product_types?subCategoryId=${subCategoryId}&limit=100&page=1`
    );
    const raw = extractArray(res.data, ["productTypes", "data"]);
    const normalized = raw.map(normalizeSelectItem).filter(Boolean);
    dispatch(setProductTypeOptions(normalized));
    dispatch(setProductTypeOptionsForId(subCategoryId));
    return normalized;
  } catch {
    dispatch(setProductTypeOptions([]));
    dispatch(setProductTypeOptionsForId(null));
    return [];
  } finally {
    dispatch(setProductTypeOptionsLoading(false));
  }
};

export const fetchCategorySelectList = async () => {
  try {
    const res = await axiosInstance.get("/categories?limit=200&page=1");
    const raw = extractArray(res.data, ["categories", "data"]);
    return raw.map(normalizeSelectItem).filter(Boolean);
  } catch {
    return [];
  }
};

export const fetchSubCategorySelectList = async (categoryId) => {
  try {
    const url = categoryId
      ? `/sub_categories?categoryId=${categoryId}&limit=100&page=1`
      : "/sub_categories?limit=100&page=1";
    const res = await axiosInstance.get(url);
    const raw = extractArray(res.data, ["subCategories", "data"]);
    return raw.map(normalizeSelectItem).filter(Boolean);
  } catch {
    return [];
  }
};

export const fetchProductTypeSelectList = async (subCategoryId) => {
  try {
    const url = subCategoryId
      ? `/product_types?subCategoryId=${subCategoryId}&limit=100&page=1`
      : "/product_types?limit=100&page=1";
    const res = await axiosInstance.get(url);
    const raw = extractArray(res.data, ["productTypes", "data"]);
    return raw.map(normalizeSelectItem).filter(Boolean);
  } catch {
    return [];
  }
};

export const fetchEmailTemplateSelectList = async () => {
  try {
    const res = await axiosInstance.get("/select/email_templates");
    const raw = extractArray(res.data, ["emailTemplates", "data"]);
    return raw.map(normalizeSelectItem).filter(Boolean);
  } catch {
    return [];
  }
};

export const fetchProductSelectList = async () => {
  try {
    const res = await axiosInstance.get("/select/products");
    const raw = extractArray(res.data, ["products", "data"]);
    return raw.map(normalizeSelectItem).filter(Boolean);
  } catch {
    return [];
  }
};