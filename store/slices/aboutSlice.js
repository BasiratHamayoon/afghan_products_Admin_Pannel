import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  isLoading: false,
  isStatsLoading: false,
  stats: null,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStatsLoading: (state, action) => {
      state.isStatsLoading = action.payload;
    },
    setItems: (state, action) => {
      state.items = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addItem: (state, action) => {
      if (action.payload) {
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateItemInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.items.findIndex((i) => i.id === updated.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...updated };
      }
    },
    removeItemFromList: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
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
  setStatsLoading,
  setItems,
  setStats,
  setPaginationMeta,
  addItem,
  updateItemInList,
  removeItemFromList,
  setError,
  clearError,
} = aboutSlice.actions;

export default aboutSlice.reducer;