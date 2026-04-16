import {
    setLoading, setDisputes, setSelectedDispute, updateDispute,
    deleteDispute, addTimelineEvent, addMessage, setError,
  } from "@/store/slices/disputesSlice";
  import { dummyDisputes } from "@/data/dummyDisputes";
  
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  
  export const fetchDisputes = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setDisputes(dummyDisputes || []));
    } catch { dispatch(setError("Failed to fetch disputes")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchDisputeById = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      const found = (dummyDisputes || []).find((d) => d.id === id) || null;
      dispatch(setSelectedDispute(found));
    } catch { dispatch(setError("Failed to fetch dispute")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const updateDisputeStatus = (id, status, note) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      const { disputes } = getState().disputes;
      const dispute = disputes.find((d) => d.id === id);
      if (!dispute) throw new Error("Dispute not found");
      const updated = {
        ...dispute,
        status,
        updatedAt: new Date().toISOString(),
        resolvedAt: status === "resolved" ? new Date().toISOString() : dispute.resolvedAt,
        escalatedAt: status === "escalated" ? new Date().toISOString() : dispute.escalatedAt,
      };
      dispatch(updateDispute(updated));
      const event = {
        id: `tl-${Date.now()}`,
        action: status,
        description: note || `Status changed to ${status}`,
        performedBy: "Admin",
        role: "admin",
        timestamp: new Date().toISOString(),
      };
      dispatch(addTimelineEvent({ disputeId: id, event }));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to update status")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const resolveDispute = (id, resolution, refundAmount) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(800);
      const { disputes } = getState().disputes;
      const dispute = disputes.find((d) => d.id === id);
      if (!dispute) throw new Error("Dispute not found");
      const updated = {
        ...dispute,
        status: "resolved",
        resolution,
        refundAmount: refundAmount || null,
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateDispute(updated));
      const event = {
        id: `tl-${Date.now()}`,
        action: "resolved",
        description: `Dispute resolved. ${resolution}`,
        performedBy: "Admin",
        role: "admin",
        timestamp: new Date().toISOString(),
      };
      dispatch(addTimelineEvent({ disputeId: id, event }));
      return { success: true, data: updated };
    } catch { dispatch(setError("Failed to resolve dispute")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const escalateDispute = (id, reason) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      const { disputes } = getState().disputes;
      const dispute = disputes.find((d) => d.id === id);
      if (!dispute) throw new Error("Dispute not found");
      const updated = {
        ...dispute,
        status: "escalated",
        escalatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateDispute(updated));
      const event = {
        id: `tl-${Date.now()}`,
        action: "escalated",
        description: reason || "Dispute escalated for senior review",
        performedBy: "Admin",
        role: "admin",
        timestamp: new Date().toISOString(),
      };
      dispatch(addTimelineEvent({ disputeId: id, event }));
      return { success: true };
    } catch { dispatch(setError("Failed to escalate dispute")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const sendDisputeMessage = (disputeId, content) => async (dispatch) => {
    try {
      await delay(300);
      const message = {
        id: `msg-${Date.now()}`,
        content,
        sender: "Admin",
        role: "admin",
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage({ disputeId, message }));
      return { success: true };
    } catch { return { success: false }; }
  };
  
  export const assignDispute = (id, adminName) => async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      const { disputes } = getState().disputes;
      const dispute = disputes.find((d) => d.id === id);
      if (!dispute) throw new Error("Dispute not found");
      const updated = {
        ...dispute,
        assignedTo: { id: `adm-${Date.now()}`, name: adminName, avatar: null },
        updatedAt: new Date().toISOString(),
      };
      dispatch(updateDispute(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to assign dispute")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };
  
  export const removeDispute = (id) => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(deleteDispute(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete dispute")); return { success: false }; }
    finally { dispatch(setLoading(false)); }
  };