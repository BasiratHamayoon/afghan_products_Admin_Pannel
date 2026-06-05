import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  selectedCategory: null,
  stats: null,
  isLoading: false,
  isStatsLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStatsLoading: (state, action) => {
      state.isStatsLoading = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addCategory: (state, action) => {
      if (action.payload) {
        state.categories.unshift(action.payload);
        state.pagination.total += 1;
        if (state.stats) {
          state.stats.total = (state.stats.total || 0) + 1;
          state.stats.active = (state.stats.active || 0) + 1;
        }
      }
    },
    updateCategoryInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const index = state.categories.findIndex(
        (c) => c.id === updated.id
      );
      if (index !== -1) {
        state.categories[index] = {
          ...state.categories[index],
          ...updated,
        };
      }
      if (state.selectedCategory?.id === updated.id) {
        state.selectedCategory = {
          ...state.selectedCategory,
          ...updated,
        };
      }
    },
    archiveCategoryInList: (state, action) => {
      const index = state.categories.findIndex(
        (c) => c.id === action.payload
      );
      if (index !== -1) {
        state.categories[index] = {
          ...state.categories[index],
          isArchived: true,
        };
      }
      if (state.stats) {
        state.stats.active = Math.max(0, (state.stats.active || 0) - 1);
        state.stats.archived = (state.stats.archived || 0) + 1;
      }
    },
    unarchiveCategoryInList: (state, action) => {
      const index = state.categories.findIndex(
        (c) => c.id === action.payload
      );
      if (index !== -1) {
        state.categories[index] = {
          ...state.categories[index],
          isArchived: false,
        };
      }
      if (state.stats) {
        state.stats.active = (state.stats.active || 0) + 1;
        state.stats.archived = Math.max(
          0,
          (state.stats.archived || 0) - 1
        );
      }
    },
    removeCategoryFromList: (state, action) => {
      state.categories = state.categories.filter(
        (c) => c.id !== action.payload
      );
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.stats) {
        state.stats.total = Math.max(0, (state.stats.total || 0) - 1);
        state.stats.active = Math.max(0, (state.stats.active || 0) - 1);
      }
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
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
  setSelectedCategory,
  setError,
  clearError,
} = categoriesSlice.actions;

export default categoriesSlice.reducer;