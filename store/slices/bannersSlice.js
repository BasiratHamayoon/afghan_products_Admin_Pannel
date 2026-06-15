import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  banners: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const bannersSlice = createSlice({
  name: "banners",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setBanners: (state, action) => {
      state.banners = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addBanner: (state, action) => {
      if (action.payload) {
        state.banners.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateBannerInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.banners.findIndex((b) => b.id === updated.id);
      if (idx !== -1) {
        state.banners[idx] = { ...state.banners[idx], ...updated };
      }
    },
    removeBannerFromList: (state, action) => {
      state.banners = state.banners.filter((b) => b.id !== action.payload);
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
  setBanners,
  setPaginationMeta,
  addBanner,
  updateBannerInList,
  removeBannerFromList,
  setError,
  clearError,
} = bannersSlice.actions;

export default bannersSlice.reducer;