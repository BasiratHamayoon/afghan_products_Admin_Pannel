import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  adminProfile: null,
  isProfileLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setAdminProfile: (state, action) => {
      state.adminProfile = action.payload;
    },
    setProfileLoading: (state, action) => {
      state.isProfileLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setAdminProfile,
  setProfileLoading,
  setError,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;