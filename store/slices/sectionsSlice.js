import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sections: [],
  selectedSection: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const sectionsSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSections: (state, action) => {
      state.sections = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    addSection: (state, action) => {
      if (action.payload) {
        state.sections.unshift(action.payload);
        state.pagination.total += 1;
      }
    },
    updateSectionInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const index = state.sections.findIndex((s) => s.id === updated.id);
      if (index !== -1) {
        state.sections[index] = { ...state.sections[index], ...updated };
      }
      if (state.selectedSection?.id === updated.id) {
        state.selectedSection = { ...state.selectedSection, ...updated };
      }
    },
    archiveSectionInList: (state, action) => {
      const index = state.sections.findIndex((s) => s.id === action.payload);
      if (index !== -1) state.sections[index].isArchived = true;
      if (state.selectedSection?.id === action.payload) {
        state.selectedSection = {
          ...state.selectedSection,
          isArchived: true,
        };
      }
    },
    unarchiveSectionInList: (state, action) => {
      const index = state.sections.findIndex((s) => s.id === action.payload);
      if (index !== -1) state.sections[index].isArchived = false;
      if (state.selectedSection?.id === action.payload) {
        state.selectedSection = {
          ...state.selectedSection,
          isArchived: false,
        };
      }
    },
    updateSectionProducts: (state, action) => {
      const index = state.sections.findIndex(
        (s) => s.id === action.payload.id
      );
      if (index !== -1) {
        state.sections[index] = {
          ...state.sections[index],
          products: action.payload.products,
        };
      }
      if (state.selectedSection?.id === action.payload.id) {
        state.selectedSection = {
          ...state.selectedSection,
          products: action.payload.products,
        };
      }
    },
    deleteSection: (state, action) => {
      state.sections = state.sections.filter((s) => s.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    setSelectedSection: (state, action) => {
      state.selectedSection = action.payload;
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
  setSections,
  setPaginationMeta,
  addSection,
  updateSectionInList,
  archiveSectionInList,
  unarchiveSectionInList,
  updateSectionProducts,
  deleteSection,
  setSelectedSection,
  setError,
  clearError,
} = sectionsSlice.actions;

export default sectionsSlice.reducer;