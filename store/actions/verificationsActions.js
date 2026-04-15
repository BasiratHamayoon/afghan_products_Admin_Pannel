import {
    setLoading, setVerifications, updateVerification,
    deleteVerification, setSelectedVerification, setError,
  } from "@/store/slices/verificationsSlice";
  import { dummyVerifications } from "@/data/dummyVerifications";
  
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  
  export const fetchVerifications = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setVerifications(dummyVerifications || []));
    } catch { dispatch(setError("Failed to fetch verifications")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchVerificationById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      if (!id) { dispatch(setSelectedVerification(null)); return; }
      const found = (dummyVerifications || []).find((v) => v && v.id === id) || null;
      dispatch(setSelectedVerification(found));
    } catch { dispatch(setError("Failed to fetch verification")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const approveVerification = (id, reviewedBy = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(700);
      const ver = getState().verifications.verifications.find((v) => v.id === id);
      if (!ver) throw new Error("Not found");
      const updated = {
        ...ver,
        status: "approved",
        reviewedAt: new Date().toISOString(),
        reviewedBy,
        updatedAt: new Date().toISOString(),
        documents: ver.documents.map((d) => ({ ...d, verified: true })),
      };
      dispatch(updateVerification(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to approve")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const rejectVerification = (id, reason, reviewedBy = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(700);
      const ver = getState().verifications.verifications.find((v) => v.id === id);
      if (!ver) throw new Error("Not found");
      const updated = {
        ...ver,
        status: "rejected",
        rejectionReason: reason,
        reviewedAt: new Date().toISOString(),
        reviewedBy,
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateVerification(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to reject")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const requestMoreInfo = (id, note, author = "Admin") => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const ver = getState().verifications.verifications.find((v) => v.id === id);
      if (!ver) throw new Error("Not found");
      const newNote = {
        id: `note-${Date.now()}`,
        text: note,
        author,
        createdAt: new Date().toISOString(),
      };
      const updated = {
        ...ver,
        notes: [...(ver.notes || []), newNote],
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateVerification(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to add note")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const verifyDocument = (verificationId, documentId) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      const ver = getState().verifications.verifications.find((v) => v.id === verificationId);
      if (!ver) throw new Error("Not found");
      const updated = {
        ...ver,
        documents: ver.documents.map((d) =>
          d.id === documentId ? { ...d, verified: !d.verified } : d
        ),
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateVerification(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to verify document")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeVerification = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(deleteVerification(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };