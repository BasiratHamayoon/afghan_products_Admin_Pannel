"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { verifications: [], selectedVerification: null, stats: { pending: 0, approved: 0, rejected: 0 }, isLoading: false, error: null };

const verificationsSlice = createSlice({
  name: "verifications",
  initialState,
  reducers: {
    setVerifications: (state, action) => { state.verifications = action.payload; },
    setSelectedVerification: (state, action) => { state.selectedVerification = action.payload; },
    setStats: (state, action) => { state.stats = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setVerifications, setSelectedVerification, setStats, setLoading, setError } = verificationsSlice.actions;
export default verificationsSlice.reducer;