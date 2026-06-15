import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tradeShows: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const tradeShowsSlice = createSlice({
  name: "tradeShows",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setTradeShows: (state, action) => {
      state.tradeShows = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addTradeShow: (state, action) => {
      if (action.payload) {
        state.tradeShows.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateTradeShowInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.tradeShows.findIndex((t) => t.id === updated.id);
      if (idx !== -1) {
        state.tradeShows[idx] = { ...state.tradeShows[idx], ...updated };
      }
    },
    removeTradeShowFromList: (state, action) => {
      state.tradeShows = state.tradeShows.filter(
        (t) => t.id !== action.payload
      );
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
  setTradeShows,
  setPaginationMeta,
  addTradeShow,
  updateTradeShowInList,
  removeTradeShowFromList,
  setError,
  clearError,
} = tradeShowsSlice.actions;

export default tradeShowsSlice.reducer;