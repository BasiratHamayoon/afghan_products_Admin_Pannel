import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  filters: {
    search: "",
    status: "all",
    role: "all",
    verified: "all",
  },
  pagination: { page: 1, limit: 10, total: 0 },
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setUsers: (state, action) => { state.users = action.payload; },
    addUser: (state, action) => { state.users.unshift(action.payload); },
    updateUser: (state, action) => {
      const i = state.users.findIndex((u) => u.id === action.payload.id);
      if (i !== -1) state.users[i] = action.payload;
    },
    deleteUser: (state, action) => {
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    setSelectedUser: (state, action) => { state.selectedUser = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setUsers, addUser, updateUser,
  deleteUser, setSelectedUser, setFilters,
  setPagination, setError, clearError,
} = usersSlice.actions;
export default usersSlice.reducer;