import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  stats: null,
  statsLoading: false,
  statsError: null,

  revenueData: [],
  categories: [],
  revenueLoading: false,
  revenueError: null,
  selectedRevenueYear: new Date().getFullYear(),

  userYearData: [],
  pendingItems: [],
  userYearLoading: false,
  userYearError: null,
  selectedUserYear: new Date().getFullYear(),
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setStatsLoading: (state, action) => { state.statsLoading = action.payload; },
    setStats: (state, action) => { state.stats = action.payload; },
    setStatsError: (state, action) => { state.statsError = action.payload; },
    setRevenueLoading: (state, action) => { state.revenueLoading = action.payload; },
    setRevenueData: (state, action) => { state.revenueData = action.payload; },
    setCategories: (state, action) => { state.categories = action.payload; },
    setRevenueError: (state, action) => { state.revenueError = action.payload; },
    setSelectedRevenueYear: (state, action) => { state.selectedRevenueYear = action.payload; },
    setUserYearLoading: (state, action) => { state.userYearLoading = action.payload; },
    setUserYearData: (state, action) => { state.userYearData = action.payload; },
    setPendingItems: (state, action) => { state.pendingItems = action.payload; },
    setUserYearError: (state, action) => { state.userYearError = action.payload; },
    setSelectedUserYear: (state, action) => { state.selectedUserYear = action.payload; },
  },
});

export const {
  setStatsLoading, setStats, setStatsError,
  setRevenueLoading, setRevenueData, setCategories, setRevenueError, setSelectedRevenueYear,
  setUserYearLoading, setUserYearData, setPendingItems, setUserYearError, setSelectedUserYear,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;