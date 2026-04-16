import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  generalSettings: null,
  paymentGateways: [],
  emailTemplates: [],
  roles: [],
  systemLogs: [],
  adminProfile: null,
  isLoading: false,
  isSaving: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setSaving: (state, action) => { state.isSaving = action.payload; },
    setGeneralSettings: (state, action) => { state.generalSettings = action.payload; },
    setPaymentGateways: (state, action) => { state.paymentGateways = action.payload; },
    setEmailTemplates: (state, action) => { state.emailTemplates = action.payload; },
    setRoles: (state, action) => { state.roles = action.payload; },
    setSystemLogs: (state, action) => { state.systemLogs = action.payload; },
    setAdminProfile: (state, action) => { state.adminProfile = action.payload; },
    updateGeneralSettings: (state, action) => { state.generalSettings = { ...state.generalSettings, ...action.payload }; },
    updatePaymentGateway: (state, action) => {
      const i = state.paymentGateways.findIndex((g) => g.id === action.payload.id);
      if (i !== -1) state.paymentGateways[i] = action.payload;
    },
    addPaymentGateway: (state, action) => { state.paymentGateways.push(action.payload); },
    removePaymentGateway: (state, action) => { state.paymentGateways = state.paymentGateways.filter((g) => g.id !== action.payload); },
    updateEmailTemplate: (state, action) => {
      const i = state.emailTemplates.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.emailTemplates[i] = action.payload;
    },
    addEmailTemplate: (state, action) => { state.emailTemplates.unshift(action.payload); },
    removeEmailTemplate: (state, action) => { state.emailTemplates = state.emailTemplates.filter((t) => t.id !== action.payload); },
    updateRole: (state, action) => {
      const i = state.roles.findIndex((r) => r.id === action.payload.id);
      if (i !== -1) state.roles[i] = action.payload;
    },
    addRole: (state, action) => { state.roles.push(action.payload); },
    removeRole: (state, action) => { state.roles = state.roles.filter((r) => r.id !== action.payload); },
    updateAdminProfile: (state, action) => { state.adminProfile = { ...state.adminProfile, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setSaving, setGeneralSettings, setPaymentGateways,
  setEmailTemplates, setRoles, setSystemLogs, setAdminProfile,
  updateGeneralSettings, updatePaymentGateway, addPaymentGateway,
  removePaymentGateway, updateEmailTemplate, addEmailTemplate,
  removeEmailTemplate, updateRole, addRole, removeRole,
  updateAdminProfile, setError, clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;