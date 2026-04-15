import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    category: "all",
    featured: "all",
    stock: "all",
  },
  pagination: { page: 1, limit: 10, total: 0 },
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setProducts: (state, action) => { state.products = action.payload; },
    addProduct: (state, action) => { state.products.unshift(action.payload); },
    updateProduct: (state, action) => {
      const i = state.products.findIndex((p) => p.id === action.payload.id);
      if (i !== -1) state.products[i] = action.payload;
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setSelectedProduct: (state, action) => { state.selectedProduct = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setProducts, addProduct, updateProduct,
  deleteProduct, setSelectedProduct, setFilters,
  setPagination, setError, clearError,
} = productsSlice.actions;
export default productsSlice.reducer;