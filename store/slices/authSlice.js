"use client";

import { createSlice } from "@reduxjs/toolkit";
import {
  loginWithEmail,
  logoutUser,
  getUserProfile,
  forgotPassword,
  refreshSession,
} from "@/store/actions/authActions";

const initialState = {
  user: null,
  token:
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  forgotPasswordSuccess: false,
  forgotPasswordLoading: false,
  forgotPasswordError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    clearForgotPasswordState: (state) => {
      state.forgotPasswordSuccess = false;
      state.forgotPasswordError = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {

    builder
      .addCase(loginWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });

    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Still logout locally even if API fails
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    builder
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getUserProfile.rejected, (state) => {
        state.isAuthenticated = false;
      });

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.forgotPasswordLoading = true;
        state.forgotPasswordError = null;
        state.forgotPasswordSuccess = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordSuccess = true;
        state.forgotPasswordError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.forgotPasswordLoading = false;
        state.forgotPasswordError = action.payload;
        state.forgotPasswordSuccess = false;
      });

    builder
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
  clearForgotPasswordState,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;