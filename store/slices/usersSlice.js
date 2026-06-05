import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  selectedUser: null,
  stats: null,
  isLoading: false,
  isStatsLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setStatsLoading: (state, action) => {
      state.isStatsLoading = action.payload;
    },
    setUsers: (state, action) => {
      state.users = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    updateUserInList: (state, action) => {
      const payload = action.payload;
      if (!payload?.id) return;
      const index = state.users.findIndex((u) => u.id === payload.id);
      if (index !== -1) {
        state.users[index] = { ...state.users[index], ...payload };
      }
      if (state.selectedUser?.id === payload.id) {
        state.selectedUser = { ...state.selectedUser, ...payload };
      }
    },
    removeUserFromList: (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.selectedUser?.id === action.payload) {
        state.selectedUser = null;
      }
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
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
  setStatsLoading,
  setUsers,
  setStats,
  setPaginationMeta,
  updateUserInList,
  removeUserFromList,
  setSelectedUser,
  setError,
  clearError,
} = usersSlice.actions;

export default usersSlice.reducer;