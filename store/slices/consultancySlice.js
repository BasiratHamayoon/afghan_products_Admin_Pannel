import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  consultants: [],
  sessions: [],
  isLoading: false,
  isSessionsLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const consultancySlice = createSlice({
  name: "consultancy",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSessionsLoading: (state, action) => {
      state.isSessionsLoading = action.payload;
    },
    setConsultants: (state, action) => {
      state.consultants = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addConsultant: (state, action) => {
      if (action.payload) {
        state.consultants.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateConsultantInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.consultants.findIndex((c) => c.id === updated.id);
      if (idx !== -1) {
        state.consultants[idx] = { ...state.consultants[idx], ...updated };
      }
    },
    removeConsultantFromList: (state, action) => {
      state.consultants = state.consultants.filter(
        (c) => c.id !== action.payload
      );
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    updateSessionInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.sessions.findIndex((s) => s.id === updated.id);
      if (idx !== -1) {
        state.sessions[idx] = { ...state.sessions[idx], ...updated };
      }
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
  setSessionsLoading,
  setConsultants,
  setPaginationMeta,
  addConsultant,
  updateConsultantInList,
  removeConsultantFromList,
  setSessions,
  updateSessionInList,
  setError,
  clearError,
} = consultancySlice.actions;

export default consultancySlice.reducer;