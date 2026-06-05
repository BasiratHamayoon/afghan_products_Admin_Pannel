import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productTypes: [],
  selectedProductType: null,
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

const productTypesSlice = createSlice({
  name: "productTypes",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStatsLoading: (state, action) => {
      state.isStatsLoading = action.payload;
    },
    setProductTypes: (state, action) => {
      state.productTypes = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addProductType: (state, action) => {
      if (action.payload) {
        state.productTypes.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateProductTypeInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const index = state.productTypes.findIndex(
        (p) => p.id === updated.id
      );
      if (index !== -1) {
        state.productTypes[index] = {
          ...state.productTypes[index],
          ...updated,
        };
      }
      if (state.selectedProductType?.id === updated.id) {
        state.selectedProductType = {
          ...state.selectedProductType,
          ...updated,
        };
      }
    },
    archiveProductTypeInList: (state, action) => {
      const index = state.productTypes.findIndex(
        (p) => p.id === action.payload
      );
      if (index !== -1) {
        state.productTypes[index] = {
          ...state.productTypes[index],
          isArchived: true,
        };
      }
    },
    unarchiveProductTypeInList: (state, action) => {
      const index = state.productTypes.findIndex(
        (p) => p.id === action.payload
      );
      if (index !== -1) {
        state.productTypes[index] = {
          ...state.productTypes[index],
          isArchived: false,
        };
      }
    },
    removeProductTypeFromList: (state, action) => {
      state.productTypes = state.productTypes.filter(
        (p) => p.id !== action.payload
      );
      state.pagination.total = Math.max(0, state.pagination.total - 1);
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
    setSelectedProductType: (state, action) => {
      state.selectedProductType = action.payload;
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
  clearError,
} = productTypesSlice.actions;

export default productTypesSlice.reducer;