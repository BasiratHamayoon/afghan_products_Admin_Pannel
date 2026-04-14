"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { products: [], selectedProduct: null, totalCount: 0, isLoading: false, error: null, filters: { search: "", category: "", status: "" } };

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => { state.products = action.payload; },
    setSelectedProduct: (state, action) => { state.selectedProduct = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
  },
});

export const { setProducts, setSelectedProduct, setLoading, setError, setFilters } = productsSlice.actions;
export default productsSlice.reducer;