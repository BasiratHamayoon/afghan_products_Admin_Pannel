import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  selectedOrder: null,
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

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDetailLoading: (state, action) => {
      state.isDetailLoading = action.payload;
    },
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setPaginationMeta: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    updateOrderInList: (state, action) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = { ...state.orders[index], ...action.payload };
      }
      if (state.selectedOrder?.id === action.payload.id) {
        state.selectedOrder = { ...state.selectedOrder, ...action.payload };
      }
    },
    removeOrderFromList: (state, action) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
      if (state.selectedOrder?.id === action.payload) {
        state.selectedOrder = null;
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
  setDetailLoading,
  setOrders,
  setPaginationMeta,
  setSelectedOrder,
  updateOrderInList,
  removeOrderFromList,
  setError,
  clearError,
} = ordersSlice.actions;

export default ordersSlice.reducer;