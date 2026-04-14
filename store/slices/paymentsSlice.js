"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { transactions: [], stats: { totalRevenue: 0, totalTransactions: 0 }, isLoading: false, error: null };

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setTransactions: (state, action) => { state.transactions = action.payload; },
    setStats: (state, action) => { state.stats = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setTransactions, setStats, setLoading, setError } = paymentsSlice.actions;
export default paymentsSlice.reducer;