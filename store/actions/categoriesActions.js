import {
  setLoading,
  setCategories,
  setSubCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  setSelectedCategory,
  setError,
} from "@/store/slices/categoriesSlice";
import { dummyCategories, dummySubCategories } from "@/data/dummyCategories";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchCategories = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(600);
    dispatch(setCategories(dummyCategories || []));
  } catch (err) {
    dispatch(setError("Failed to fetch categories"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchSubCategories = (parentId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(400);
    const all = dummySubCategories || [];
    const filtered = parentId
      ? all.filter((s) => s && s.parentId === parentId)
      : all;
    dispatch(setSubCategories(filtered));
  } catch (err) {
    dispatch(setError("Failed to fetch subcategories"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchCategoryById = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(400);
    if (!id) {
      dispatch(setSelectedCategory(null));
      return;
    }
    const all = [
      ...(dummyCategories || []),
      ...(dummySubCategories || []),
    ];
    const found = all.find((c) => c && c.id === id) || null;
    dispatch(setSelectedCategory(found));
  } catch (err) {
    dispatch(setError("Failed to fetch category"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createCategory = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(800);
    if (!data) throw new Error("No data provided");
    const newCat = {
      ...data,
      id: `cat-${Date.now()}`,
      productsCount: 0,
      subcategoriesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addCategory(newCat));
    return { success: true, data: newCat };
  } catch (err) {
    dispatch(setError("Failed to create category"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const editCategory = (id, data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(600);
    if (!id || !data) throw new Error("Invalid data");
    const updated = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    dispatch(updateCategory(updated));
    return { success: true, data: updated };
  } catch (err) {
    dispatch(setError("Failed to update category"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const removeCategory = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(500);
    if (!id) throw new Error("No ID provided");
    dispatch(deleteCategory(id));
    return { success: true };
  } catch (err) {
    dispatch(setError("Failed to delete category"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};