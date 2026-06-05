import axiosInstance from "@/lib/axiosInstance";
import { setAdminProfile, setProfileLoading } from "@/store/slices/settingsSlice";

export const fetchAdminProfile = () => async (dispatch) => {
  dispatch(setProfileLoading(true));
  try {
    const res = await axiosInstance.get("/auth/profile");
    const user = res.data?.userData || res.data?.user || res.data?.data || res.data;
    dispatch(setAdminProfile(user));
    return { success: true, data: user };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message,
    };
  } finally {
    dispatch(setProfileLoading(false));
  }
};

export const updateAdminProfile = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch("/auth/profile", data);
    const user = res.data?.userData || res.data?.user || res.data?.data || res.data;
    dispatch(setAdminProfile(user));
    return { success: true, data: user };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to update profile",
    };
  }
};

export const changeAdminPassword = (data) => async () => {
  try {
    await axiosInstance.patch("/users/change_password", data);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to change password",
    };
  }
};

export const fetchGeneralSettings = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/settings/general");
    const data = res.data?.data || res.data;
    dispatch({ type: "settings/setGeneralSettings", payload: data });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to fetch general settings",
    };
  }
};

export const saveGeneralSettings = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch("/settings/general", data);
    const updated = res.data?.data || res.data;
    dispatch({ type: "settings/setGeneralSettings", payload: updated });
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to save general settings",
    };
  }
};

export const fetchEmailTemplates = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/settings/email-templates");
    const data = res.data?.data || res.data?.templates || res.data;
    dispatch({ type: "settings/setEmailTemplates", payload: data });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to fetch email templates",
    };
  }
};

export const saveEmailTemplate = (id, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/settings/email-templates/${id}`, data);
    const updated = res.data?.data || res.data;
    dispatch({ type: "settings/updateEmailTemplate", payload: updated });
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to save email template",
    };
  }
};

export const createEmailTemplate = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/settings/email-templates", data);
    const created = res.data?.data || res.data;
    dispatch({ type: "settings/addEmailTemplate", payload: created });
    return { success: true, data: created };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create email template",
    };
  }
};

export const deleteEmailTemplate = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/settings/email-templates/${id}`);
    dispatch({ type: "settings/removeEmailTemplate", payload: id });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete email template",
    };
  }
};

export const fetchPaymentGateways = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/settings/payment-gateways");
    const data = res.data?.data || res.data?.gateways || res.data;
    dispatch({ type: "settings/setPaymentGateways", payload: data });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to fetch payment gateways",
    };
  }
};

export const savePaymentGateway = (id, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/settings/payment-gateways/${id}`, data);
    const updated = res.data?.data || res.data;
    dispatch({ type: "settings/updatePaymentGateway", payload: updated });
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to save payment gateway",
    };
  }
};

export const createPaymentGateway = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/settings/payment-gateways", data);
    const created = res.data?.data || res.data;
    dispatch({ type: "settings/addPaymentGateway", payload: created });
    return { success: true, data: created };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create payment gateway",
    };
  }
};

export const deletePaymentGateway = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/settings/payment-gateways/${id}`);
    dispatch({ type: "settings/removePaymentGateway", payload: id });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete payment gateway",
    };
  }
};

export const fetchRoles = () => async (dispatch) => {
  try {
    const res = await axiosInstance.get("/settings/roles");
    const data = res.data?.data || res.data?.roles || res.data;
    dispatch({ type: "settings/setRoles", payload: data });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to fetch roles",
    };
  }
};

export const saveRole = (id, data) => async (dispatch) => {
  try {
    const res = await axiosInstance.patch(`/settings/roles/${id}`, data);
    const updated = res.data?.data || res.data;
    dispatch({ type: "settings/updateRole", payload: updated });
    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to save role",
    };
  }
};

export const createRole = (data) => async (dispatch) => {
  try {
    const res = await axiosInstance.post("/settings/roles", data);
    const created = res.data?.data || res.data;
    dispatch({ type: "settings/addRole", payload: created });
    return { success: true, data: created };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to create role",
    };
  }
};

export const deleteRole = (id) => async (dispatch) => {
  try {
    await axiosInstance.delete(`/settings/roles/${id}`);
    dispatch({ type: "settings/removeRole", payload: id });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to delete role",
    };
  }
};

export const fetchSystemLogs = (params = {}) => async (dispatch) => {
  try {
    const { page = 1, limit = 10, search = "", level, module: mod } = params;
    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", String(limit));
    if (search) query.set("search", search);
    if (level && level !== "all") query.set("level", level);
    if (mod && mod !== "all") query.set("module", mod);

    const res = await axiosInstance.get(`/settings/system-logs?${query.toString()}`);
    const data = res.data?.data || res.data?.logs || res.data;
    dispatch({ type: "settings/setSystemLogs", payload: data });
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to fetch system logs",
    };
  }
};