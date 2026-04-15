// store/actions/investmentsActions.js

import {
  setLoading,
  setInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  setSelectedInvestment,
  setError,
} from "@/store/slices/investmentsSlice";
import { dummyInvestments } from "@/data/dummyInvestments";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchInvestments = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(600);
    dispatch(setInvestments(dummyInvestments || []));
  } catch (err) {
    dispatch(setError("Failed to fetch investments"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const fetchInvestmentById = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(400);
    if (!id) {
      dispatch(setSelectedInvestment(null));
      return;
    }
    const found = (dummyInvestments || []).find((inv) => inv && inv.id === id) || null;
    dispatch(setSelectedInvestment(found));
  } catch (err) {
    dispatch(setError("Failed to fetch investment"));
  } finally {
    dispatch(setLoading(false));
  }
};

export const createInvestment = (data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(800);
    if (!data) throw new Error("No data provided");
    const newInv = {
      ...data,
      id: `inv-${Date.now()}`,
      investedAmount: 0,
      returnAmount: 0,
      investorsCount: 0,
      milestones: [],
      returns: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(addInvestment(newInv));
    return { success: true, data: newInv };
  } catch (err) {
    dispatch(setError("Failed to create investment"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const editInvestment = (id, data) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(600);
    if (!id || !data) throw new Error("Invalid data");
    const updated = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    dispatch(updateInvestment(updated));
    return { success: true, data: updated };
  } catch (err) {
    dispatch(setError("Failed to update investment"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};

export const removeInvestment = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await delay(500);
    if (!id) throw new Error("No ID provided");
    dispatch(deleteInvestment(id));
    return { success: true };
  } catch (err) {
    dispatch(setError("Failed to delete investment"));
    return { success: false };
  } finally {
    dispatch(setLoading(false));
  }
};