"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { sellers: [], selectedSeller: null, isLoading: false, error: null };

const sellersSlice = createSlice({
  name: "sellers",
  initialState,
  reducers: {
    setSellers: (state, action) => { state.sellers = action.payload; },
    setSelectedSeller: (state, action) => { state.selectedSeller = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setSellers, setSelectedSeller, setLoading, setError } = sellersSlice.actions;
export default sellersSlice.reducer;