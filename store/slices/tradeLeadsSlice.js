import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tradeLeads: [],
  selectedLead: null,
  isLoading: false,
  error: null,
  filters: { search: "", status: "all", type: "all", category: "all" },
  pagination: { page: 1, limit: 10, total: 0 },
};

const tradeLeadsSlice = createSlice({
  name: "tradeLeads",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setTradeLeads: (state, action) => { state.tradeLeads = action.payload; },
    addTradeLead: (state, action) => { state.tradeLeads.unshift(action.payload); },
    updateTradeLead: (state, action) => {
      const i = state.tradeLeads.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.tradeLeads[i] = action.payload;
      if (state.selectedLead?.id === action.payload.id) state.selectedLead = action.payload;
    },
    deleteTradeLead: (state, action) => {
      state.tradeLeads = state.tradeLeads.filter((t) => t.id !== action.payload);
    },
    setSelectedLead: (state, action) => { state.selectedLead = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setTradeLeads, addTradeLead, updateTradeLead,
  deleteTradeLead, setSelectedLead, setFilters,
  setPagination, setError, clearError,
} = tradeLeadsSlice.actions;
export default tradeLeadsSlice.reducer;