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
    updateMessageInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.messages.findIndex((m) => m.id === updated.id);
      if (idx !== -1) {
        state.messages[idx] = { ...state.messages[idx], ...updated };
      }
    },
    markMessageViewed: (state, action) => {
      const id = action.payload;
      const idx = state.messages.findIndex((m) => m.id === id);
      if (idx !== -1) {
        state.messages[idx] = {
          ...state.messages[idx],
          status: state.messages[idx].status === "UNREAD" ? "READ" : state.messages[idx].status,
          isViewed: true,
        };
      }
    },
    markMessageReplied: (state, action) => {
      const id = action.payload;
      const idx = state.messages.findIndex((m) => m.id === id);
      if (idx !== -1) {
        state.messages[idx] = { ...state.messages[idx], status: "REPLIED" };
      }
    },
    archiveMessageInList: (state, action) => {
      const id = action.payload;
      const idx = state.messages.findIndex((m) => m.id === id);
      if (idx !== -1) {
        state.messages[idx] = { ...state.messages[idx], isArchived: true };
      }
    },
    unarchiveMessageInList: (state, action) => {
      const id = action.payload;
      const idx = state.messages.findIndex((m) => m.id === id);
      if (idx !== -1) {
        state.messages[idx] = { ...state.messages[idx], isArchived: false };
      }
    },
    removeMessageFromList: (state, action) => {
      state.messages = state.messages.filter((m) => m.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
  },
});

export const {
  setLoading,
  setMessages,
  setPaginationMeta,
  setError,
  clearError,
  updateMessageInList,
  markMessageViewed,
  markMessageReplied,
  archiveMessageInList,
  unarchiveMessageInList,
  removeMessageFromList,
} = contactUsSlice.actions;

export default contactUsSlice.reducer;