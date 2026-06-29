import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  investments: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const investmentsSlice = createSlice({
  name: "investments",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setInvestments: (state, action) => {
      state.investments = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateInvestmentInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.investments.findIndex((i) => i.id === updated.id);
      if (idx !== -1) {
        state.investments[idx] = { ...state.investments[idx], ...updated };
      }
    },
    removeInvestmentFromList: (state, action) => {
      state.investments = state.investments.filter((i) => i.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
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
  setInvestments,
  setPaginationMeta,
  updateInvestmentInList,
  removeInvestmentFromList,
  setError,
  clearError,
} = investmentsSlice.actions;

export default investmentsSlice.reducer;