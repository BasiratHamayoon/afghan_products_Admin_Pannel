import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  subCategories: [],
  selectedCategory: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    featured: "all",
    level: "all",
    parentId: null,
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setCategories: (state, action) => { state.categories = action.payload; },
    setSubCategories: (state, action) => { state.subCategories = action.payload; },
    addCategory: (state, action) => { state.categories.unshift(action.payload); },
    updateCategory: (state, action) => {
      const i = state.categories.findIndex((c) => c.id === action.payload.id);
      if (i !== -1) state.categories[i] = action.payload;
    },
    deleteCategory: (state, action) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    },
    setSelectedCategory: (state, action) => { state.selectedCategory = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading,
  setCategories,
  setSubCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  setSelectedCategory,
  setFilters,
  setPagination,
  setError,
  clearError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;