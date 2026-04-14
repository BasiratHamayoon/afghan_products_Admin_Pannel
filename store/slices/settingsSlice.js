"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { generalSettings: {}, emailTemplates: [], paymentGateways: [], roles: [], isLoading: false, error: null };

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setGeneralSettings: (state, action) => { state.generalSettings = action.payload; },
    setEmailTemplates: (state, action) => { state.emailTemplates = action.payload; },
    setPaymentGateways: (state, action) => { state.paymentGateways = action.payload; },
    setRoles: (state, action) => { state.roles = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setGeneralSettings, setEmailTemplates, setPaymentGateways, setRoles, setLoading, setError } = settingsSlice.actions;
export default settingsSlice.reducer;