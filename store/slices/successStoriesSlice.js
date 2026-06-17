import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stories: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const successStoriesSlice = createSlice({
  name: "successStories",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStories: (state, action) => {
      state.stories = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addStory: (state, action) => {
      if (action.payload) {
        state.stories.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateStoryInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.stories.findIndex((s) => s.id === updated.id);
      if (idx !== -1) {
        state.stories[idx] = { ...state.stories[idx], ...updated };
      }
    },
    removeStoryFromList: (state, action) => {
      state.stories = state.stories.filter((s) => s.id !== action.payload);
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
  setStories,
  setPaginationMeta,
  addStory,
  updateStoryInList,
  removeStoryFromList,
  setError,
  clearError,
} = successStoriesSlice.actions;

export default successStoriesSlice.reducer;