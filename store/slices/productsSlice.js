import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedProduct: null,
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

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStatsLoading: (state, action) => {
      state.isStatsLoading = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateProductInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const index = state.products.findIndex((p) => p.id === updated.id);
      if (index !== -1) {
        state.products[index] = { ...state.products[index], ...updated };
      }
      if (state.selectedProduct?.id === updated.id) {
        state.selectedProduct = { ...state.selectedProduct, ...updated };
      }
    },
    archiveProductInList: (state, action) => {
      const index = state.products.findIndex((p) => p.id === action.payload);
      if (index !== -1) state.products[index].isArchived = true;
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = { ...state.selectedProduct, isArchived: true };
      }
      if (state.stats) {
        state.stats.active = Math.max(0, (state.stats.active || 0) - 1);
        state.stats.archived = (state.stats.archived || 0) + 1;
      }
    },
    unarchiveProductInList: (state, action) => {
      const index = state.products.findIndex((p) => p.id === action.payload);
      if (index !== -1) state.products[index].isArchived = false;
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = { ...state.selectedProduct, isArchived: false };
      }
      if (state.stats) {
        state.stats.active = (state.stats.active || 0) + 1;
        state.stats.archived = Math.max(0, (state.stats.archived || 0) - 1);
      }
    },
    toggleProductStatusInList: (state, action) => {
      const index = state.products.findIndex((p) => p.id === action.payload);
      if (index !== -1) {
        state.products[index].isActive = !state.products[index].isActive;
      }
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = {
          ...state.selectedProduct,
          isActive: !state.selectedProduct.isActive,
        };
      }
    },
    removeProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.selectedProduct?.id === action.payload) {
        state.selectedProduct = null;
      }
      if (state.stats) {
        state.stats.total = Math.max(0, (state.stats.total || 0) - 1);
        state.stats.active = Math.max(0, (state.stats.active || 0) - 1);
      }
    },
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
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
  setProducts,
  setStats,
  setPaginationMeta,
  updateProductInList,
  archiveProductInList,
  unarchiveProductInList,
  toggleProductStatusInList,
  removeProduct,
  setSelectedProduct,
  setError,
  clearError,
} = productsSlice.actions;

export default productsSlice.reducer;