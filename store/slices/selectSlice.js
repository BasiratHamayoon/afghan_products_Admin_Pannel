import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categoryOptions: [],
  categoryOptionsLoading: false,

  subCategoryOptions: [],
  subCategoryOptionsLoading: false,
  subCategoryOptionsForId: null, // ← track which categoryId is loaded

  productTypeOptions: [],
  productTypeOptionsLoading: false,
  productTypeOptionsForId: null, // ← track which subCategoryId is loaded
};

const selectSlice = createSlice({
  name: "select",
  initialState,
  reducers: {
    setCategoryOptions: (state, action) => {
      state.categoryOptions = action.payload;
    },
    setCategoryOptionsLoading: (state, action) => {
      state.categoryOptionsLoading = action.payload;
    },
    setSubCategoryOptions: (state, action) => {
      state.subCategoryOptions = action.payload;
    },
    setSubCategoryOptionsLoading: (state, action) => {
      state.subCategoryOptionsLoading = action.payload;
    },
    setSubCategoryOptionsForId: (state, action) => {
      state.subCategoryOptionsForId = action.payload;
    },
    clearSubCategoryOptions: (state) => {
      state.subCategoryOptions = [];
      state.subCategoryOptionsForId = null;
    },
    setProductTypeOptions: (state, action) => {
      state.productTypeOptions = action.payload;
    },
    setProductTypeOptionsLoading: (state, action) => {
      state.productTypeOptionsLoading = action.payload;
    },
    setProductTypeOptionsForId: (state, action) => {
      state.productTypeOptionsForId = action.payload;
    },
    clearProductTypeOptions: (state) => {
      state.productTypeOptions = [];
      state.productTypeOptionsForId = null;
    },
  },
});

export const {
  setCategoryOptions,
  setCategoryOptionsLoading,
  setSubCategoryOptions,
  setSubCategoryOptionsLoading,
  setSubCategoryOptionsForId,
  clearSubCategoryOptions,
  setProductTypeOptions,
  setProductTypeOptionsLoading,
  setProductTypeOptionsForId,
  clearProductTypeOptions,
} = selectSlice.actions;

export default selectSlice.reducer;