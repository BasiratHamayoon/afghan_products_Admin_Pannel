import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tradeLeads: [],
  selectedLead: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  unlockRequests: [],
  selectedUnlockRequest: null,
  unlockRequestsLoading: false,
  unlockPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const tradeLeadsSlice = createSlice({
  name: "tradeLeads",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDetailLoading: (state, action) => {
      state.isDetailLoading = action.payload;
    },
    setTradeLeads: (state, action) => {
      state.tradeLeads = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addTradeLead: (state, action) => {
      state.tradeLeads.unshift(action.payload);
      state.pagination.total += 1;
    },
    updateTradeLeadInList: (state, action) => {
      const payload = action.payload;
      const index = state.tradeLeads.findIndex((l) => l.id === payload.id);
      if (index !== -1) {
        state.tradeLeads[index] = { ...state.tradeLeads[index], ...payload };
      }
      if (state.selectedLead?.id === payload.id) {
        state.selectedLead = { ...state.selectedLead, ...payload };
      }
    },
    removeTradeLeadFromList: (state, action) => {
      const id = action.payload;
      state.tradeLeads = state.tradeLeads.filter((l) => l.id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.selectedLead?.id === id) {
        state.selectedLead = null;
      }
    },
    setSelectedLead: (state, action) => {
      state.selectedLead = action.payload;
    },
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setUnlockRequests: (state, action) => {
      state.unlockRequests = action.payload;
    },
    setUnlockRequestsLoading: (state, action) => {
      state.unlockRequestsLoading = action.payload;
    },
    setUnlockPaginationMeta: (state, action) => {
      state.unlockPagination = { ...state.unlockPagination, ...action.payload };
    },
    setSelectedUnlockRequest: (state, action) => {
      state.selectedUnlockRequest = action.payload;
    },
    updateUnlockRequestInList: (state, action) => {
      const payload = action.payload;
      const index = state.unlockRequests.findIndex((r) => r.id === payload.id);
      if (index !== -1) {
        state.unlockRequests[index] = { ...state.unlockRequests[index], ...payload };
      }
      if (state.selectedUnlockRequest?.id === payload.id) {
        state.selectedUnlockRequest = { ...state.selectedUnlockRequest, ...payload };
      }
    },
  },
});

export const {
  setLoading,
  setDetailLoading,
  setTradeLeads,
  setPaginationMeta,
  addTradeLead,
  updateTradeLeadInList,
  removeTradeLeadFromList,
  setSelectedLead,
  clearSelectedLead,
  setError,
  clearError,
  setUnlockRequests,
  setUnlockRequestsLoading,
  setUnlockPaginationMeta,
  setSelectedUnlockRequest,
  updateUnlockRequestInList,
} = tradeLeadsSlice.actions;

export default tradeLeadsSlice.reducer;