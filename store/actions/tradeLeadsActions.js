import {
    setLoading, setTradeLeads, addTradeLead, updateTradeLead,
    deleteTradeLead, setSelectedLead, setError,
  } from "@/store/slices/tradeLeadsSlice";
  import { dummyTradeLeads } from "@/data/dummyTradeLeads";
  
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  
  export const fetchTradeLeads = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setTradeLeads(dummyTradeLeads || []));
    } catch { dispatch(setError("Failed to fetch trade leads")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchTradeLeadById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      if (!id) { dispatch(setSelectedLead(null)); return; }
      const found = (dummyTradeLeads || []).find((t) => t && t.id === id) || null;
      dispatch(setSelectedLead(found));
    } catch { dispatch(setError("Failed to fetch trade lead")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const createTradeLead = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const newLead = {
        ...data,
        id: `lead-${Date.now()}`,
        responses: 0, views: 0, reportCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addTradeLead(newLead));
      return { success: true, data: newLead };
    } catch { dispatch(setError("Failed to create")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const editTradeLead = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      if (!id || !data) throw new Error("Invalid");
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateTradeLead(updated));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeTradeLead = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      if (!id) throw new Error("No ID");
      dispatch(deleteTradeLead(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const approveTradeLead = (id) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const lead = getState().tradeLeads.tradeLeads.find((t) => t.id === id);
      if (!lead) throw new Error("Not found");
      dispatch(updateTradeLead({ ...lead, status: "active", updatedAt: new Date().toISOString() }));
      return { success: true };
    } catch { dispatch(setError("Failed to approve")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const closeTradeLead = (id) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const lead = getState().tradeLeads.tradeLeads.find((t) => t.id === id);
      if (!lead) throw new Error("Not found");
      dispatch(updateTradeLead({ ...lead, status: "closed", updatedAt: new Date().toISOString() }));
      return { success: true };
    } catch { dispatch(setError("Failed to close")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };