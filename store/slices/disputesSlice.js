"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { disputes: [], selectedDispute: null, stats: { open: 0, resolved: 0, escalated: 0 }, isLoading: false, error: null };

const disputesSlice = createSlice({
  name: "disputes",
  initialState,
  reducers: {
    setDisputes: (state, action) => { state.disputes = action.payload; },
    setSelectedDispute: (state, action) => { state.selectedDispute = action.payload; },
    setStats: (state, action) => { state.stats = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setDisputes, setSelectedDispute, setStats, setLoading, setError } = disputesSlice.actions;
export default disputesSlice.reducer;