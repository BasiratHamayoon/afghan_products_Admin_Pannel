import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  transactions: [],
  wallets: [],
  withdrawals: [],
  refunds: [],
  selectedTransaction: null,
  selectedWallet: null,
  selectedWithdrawal: null,
  selectedRefund: null,
  isLoading: false,
  error: null,
  filters: { search: "", status: "all", type: "all", method: "all" },
  pagination: { page: 1, limit: 10, total: 0 },
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    setLoading: (state, action) => { state.isLoading = action.payload; },
    setTransactions: (state, action) => { state.transactions = action.payload; },
    setWallets: (state, action) => { state.wallets = action.payload; },
    setWithdrawals: (state, action) => { state.withdrawals = action.payload; },
    setRefunds: (state, action) => { state.refunds = action.payload; },
    updateTransaction: (state, action) => {
      const i = state.transactions.findIndex((t) => t.id === action.payload.id);
      if (i !== -1) state.transactions[i] = action.payload;
      if (state.selectedTransaction?.id === action.payload.id) state.selectedTransaction = action.payload;
    },
    updateWallet: (state, action) => {
      const i = state.wallets.findIndex((w) => w.id === action.payload.id);
      if (i !== -1) state.wallets[i] = action.payload;
      if (state.selectedWallet?.id === action.payload.id) state.selectedWallet = action.payload;
    },
    updateWithdrawal: (state, action) => {
      const i = state.withdrawals.findIndex((w) => w.id === action.payload.id);
      if (i !== -1) state.withdrawals[i] = action.payload;
      if (state.selectedWithdrawal?.id === action.payload.id) state.selectedWithdrawal = action.payload;
    },
    updateRefund: (state, action) => {
      const i = state.refunds.findIndex((r) => r.id === action.payload.id);
      if (i !== -1) state.refunds[i] = action.payload;
      if (state.selectedRefund?.id === action.payload.id) state.selectedRefund = action.payload;
    },
    setSelectedTransaction: (state, action) => { state.selectedTransaction = action.payload; },
    setSelectedWallet: (state, action) => { state.selectedWallet = action.payload; },
    setSelectedWithdrawal: (state, action) => { state.selectedWithdrawal = action.payload; },
    setSelectedRefund: (state, action) => { state.selectedRefund = action.payload; },
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setError: (state, action) => { state.error = action.payload; },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  setLoading, setTransactions, setWallets, setWithdrawals, setRefunds,
  updateTransaction, updateWallet, updateWithdrawal, updateRefund,
  setSelectedTransaction, setSelectedWallet, setSelectedWithdrawal, setSelectedRefund,
  setFilters, setPagination, setError, clearError,
} = paymentsSlice.actions;
export default paymentsSlice.reducer;