"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { tradeLeads: [], selectedTradeLead: null, isLoading: false, error: null };

const tradeLeadsSlice = createSlice({
  name: "tradeLeads",
  initialState,
  reducers: {
    setTradeLeads: (state, action) => { state.tradeLeads = action.payload; },
    setSelectedTradeLead: (state, action) => { state.selectedTradeLead = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setTradeLeads, setSelectedTradeLead, setLoading, setError } = tradeLeadsSlice.actions;
export default tradeLeadsSlice.reducer;