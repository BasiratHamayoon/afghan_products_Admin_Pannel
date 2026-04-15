import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  consultants: [],
  sessions: [],
  requests: [],
  selectedConsultant: null,
  selectedSession: null,
  selectedRequest: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    availability: "all",
    category: "all",
    featured: "all",
    priority: "all",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const consultingSlice = createSlice({
  name: "consulting",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setConsultants: (state, action) => { state.consultants = action.payload; },
    setSessions: (state, action) => { state.sessions = action.payload; },
    setRequests: (state, action) => { state.requests = action.payload; },
    addConsultant: (state, action) => { state.consultants.unshift(action.payload); },
    updateConsultant: (state, action) => {
      const i = state.consultants.findIndex((c) => c.id === action.payload.id);
      if (i !== -1) state.consultants[i] = action.payload;
    },
    deleteConsultant: (state, action) => {
      state.consultants = state.consultants.filter((c) => c.id !== action.payload);
    },
    updateSession: (state, action) => {
      const i = state.sessions.findIndex((s) => s.id === action.payload.id);
      if (i !== -1) state.sessions[i] = action.payload;
    },
    deleteSession: (state, action) => {
      state.sessions = state.sessions.filter((s) => s.id !== action.payload);
    },
    updateRequest: (state, action) => {
      const i = state.requests.findIndex((r) => r.id === action.payload.id);
      if (i !== -1) state.requests[i] = action.payload;
    },
    deleteRequest: (state, action) => {
      state.requests = state.requests.filter((r) => r.id !== action.payload);
    },
    setSelectedConsultant: (state, action) => { state.selectedConsultant = action.payload; },
    setSelectedSession: (state, action) => { state.selectedSession = action.payload; },
    setSelectedRequest: (state, action) => { state.selectedRequest = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading,
  setConsultants,
  setSessions,
  setRequests,
  addConsultant,
  updateConsultant,
  deleteConsultant,
  updateSession,
  deleteSession,
  updateRequest,
  deleteRequest,
  setSelectedConsultant,
  setSelectedSession,
  setSelectedRequest,
  setFilters,
  setPagination,
  setError,
  clearError,
} = consultingSlice.actions;

export default consultingSlice.reducer;