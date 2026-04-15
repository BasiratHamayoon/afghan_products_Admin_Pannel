import {
    setLoading, setTransactions, setWallets, setWithdrawals, setRefunds,
    updateTransaction, updateWallet, updateWithdrawal, updateRefund,
    setSelectedTransaction, setSelectedWallet, setError,
  } from "@/store/slices/paymentsSlice";
  import { dummyTransactions, dummyWallets, dummyWithdrawals, dummyRefunds } from "@/data/dummyPayments";
  
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  
  export const fetchTransactions = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setTransactions(dummyTransactions || []));
    } catch { dispatch(setError("Failed to fetch transactions")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchWallets = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setWallets(dummyWallets || []));
    } catch { dispatch(setError("Failed to fetch wallets")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchWithdrawals = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setWithdrawals(dummyWithdrawals || []));
    } catch { dispatch(setError("Failed to fetch withdrawals")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchRefunds = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setRefunds(dummyRefunds || []));
    } catch { dispatch(setError("Failed to fetch refunds")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const approveWithdrawal = (id, adminNote, processedBy = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(700);
      const wd = getState().payments.withdrawals.find((w) => w.id === id);
      if (!wd) throw new Error("Not found");
      dispatch(updateWithdrawal({ ...wd, status: "completed", adminNote, processedBy, processedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      return { success: true };
    } catch { dispatch(setError("Failed to approve")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const rejectWithdrawal = (id, adminNote, processedBy = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(700);
      const wd = getState().payments.withdrawals.find((w) => w.id === id);
      if (!wd) throw new Error("Not found");
      dispatch(updateWithdrawal({ ...wd, status: "rejected", adminNote, processedBy, processedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      return { success: true };
    } catch { dispatch(setError("Failed to reject")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const approveRefund = (id, adminNote, processedBy = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(700);
      const ref = getState().payments.refunds.find((r) => r.id === id);
      if (!ref) throw new Error("Not found");
      dispatch(updateRefund({ ...ref, status: "approved", adminNote, processedBy, processedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      return { success: true };
    } catch { dispatch(setError("Failed to approve refund")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const rejectRefund = (id, adminNote, processedBy = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(700);
      const ref = getState().payments.refunds.find((r) => r.id === id);
      if (!ref) throw new Error("Not found");
      dispatch(updateRefund({ ...ref, status: "rejected", adminNote, processedBy, processedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
      return { success: true };
    } catch { dispatch(setError("Failed to reject refund")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const freezeWallet = (id, processedBy = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const wallet = getState().payments.wallets.find((w) => w.id === id);
      if (!wallet) throw new Error("Not found");
      const frozen = !wallet.frozen;
      dispatch(updateWallet({ ...wallet, frozen, status: frozen ? "frozen" : "active", updatedAt: new Date().toISOString() }));
      return { success: true, frozen };
    } catch { dispatch(setError("Failed to update wallet")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };