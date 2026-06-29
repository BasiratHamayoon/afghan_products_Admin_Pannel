import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  partners: [],
  partnershipRequests: [],
  isLoading: false,
  isRequestsLoading: false,
  error: null,
  partnersPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  requestsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
};

const partnersSlice = createSlice({
  name: "partners",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setRequestsLoading: (state, action) => {
      state.isRequestsLoading = action.payload;
    },
    setPartners: (state, action) => {
      state.partners = action.payload;
    },
    setPartnersPagination: (state, action) => {
      state.partnersPagination = {
        ...state.partnersPagination,
        ...action.payload,
      };
    },
    updatePartnerInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.partners.findIndex((p) => p.id === updated.id);
      if (idx !== -1) {
        state.partners[idx] = { ...state.partners[idx], ...updated };
      }
    },
    removePartnerFromList: (state, action) => {
      state.partners = state.partners.filter(
        (p) => p.id !== action.payload
      );
      state.partnersPagination.total = Math.max(
        0,
        state.partnersPagination.total - 1
      );
    },
    setPartnershipRequests: (state, action) => {
      state.partnershipRequests = action.payload;
    },
    setRequestsPagination: (state, action) => {
      state.requestsPagination = {
        ...state.requestsPagination,
        ...action.payload,
      };
    },
    updateRequestInList: (state, action) => {
      const updated = action.payload;
      if (!updated?.id) return;
      const idx = state.partnershipRequests.findIndex(
        (r) => r.id === updated.id
      );
      if (idx !== -1) {
        state.partnershipRequests[idx] = {
          ...state.partnershipRequests[idx],
          ...updated,
        };
      }
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
  setRequestsLoading,
  setPartners,
  setPartnersPagination,
  updatePartnerInList,
  removePartnerFromList,
  setPartnershipRequests,
  setRequestsPagination,
  updateRequestInList,
  setError,
  clearError,
} = partnersSlice.actions;

export default partnersSlice.reducer;