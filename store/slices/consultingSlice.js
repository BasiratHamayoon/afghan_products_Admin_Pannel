"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { consultants: [], sessions: [], requests: [], isLoading: false, error: null };

const consultingSlice = createSlice({
  name: "consulting",
  initialState,
  reducers: {
    setConsultants: (state, action) => { state.consultants = action.payload; },
    setSessions: (state, action) => { state.sessions = action.payload; },
    setRequests: (state, action) => { state.requests = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setConsultants, setSessions, setRequests, setLoading, setError } = consultingSlice.actions;
export default consultingSlice.reducer;