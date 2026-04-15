import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  verifications: [],
  selectedVerification: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    type: "all",
    priority: "all",
  },
  pagination: { page: 1, limit: 10, total: 0 },
};

const verificationsSlice = createSlice({
  name: "verifications",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setVerifications: (state, action) => { state.verifications = action.payload; },
    updateVerification: (state, action) => {
      const i = state.verifications.findIndex((v) => v.id === action.payload.id);
      if (i !== -1) state.verifications[i] = action.payload;
      if (state.selectedVerification?.id === action.payload.id) {
        state.selectedVerification = action.payload;
      }
    },
    deleteVerification: (state, action) => {
      state.verifications = state.verifications.filter((v) => v.id !== action.payload);
    },
    setSelectedVerification: (state, action) => { state.selectedVerification = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setVerifications, updateVerification,
  deleteVerification, setSelectedVerification,
  setFilters, setPagination, setError, clearError,
} = verificationsSlice.actions;
export default verificationsSlice.reducer;