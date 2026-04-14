"use client";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  selectedUser: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
  isLoading: false,
  error: null,
  filters: { search: "", role: "", status: "" },
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => { state.users = action.payload; },
    setSelectedUser: (state, action) => { state.selectedUser = action.payload; },
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setError: (state, action) => { state.error = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPage: (state, action) => { state.currentPage = action.payload; },
  },
});

export const { setUsers, setSelectedUser, setLoading, setError, setFilters, setPage } = usersSlice.actions;
export default usersSlice.reducer;