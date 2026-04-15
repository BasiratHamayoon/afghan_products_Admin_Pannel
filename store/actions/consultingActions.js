import {
    setLoading,
    setConsultants,
    setSessions,
    setRequests,
    addConsultant,
    updateConsultant,
    deleteConsultant,
    updateSession,
    deleteSession,
    updateRequest,
    deleteRequest,
    setSelectedConsultant,
    setSelectedSession,
    setSelectedRequest,
    setError,
  } from "@/store/slices/consultingSlice";
  import { dummyConsultants, dummySessions, dummyRequests } from "@/data/dummyConsulting";
  
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  
  export const fetchConsultants = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setConsultants(dummyConsultants || []));
    } catch {
      dispatch(setError("Failed to fetch consultants"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const fetchSessions = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setSessions(dummySessions || []));
    } catch {
      dispatch(setError("Failed to fetch sessions"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const fetchRequests = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setRequests(dummyRequests || []));
    } catch {
      dispatch(setError("Failed to fetch requests"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const fetchConsultantById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      if (!id) { dispatch(setSelectedConsultant(null)); return; }
      const found = (dummyConsultants || []).find((c) => c && c.id === id) || null;
      dispatch(setSelectedConsultant(found));
    } catch {
      dispatch(setError("Failed to fetch consultant"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const fetchSessionById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      if (!id) { dispatch(setSelectedSession(null)); return; }
      const found = (dummySessions || []).find((s) => s && s.id === id) || null;
      dispatch(setSelectedSession(found));
    } catch {
      dispatch(setError("Failed to fetch session"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const fetchRequestById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      if (!id) { dispatch(setSelectedRequest(null)); return; }
      const found = (dummyRequests || []).find((r) => r && r.id === id) || null;
      dispatch(setSelectedRequest(found));
    } catch {
      dispatch(setError("Failed to fetch request"));
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const createConsultant = (data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      if (!data) throw new Error("No data provided");
      const newCon = {
        ...data,
        id: `con-${Date.now()}`,
        rating: 0,
        reviewsCount: 0,
        sessionsCompleted: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(addConsultant(newCon));
      return { success: true, data: newCon };
    } catch {
      dispatch(setError("Failed to create consultant"));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const editConsultant = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      if (!id || !data) throw new Error("Invalid data");
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateConsultant(updated));
      return { success: true, data: updated };
    } catch {
      dispatch(setError("Failed to update consultant"));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const removeConsultant = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      if (!id) throw new Error("No ID provided");
      dispatch(deleteConsultant(id));
      return { success: true };
    } catch {
      dispatch(setError("Failed to delete consultant"));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const editSession = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      if (!id || !data) throw new Error("Invalid data");
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateSession(updated));
      return { success: true, data: updated };
    } catch {
      dispatch(setError("Failed to update session"));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const removeSession = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      if (!id) throw new Error("No ID provided");
      dispatch(deleteSession(id));
      return { success: true };
    } catch {
      dispatch(setError("Failed to delete session"));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const editRequest = (id, data) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      if (!id || !data) throw new Error("Invalid data");
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateRequest(updated));
      return { success: true, data: updated };
    } catch {
      dispatch(setError("Failed to update request"));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  export const removeRequest = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      if (!id) throw new Error("No ID provided");
      dispatch(deleteRequest(id));
      return { success: true };
    } catch {
      dispatch(setError("Failed to delete request"));
      return { success: false };
    } finally {
      dispatch(setLoading(false));
    }
  };