import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/lib/axiosInstance";

export const loginWithEmail = createAsyncThunk(
  "auth/loginWithEmail",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login_email", {
        email: credentials.email,
        password: credentials.password,
      });

      console.log("Login Response:", response.data);

      // ✅ Handle different response structures
      const token =
        response.data?.token ||
        response.data?.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.accessToken;

      const user =
        response.data?.user ||
        response.data?.data?.user ||
        response.data?.data;

      if (!token) {
        return rejectWithValue("Token not found in response");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        console.log("Token saved:", token);
      }

      return { token, user };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      console.log("Logout token:", token);

      if (!token) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        return;
      }

      await axiosInstance.post("/auth/logout");

      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    } catch (error) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      return rejectWithValue(error.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/profile");
      return response.data?.userData || response.data?.user || response.data?.data || response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/forget_password", {
        email,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/refresh_session");

      const token =
        response.data?.token ||
        response.data?.data?.token ||
        response.data?.accessToken;

      if (typeof window !== "undefined" && token) {
        localStorage.setItem("token", token);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);