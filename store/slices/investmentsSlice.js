"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { investments: [], selectedInvestment: null, isLoading: false, error: null };

const investmentsSlice = createSlice({
  name: "investments",
  initialState,
  reducers: {
    setInvestments: (state, action) => { state.investments = action.payload; },
    setSelectedInvestment: (state, action) => { state.selectedInvestment = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setInvestments, setSelectedInvestment, setLoading, setError } = investmentsSlice.actions;
export default investmentsSlice.reducer;