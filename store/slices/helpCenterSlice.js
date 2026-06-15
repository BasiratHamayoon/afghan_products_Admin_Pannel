import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  helpCenter: null,
  faqs: [],
  categories: [],
  contactOptions: [],
  isLoading: false,
  error: null,
};

const helpCenterSlice = createSlice({
  name: "helpCenter",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setHelpCenter: (state, action) => {
      state.helpCenter = action.payload;
      if (action.payload) {
        state.faqs = action.payload.faqs || [];
        state.categories = action.payload.categories || [];
        state.contactOptions = action.payload.contactOptions || [];
      }
    },
    setFaqs: (state, action) => {
      state.faqs = action.payload;
    },
    addFaq: (state, action) => {
      if (action.payload) state.faqs.unshift(action.payload);
    },
    updateFaqInList: (state, action) => {
      const updated = action.payload;
      if (!updated?._id && !updated?.id) return;
      const faqId = updated._id || updated.id;
      const idx = state.faqs.findIndex((f) => (f._id || f.id) === faqId);
      if (idx !== -1) state.faqs[idx] = { ...state.faqs[idx], ...updated };
    },
    removeFaqFromList: (state, action) => {
      const id = action.payload;
      state.faqs = state.faqs.filter((f) => (f._id || f.id) !== id);
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    addCategory: (state, action) => {
      if (action.payload) state.categories.unshift(action.payload);
    },
    updateCategoryInList: (state, action) => {
      const updated = action.payload;
      if (!updated?._id && !updated?.id) return;
      const catId = updated._id || updated.id;
      const idx = state.categories.findIndex((c) => (c._id || c.id) === catId);
      if (idx !== -1) state.categories[idx] = { ...state.categories[idx], ...updated };
    },
    removeCategoryFromList: (state, action) => {
      const id = action.payload;
      state.categories = state.categories.filter((c) => (c._id || c.id) !== id);
    },
    setContactOptions: (state, action) => {
      state.contactOptions = action.payload;
    },
    addContactOption: (state, action) => {
      if (action.payload) state.contactOptions.unshift(action.payload);
    },
    updateContactOptionInList: (state, action) => {
      const updated = action.payload;
      if (!updated?._id && !updated?.id) return;
      const coId = updated._id || updated.id;
      const idx = state.contactOptions.findIndex((c) => (c._id || c.id) === coId);
      if (idx !== -1) state.contactOptions[idx] = { ...state.contactOptions[idx], ...updated };
    },
    removeContactOptionFromList: (state, action) => {
      const id = action.payload;
      state.contactOptions = state.contactOptions.filter((c) => (c._id || c.id) !== id);
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
  setHelpCenter,
  setFaqs,
  addFaq,
  updateFaqInList,
  removeFaqFromList,
  setCategories,
  addCategory,
  updateCategoryInList,
  removeCategoryFromList,
  setContactOptions,
  addContactOption,
  updateContactOptionInList,
  removeContactOptionFromList,
  setError,
  clearError,
} = helpCenterSlice.actions;

export default helpCenterSlice.reducer;