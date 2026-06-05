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

const normalizeSelectItem = (item) => {
  if (!item) return null;
  return { ...item, id: item._id || item.id };
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
    const res = await axiosInstance.get("/select/categories");
    const raw = extractArray(res.data, ["categories", "data"]);
    const normalized = raw.map(normalizeSelectItem).filter(Boolean);
    dispatch(setCategoryOptions(normalized));
    return normalized;
  } catch {
    return [];
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
  try {
    const res = await axiosInstance.get(`/select/categories/${categoryId}/sub_categories`);
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
    const res = await axiosInstance.get(`/select/sub_categories/${subCategoryId}/product_types`);
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
    const res = await axiosInstance.get("/select/categories");
    const raw = extractArray(res.data, ["categories", "data"]);
    return raw.map(normalizeSelectItem).filter(Boolean);
  } catch {
    return [];
  }
};

export const fetchSubCategorySelectList = async (categoryId) => {
  try {
    const url = categoryId
      ? `/select/categories/${categoryId}/sub_categories`
      : "/select/sub_categories";
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
      ? `/select/sub_categories/${subCategoryId}/product_types`
      : "/select/product_types";
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