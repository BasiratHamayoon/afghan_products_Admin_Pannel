import {
    setLoading, setSaving, setGeneralSettings, setPaymentGateways,
    setEmailTemplates, setRoles, setSystemLogs, setAdminProfile,
    updateGeneralSettings, updatePaymentGateway, addPaymentGateway,
    removePaymentGateway, updateEmailTemplate, addEmailTemplate,
    removeEmailTemplate, updateRole, addRole, removeRole, updateAdminProfile, setError,
  } from "@/store/slices/settingsSlice";
  import {
    dummyGeneralSettings, dummyPaymentGateways, dummyEmailTemplates,
    dummyRoles, dummySystemLogs, dummyAdminProfile,
  } from "@/data/dummySettings";
  
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  
  export const fetchGeneralSettings = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setGeneralSettings(dummyGeneralSettings));
    } catch { dispatch(setError("Failed to fetch settings")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchPaymentGateways = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setPaymentGateways(dummyPaymentGateways));
    } catch { dispatch(setError("Failed to fetch payment gateways")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchEmailTemplates = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setEmailTemplates(dummyEmailTemplates));
    } catch { dispatch(setError("Failed to fetch email templates")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchRoles = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(500);
      dispatch(setRoles(dummyRoles));
    } catch { dispatch(setError("Failed to fetch roles")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchSystemLogs = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(600);
      dispatch(setSystemLogs(dummySystemLogs));
    } catch { dispatch(setError("Failed to fetch system logs")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const fetchAdminProfile = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
      await delay(400);
      dispatch(setAdminProfile(dummyAdminProfile));
    } catch { dispatch(setError("Failed to fetch profile")); }
    finally { dispatch(setLoading(false)); }
  };
  
  export const saveGeneralSettings = (data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(800);
      dispatch(updateGeneralSettings(data));
      return { success: true };
    } catch { dispatch(setError("Failed to save settings")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const savePaymentGateway = (id, data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(700);
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updatePaymentGateway(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to save gateway")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const createPaymentGateway = (data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(700);
      const newGateway = { ...data, id: `pg-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      dispatch(addPaymentGateway(newGateway));
      return { success: true };
    } catch { dispatch(setError("Failed to create gateway")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const deletePaymentGateway = (id) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(500);
      dispatch(removePaymentGateway(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete gateway")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const saveEmailTemplate = (id, data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(700);
      const updated = { ...data, id, updatedAt: new Date().toISOString() };
      dispatch(updateEmailTemplate(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to save template")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const createEmailTemplate = (data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(700);
      const newTemplate = { ...data, id: `et-${Date.now()}`, lastUsed: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      dispatch(addEmailTemplate(newTemplate));
      return { success: true };
    } catch { dispatch(setError("Failed to create template")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const deleteEmailTemplate = (id) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(500);
      dispatch(removeEmailTemplate(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete template")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const saveRole = (id, data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(700);
      const updated = { ...data, id };
      dispatch(updateRole(updated));
      return { success: true };
    } catch { dispatch(setError("Failed to save role")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const createRole = (data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(700);
      const newRole = { ...data, id: `role-${Date.now()}`, isSystem: false, usersCount: 0 };
      dispatch(addRole(newRole));
      return { success: true };
    } catch { dispatch(setError("Failed to create role")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const deleteRole = (id) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(500);
      dispatch(removeRole(id));
      return { success: true };
    } catch { dispatch(setError("Failed to delete role")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };
  
  export const saveAdminProfile = (data) => async (dispatch) => {
    dispatch(setSaving(true));
    try {
      await delay(700);
      dispatch(updateAdminProfile(data));
      return { success: true };
    } catch { dispatch(setError("Failed to save profile")); return { success: false }; }
    finally { dispatch(setSaving(false)); }
  };