import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  businesses: [],
  pendingSellers: [],
  verifiedSellers: [],
  selectedBusiness: null,
  isLoading: false,
  isDetailLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const businessesSlice = createSlice({
  name: "businesses",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDetailLoading: (state, action) => {
      state.isDetailLoading = action.payload;
    },
    setBusinesses: (state, action) => {
      state.businesses = action.payload;
    },
    setPendingSellers: (state, action) => {
      state.pendingSellers = action.payload;
    },
    setVerifiedSellers: (state, action) => {
      state.verifiedSellers = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateBusinessInList: (state, action) => {
      const payload = action.payload;
      const bizIndex = state.businesses.findIndex((b) => b.id === payload.id);
      if (bizIndex !== -1) {
        state.businesses[bizIndex] = { ...state.businesses[bizIndex], ...payload };
      }
      const pendingIndex = state.pendingSellers.findIndex((b) => b.id === payload.id);
      if (pendingIndex !== -1) {
        if (payload.verificationStatus && payload.verificationStatus !== "PENDING") {
          state.pendingSellers.splice(pendingIndex, 1);
        } else {
          state.pendingSellers[pendingIndex] = { ...state.pendingSellers[pendingIndex], ...payload };
        }
      }
      const verifiedIndex = state.verifiedSellers.findIndex((b) => b.id === payload.id);
      if (verifiedIndex !== -1) {
        if (payload.verificationStatus && payload.verificationStatus !== "VERIFIED") {
          state.verifiedSellers.splice(verifiedIndex, 1);
        } else {
          state.verifiedSellers[verifiedIndex] = { ...state.verifiedSellers[verifiedIndex], ...payload };
        }
      }
      if (payload.verificationStatus === "VERIFIED") {
        const alreadyInVerified = state.verifiedSellers.findIndex((b) => b.id === payload.id);
        if (alreadyInVerified === -1) {
          const source = state.businesses.find((b) => b.id === payload.id);
          if (source) {
            state.verifiedSellers.push({ ...source, ...payload });
          }
        }
      }
      if (state.selectedBusiness && state.selectedBusiness.id === payload.id) {
        state.selectedBusiness = { ...state.selectedBusiness, ...payload };
      }
    },
    removeBusinessFromList: (state, action) => {
      const id = action.payload;
      state.businesses = state.businesses.filter((b) => b.id !== id);
      state.pendingSellers = state.pendingSellers.filter((b) => b.id !== id);
      state.verifiedSellers = state.verifiedSellers.filter((b) => b.id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.selectedBusiness && state.selectedBusiness.id === id) {
        state.selectedBusiness = null;
      }
    },
    setSelectedBusiness: (state, action) => {
      state.selectedBusiness = action.payload;
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
  setDetailLoading,
  setBusinesses,
  setPendingSellers,
  setVerifiedSellers,
  setPaginationMeta,
  updateBusinessInList,
  removeBusinessFromList,
  setSelectedBusiness,
  setError,
  clearError,
} = businessesSlice.actions;

export default businessesSlice.reducer;