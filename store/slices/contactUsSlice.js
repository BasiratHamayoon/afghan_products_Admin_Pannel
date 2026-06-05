import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const contactUsSlice = createSlice({
  name: "contactUs",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
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
  setLoading,
  setMessages,
  setPaginationMeta,
  setError,
  clearError,
} = contactUsSlice.actions;

export default contactUsSlice.reducer;