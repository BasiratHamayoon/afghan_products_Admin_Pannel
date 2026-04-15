// store/slices/investmentsSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  investments: [],
  selectedInvestment: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    type: "all",
    riskLevel: "all",
    priority: "all",
    featured: "all",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const investmentsSlice = createSlice({
  name: "investments",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setInvestments: (state, action) => { state.investments = action.payload; },
    addInvestment: (state, action) => { state.investments.unshift(action.payload); },
    updateInvestment: (state, action) => {
      const i = state.investments.findIndex((inv) => inv.id === action.payload.id);
      if (i !== -1) state.investments[i] = action.payload;
    },
    deleteInvestment: (state, action) => {
      state.investments = state.investments.filter((inv) => inv.id !== action.payload);
    },
    setSelectedInvestment: (state, action) => { state.selectedInvestment = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading,
  setInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  setSelectedInvestment,
  setFilters,
  setPagination,
  setError,
  clearError,
} = investmentsSlice.actions;

export default investmentsSlice.reducer;