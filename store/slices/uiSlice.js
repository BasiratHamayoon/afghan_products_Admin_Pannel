"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isPageLoading: false,
  modalOpen: null,
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setPageLoading: (state, action) => {
      state.isPageLoading = action.payload;
    },
    openModal: (state, action) => {
      state.modalOpen = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = null;
    },
    setBreadcrumbs: (state, action) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const { setPageLoading, openModal, closeModal, setBreadcrumbs } = uiSlice.actions;
export default uiSlice.reducer;