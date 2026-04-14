"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { wallets: [], withdrawalRequests: [], isLoading: false, error: null };

const walletsSlice = createSlice({
  name: "wallets",
  initialState,
  reducers: {
    setWallets: (state, action) => { state.wallets = action.payload; },
    setWithdrawalRequests: (state, action) => { state.withdrawalRequests = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setWallets, setWithdrawalRequests, setLoading, setError } = walletsSlice.actions;
export default walletsSlice.reducer;