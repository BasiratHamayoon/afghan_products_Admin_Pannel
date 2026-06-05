import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  subCategories: [],
  selectedSubCategory: null,
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

const subCategoriesSlice = createSlice({
  name: "subCategories",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStatsLoading: (state, action) => {
      state.isStatsLoading = action.payload;
    },
    setSubCategories: (state, action) => {
      state.subCategories = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addSubCategory: (state, action) => {
      if (action.payload) {
        state.subCategories.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateSubCategoryInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const index = state.subCategories.findIndex(
        (s) => s.id === updated.id
      );
      if (index !== -1) {
        state.subCategories[index] = {
          ...state.subCategories[index],
          ...updated,
        };
      }
      if (state.selectedSubCategory?.id === updated.id) {
        state.selectedSubCategory = {
          ...state.selectedSubCategory,
          ...updated,
        };
      }
    },
    removeSubCategoryFromList: (state, action) => {
      state.subCategories = state.subCategories.filter(
        (s) => s.id !== action.payload
      );
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    archiveSubCategoryInList: (state, action) => {
      const index = state.subCategories.findIndex(
        (s) => s.id === action.payload
      );
      if (index !== -1) {
        state.subCategories[index] = {
          ...state.subCategories[index],
          isArchived: true,
        };
      }
    },
    unarchiveSubCategoryInList: (state, action) => {
      const index = state.subCategories.findIndex(
        (s) => s.id === action.payload
      );
      if (index !== -1) {
        state.subCategories[index] = {
          ...state.subCategories[index],
          isArchived: false,
        };
      }
    },
    updateStatsOnArchive: (state) => {
      if (state.stats) {
        state.stats.active = Math.max(0, (state.stats.active || 0) - 1);
        state.stats.archived = (state.stats.archived || 0) + 1;
      }
    },
    updateStatsOnUnarchive: (state) => {
      if (state.stats) {
        state.stats.active = (state.stats.active || 0) + 1;
        state.stats.archived = Math.max(0, (state.stats.archived || 0) - 1);
      }
    },
    updateStatsOnDelete: (state) => {
      if (state.stats) {
        state.stats.total = Math.max(0, (state.stats.total || 0) - 1);
        state.stats.active = Math.max(0, (state.stats.active || 0) - 1);
      }
    },
    updateStatsOnCreate: (state) => {
      if (state.stats) {
        state.stats.total = (state.stats.total || 0) + 1;
        state.stats.active = (state.stats.active || 0) + 1;
      }
    },
    setSelectedSubCategory: (state, action) => {
      state.selectedSubCategory = action.payload;
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
  clearError,
} = subCategoriesSlice.actions;

export default subCategoriesSlice.reducer;