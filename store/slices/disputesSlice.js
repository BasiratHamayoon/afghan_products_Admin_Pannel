import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  disputes: [],
  selectedDispute: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    type: "all",
    priority: "all",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

const disputesSlice = createSlice({
  name: "disputes",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setDisputes: (state, action) => { state.disputes = action.payload; },
    setSelectedDispute: (state, action) => { state.selectedDispute = action.payload; },
    addDispute: (state, action) => { state.disputes.unshift(action.payload); },
    updateDispute: (state, action) => {
      const i = state.disputes.findIndex((d) => d.id === action.payload.id);
      if (i !== -1) state.disputes[i] = action.payload;
      if (state.selectedDispute?.id === action.payload.id) state.selectedDispute = action.payload;
    },
    deleteDispute: (state, action) => {
      state.disputes = state.disputes.filter((d) => d.id !== action.payload);
    },
    addTimelineEvent: (state, action) => {
      const { disputeId, event } = action.payload;
      const i = state.disputes.findIndex((d) => d.id === disputeId);
      if (i !== -1) state.disputes[i].timeline.push(event);
      if (state.selectedDispute?.id === disputeId) state.selectedDispute.timeline.push(event);
    },
    addMessage: (state, action) => {
      const { disputeId, message } = action.payload;
      const i = state.disputes.findIndex((d) => d.id === disputeId);
      if (i !== -1) state.disputes[i].messages.push(message);
      if (state.selectedDispute?.id === disputeId) state.selectedDispute.messages.push(message);
    },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setDisputes, setSelectedDispute, addDispute,
  updateDispute, deleteDispute, addTimelineEvent, addMessage,
  setFilters, setPagination, setError, clearError,
} = disputesSlice.actions;

export default disputesSlice.reducer;