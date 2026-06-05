import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  reviews: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateReviewInList: (state, action) => {
      const index = state.reviews.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = { ...state.reviews[index], ...action.payload };
      }
    },
    toggleReviewVisibility: (state, action) => {
      const index = state.reviews.findIndex((r) => r.id === action.payload);
      if (index !== -1) {
        state.reviews[index].isVisible = !state.reviews[index].isVisible;
      }
    },
    removeReview: (state, action) => {
      state.reviews = state.reviews.filter((r) => r.id !== action.payload);
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
  setReviews,
  setPaginationMeta,
  updateReviewInList,
  toggleReviewVisibility,
  removeReview,
  setError,
  clearError,
} = reviewsSlice.actions;

export default reviewsSlice.reducer;