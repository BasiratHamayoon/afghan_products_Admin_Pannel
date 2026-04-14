"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { ads: [], selectedAd: null, isLoading: false, error: null };

const adsSlice = createSlice({
  name: "ads",
  initialState,
  reducers: {
    setAds: (state, action) => { state.ads = action.payload; },
    setSelectedAd: (state, action) => { state.selectedAd = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setAds, setSelectedAd, setLoading, setError } = adsSlice.actions;
export default adsSlice.reducer;