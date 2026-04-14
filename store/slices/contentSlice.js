"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = { banners: [], blogs: [], announcements: [], isLoading: false, error: null };

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    setBanners: (state, action) => { state.banners = action.payload; },
    setBlogs: (state, action) => { state.blogs = action.payload; },
    setAnnouncements: (state, action) => { state.announcements = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
  },
});

export const { setBanners, setBlogs, setAnnouncements, setLoading, setError } = contentSlice.actions;
export default contentSlice.reducer;