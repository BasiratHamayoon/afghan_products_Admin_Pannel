import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  banners: [],
  announcements: [],
  blogs: [],
  ads: [],
  selectedBanner: null,
  selectedAnnouncement: null,
  selectedBlog: null,
  selectedAd: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    type: "all",
    category: "all",
    featured: "all",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setBanners: (state, action) => { state.banners = action.payload; },
    setAnnouncements: (state, action) => { state.announcements = action.payload; },
    setBlogs: (state, action) => { state.blogs = action.payload; },
    setAds: (state, action) => { state.ads = action.payload; },
    addBanner: (state, action) => { state.banners.unshift(action.payload); },
    addAnnouncement: (state, action) => { state.announcements.unshift(action.payload); },
    addBlog: (state, action) => { state.blogs.unshift(action.payload); },
    addAd: (state, action) => { state.ads.unshift(action.payload); },
    updateBanner: (state, action) => {
      const i = state.banners.findIndex((b) => b.id === action.payload.id);
      if (i !== -1) state.banners[i] = action.payload;
    },
    updateAnnouncement: (state, action) => {
      const i = state.announcements.findIndex((a) => a.id === action.payload.id);
      if (i !== -1) state.announcements[i] = action.payload;
    },
    updateBlog: (state, action) => {
      const i = state.blogs.findIndex((b) => b.id === action.payload.id);
      if (i !== -1) state.blogs[i] = action.payload;
    },
    updateAd: (state, action) => {
      const i = state.ads.findIndex((a) => a.id === action.payload.id);
      if (i !== -1) state.ads[i] = action.payload;
    },
    deleteBanner: (state, action) => { state.banners = state.banners.filter((b) => b.id !== action.payload); },
    deleteAnnouncement: (state, action) => { state.announcements = state.announcements.filter((a) => a.id !== action.payload); },
    deleteBlog: (state, action) => { state.blogs = state.blogs.filter((b) => b.id !== action.payload); },
    deleteAd: (state, action) => { state.ads = state.ads.filter((a) => a.id !== action.payload); },
    setSelectedBanner: (state, action) => { state.selectedBanner = action.payload; },
    setSelectedAnnouncement: (state, action) => { state.selectedAnnouncement = action.payload; },
    setSelectedBlog: (state, action) => { state.selectedBlog = action.payload; },
    setSelectedAd: (state, action) => { state.selectedAd = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setBanners, setAnnouncements, setBlogs, setAds,
  addBanner, addAnnouncement, addBlog, addAd,
  updateBanner, updateAnnouncement, updateBlog, updateAd,
  deleteBanner, deleteAnnouncement, deleteBlog, deleteAd,
  setSelectedBanner, setSelectedAnnouncement, setSelectedBlog, setSelectedAd,
  setFilters, setPagination, setError, clearError,
} = contentSlice.actions;

export default contentSlice.reducer;